// Three-Stage HTML Generation Service
import { GenerationRequest, Stage1Result, ImageRequest, ImageResult, GenerationProgress, CloudflareBindings } from '../types';
import { PromptService } from './PromptService';
import { ImageGenerationService } from './ImageGenerationService';

export class GenerationService {
  private db: D1Database;
  
  constructor(bindings: CloudflareBindings) {
    this.db = bindings.DB;
  }

  // 主生成流程
  async generateWebsite(request: GenerationRequest, onProgress?: (progress: GenerationProgress) => void): Promise<string> {
    try {
      // 创建项目记录
      const projectId = await this.createProject(request);
      
      // 阶段1：生成HTML骨架
      onProgress?.({
        stage: 'stage1_html',
        progress: 10,
        message: '正在分析需求并生成HTML结构...'
      });
      
      const stage1Result = await this.stage1GenerateHTML(request, projectId);
      
      onProgress?.({
        stage: 'stage1_html',
        progress: 30,
        message: 'HTML结构生成完成，开始生成图片...',
        data: stage1Result
      });
      
      // 阶段2：并行生成图片
      const imageResults = await this.stage2GenerateImages(
        stage1Result.imageRequests,
        request.modelConfig,
        projectId,
        (imageProgress) => {
          onProgress?.({
            stage: 'stage2_images',
            progress: 30 + (imageProgress.completed / imageProgress.total) * 50,
            message: `正在生成图片... (${imageProgress.completed}/${imageProgress.total})`
          });
        }
      );
      
      // 阶段3：组装最终HTML
      onProgress?.({
        stage: 'stage3_assembly',
        progress: 85,
        message: '正在组装最终HTML...'
      });
      
      const finalHTML = await this.stage3AssembleHTML(
        stage1Result,
        imageResults,
        projectId
      );
      
      // 更新项目状态
      await this.updateProjectStatus(projectId, 'completed', finalHTML, 100);
      
      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: '网页生成完成！'
      });
      
      return finalHTML;
      
    } catch (error) {
      console.error('Generation failed:', error);
      throw new Error(`生成失败: ${error.message}`);
    }
  }

  // 阶段1：生成HTML骨架
  private async stage1GenerateHTML(request: GenerationRequest, projectId: number): Promise<Stage1Result> {
    const analysis = PromptService.analyzeUserInput(request.userPrompt, request.pageConfig.pageType);
    const enhancedPrompt = PromptService.generateProfessionalPrompt(
      request.userPrompt,
      request.pageConfig,
      analysis
    );

    // 调用LLM生成HTML
    const htmlResponse = await this.callLLMModel(
      enhancedPrompt,
      request.modelConfig.textModelProvider,
      request.modelConfig.textModelName,
      request.modelConfig.textApiKey
    );

    // 解析响应
    const htmlSkeleton = this.extractHTML(htmlResponse);
    const imageRequests = PromptService.generateImagePrompts(htmlSkeleton);
    const seoData = this.extractSEOData(htmlSkeleton);

    // 记录生成日志
    await this.logGeneration(projectId, 'stage1_html', request.modelConfig.textModelProvider, 
      request.modelConfig.textModelName, enhancedPrompt, htmlResponse, true);

    return {
      htmlSkeleton,
      imageRequests: imageRequests.map((img, index) => ({
        id: `image_${index + 1}`,
        placeholder: `{{IMAGE_PLACEHOLDER_${index + 1}}}`,
        description: img.description,
        style: img.style as any,
        aspectRatio: img.aspectRatio as any,
        alt: img.alt
      })),
      seoData,
      contentMeta: analysis
    };
  }

  // 阶段2：并行生成图片
  private async stage2GenerateImages(
    imageRequests: ImageRequest[],
    modelConfig: any,
    projectId: number,
    onProgress?: (progress: { completed: number; total: number }) => void
  ): Promise<Record<string, ImageResult>> {
    const imageService = new ImageGenerationService();
    const results: Record<string, ImageResult> = {};
    let completed = 0;

    // 并行处理所有图片请求
    const promises = imageRequests.map(async (request) => {
      try {
        const imageUrl = await imageService.generateWithFallback(
          request.description,
          modelConfig.imageModelProvider,
          request.aspectRatio,
          modelConfig.imageApiKey
        );
        
        results[request.id] = {
          id: request.id,
          url: imageUrl,
          success: true,
          provider: modelConfig.imageModelProvider
        };

        // 记录成功日志
        await this.logGeneration(projectId, 'stage2_images', modelConfig.imageModelProvider, 
          modelConfig.imageModelName || 'default', request.description, imageUrl, true);

      } catch (error) {
        console.error(`Image generation failed for ${request.id}:`, error);
        
        // 使用占位图片
        results[request.id] = {
          id: request.id,
          url: this.getPlaceholderImage(request),
          success: false,
          provider: 'placeholder'
        };

        // 记录失败日志
        await this.logGeneration(projectId, 'stage2_images', modelConfig.imageModelProvider, 
          modelConfig.imageModelName || 'default', request.description, '', false, error.message);
      }
      
      completed++;
      onProgress?.({ completed, total: imageRequests.length });
    });

    await Promise.allSettled(promises);
    return results;
  }

  // 阶段3：组装最终HTML
  private async stage3AssembleHTML(
    stage1Result: Stage1Result,
    imageResults: Record<string, ImageResult>,
    projectId: number
  ): Promise<string> {
    let finalHTML = stage1Result.htmlSkeleton;

    // 替换图片占位符
    Object.entries(imageResults).forEach(([id, result]) => {
      const placeholderNumber = id.split('_')[1];
      const placeholder = `{{IMAGE_PLACEHOLDER_${placeholderNumber}}}`;
      finalHTML = finalHTML.replace(placeholder, result.url);
    });

    // 验证和修复HTML
    finalHTML = this.validateAndFixHTML(finalHTML);

    // 记录组装日志
    await this.logGeneration(projectId, 'stage3_assembly', 'system', 'html-assembler', 
      'Assembling final HTML', 'HTML assembled successfully', true);

    return finalHTML;
  }

  // 调用LLM模型
  private async callLLMModel(
    prompt: string,
    provider: string,
    modelName: string,
    apiKey?: string
  ): Promise<string> {
    const baseURLs = {
      'qwen3': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      'claude': 'https://api.anthropic.com/v1',
      'openai': 'https://api.openai.com/v1'
    };

    const baseURL = baseURLs[provider];
    if (!baseURL) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      let requestBody;
      let headers;

      if (provider === 'claude') {
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
          'anthropic-version': '2023-06-01'
        };
        requestBody = {
          model: modelName,
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        };
      } else {
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || ''}`
        };
        requestBody = {
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.7
        };
      }

      const response = await fetch(`${baseURL}/${provider === 'claude' ? 'messages' : 'chat/completions'}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (provider === 'claude') {
        return data.content[0].text;
      } else {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw new Error(`模型调用失败: ${error.message}`);
    }
  }

  // 从响应中提取HTML
  private extractHTML(response: string): string {
    // 提取HTML代码块
    const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/) || 
                     response.match(/```\n([\s\S]*?)\n```/) ||
                     response.match(/<html[\s\S]*?<\/html>/i);
    
    if (htmlMatch) {
      return htmlMatch[1] || htmlMatch[0];
    }
    
    // 如果没找到代码块，尝试提取完整HTML
    const docMatch = response.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (docMatch) {
      return docMatch[0];
    }
    
    // 最后尝试从响应中提取任何HTML
    return response.trim();
  }

  // 提取SEO数据
  private extractSEOData(html: string): any {
    const seoData: any = {};
    
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) seoData.title = titleMatch[1];
    
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch) seoData.description = descMatch[1];
    
    const keywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
    if (keywordsMatch) seoData.keywords = keywordsMatch[1].split(',').map(k => k.trim());
    
    // 提取Open Graph数据
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    
    seoData.openGraph = {
      title: ogTitle?.[1] || seoData.title,
      description: ogDesc?.[1] || seoData.description
    };
    
    return seoData;
  }

  // 获取占位图片
  private getPlaceholderImage(request: ImageRequest): string {
    const width = request.aspectRatio === '1:1' ? 400 : 
                 request.aspectRatio === '16:9' ? 800 : 600;
    const height = request.aspectRatio === '1:1' ? 400 : 
                  request.aspectRatio === '16:9' ? 450 : 400;
    
    return `https://via.placeholder.com/${width}x${height}/3B82F6/FFFFFF?text=${encodeURIComponent(request.alt)}`;
  }

  // 验证和修复HTML
  private validateAndFixHTML(html: string): string {
    // 基本的HTML验证和修复
    if (!html.includes('<!DOCTYPE html>')) {
      html = '<!DOCTYPE html>\n' + html;
    }
    
    if (!html.includes('<html')) {
      html = html.replace(/(<body[\s\S]*<\/body>)/i, '<html lang="zh-CN">$1</html>');
    }
    
    // 确保有完整的head部分
    if (!html.includes('<head>')) {
      const bodyIndex = html.indexOf('<body');
      if (bodyIndex > -1) {
        const headContent = '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Generated Page</title></head>';
        html = html.slice(0, bodyIndex) + headContent + html.slice(bodyIndex);
      }
    }
    
    // 确保Tailwind CSS引用
    if (!html.includes('tailwindcss.com') && !html.includes('tailwind')) {
      const headEndIndex = html.indexOf('</head>');
      if (headEndIndex > -1) {
        const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>\n';
        html = html.slice(0, headEndIndex) + tailwindScript + html.slice(headEndIndex);
      }
    }
    
    return html;
  }

  // 数据库操作方法
  private async createProject(request: GenerationRequest): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO projects (
        title, description, page_type, theme_color, user_prompt, 
        model_config, generation_status, generation_progress, cost_estimate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      request.pageConfig.title,
      request.pageConfig.description,
      request.pageConfig.pageType,
      request.pageConfig.themeColor,
      request.userPrompt,
      JSON.stringify(request.modelConfig),
      'generating',
      0,
      0
    ).run();

    return result.meta.last_row_id as number;
  }

  private async updateProjectStatus(
    projectId: number, 
    status: string, 
    htmlContent?: string, 
    progress?: number
  ): Promise<void> {
    const query = htmlContent 
      ? 'UPDATE projects SET generation_status = ?, html_content = ?, generation_progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      : 'UPDATE projects SET generation_status = ?, generation_progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    const params = htmlContent 
      ? [status, htmlContent, progress, projectId]
      : [status, progress, projectId];

    await this.db.prepare(query).bind(...params).run();
  }

  private async logGeneration(
    projectId: number,
    stage: string,
    provider: string,
    modelName: string,
    prompt: string,
    response: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.db.prepare(`
      INSERT INTO generation_logs (
        project_id, stage, provider, model_name, prompt, response, 
        success, error_message, tokens_used, cost, latency_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId, stage, provider, modelName, 
      prompt.slice(0, 1000), // 限制长度
      response.slice(0, 2000), // 限制长度
      success, 
      errorMessage || null,
      Math.ceil(prompt.length / 4), // 估算token数
      0, // 成本计算可以后续实现
      0  // 延迟计算可以后续实现
    ).run();
  }
}