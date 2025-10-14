// Image Generation Service with Fallback Mechanism
export class ImageGenerationService {
  
  // 主图片生成方法，带降级机制
  async generateWithFallback(
    description: string,
    preferredProvider: string,
    aspectRatio: string = '16:9',
    apiKey?: string
  ): Promise<string> {
    const providers = this.getProviderChain(preferredProvider);
    
    for (const provider of providers) {
      try {
        const imageUrl = await this.generateImage(description, provider, aspectRatio, apiKey);
        if (imageUrl) {
          console.log(`Image generated successfully with ${provider}`);
          return imageUrl;
        }
      } catch (error) {
        console.warn(`Image generation failed with ${provider}:`, error.message);
        continue;
      }
    }
    
    // 所有提供商都失败，返回占位图片
    return this.getPlaceholderImage(description, aspectRatio);
  }

  // 获取提供商降级链
  private getProviderChain(preferredProvider: string): string[] {
    const allProviders = [
      'qwen-vl',      // 阿里云QWEN-VL
      'dalle3',       // OpenAI DALL-E 3
      'gemini-nano',  // Google Gemini Nano
      'pollinations', // 免费AI图片
      'unsplash',     // 免费摄影图片
      'pixabay'       // 免费图片库
    ];

    // 将首选提供商放在第一位
    const providers = [preferredProvider, ...allProviders.filter(p => p !== preferredProvider)];
    return providers;
  }

  // 核心图片生成方法
  private async generateImage(
    description: string,
    provider: string,
    aspectRatio: string,
    apiKey?: string
  ): Promise<string> {
    switch (provider) {
      case 'qwen-vl':
        return await this.generateWithQwenVL(description, aspectRatio, apiKey);
      case 'dalle3':
        return await this.generateWithDallE(description, aspectRatio, apiKey);
      case 'gemini-nano':
        return await this.generateWithGemini(description, aspectRatio, apiKey);
      case 'pollinations':
        return await this.generateWithPollinations(description, aspectRatio);
      case 'unsplash':
        return await this.generateWithUnsplash(description, aspectRatio);
      case 'pixabay':
        return await this.generateWithPixabay(description, aspectRatio);
      default:
        throw new Error(`Unsupported image provider: ${provider}`);
    }
  }

  // QWEN-VL图片生成
  private async generateWithQwenVL(description: string, aspectRatio: string, apiKey?: string): Promise<string> {
    if (!apiKey) {
      throw new Error('QWEN-VL requires API key');
    }

    const sizeMap = {
      '1:1': '1024*1024',
      '16:9': '1344*768',
      '4:3': '1152*896',
      '3:4': '896*1152'
    };

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: `${description}, high quality, professional, 4k`,
          negative_prompt: 'blurry, low quality, distorted, watermark',
          style: '<auto>'
        },
        parameters: {
          size: sizeMap[aspectRatio] || '1024*1024',
          n: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });

    if (!response.ok) {
      throw new Error(`QWEN-VL API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.output?.results?.[0]?.url) {
      return data.output.results[0].url;
    }

    throw new Error('No image URL in QWEN-VL response');
  }

  // DALL-E 3图片生成
  private async generateWithDallE(description: string, aspectRatio: string, apiKey?: string): Promise<string> {
    if (!apiKey) {
      throw new Error('DALL-E 3 requires API key');
    }

    const sizeMap = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '4:3': '1536x1024'
    };

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${description}, professional photography style, high quality, detailed`,
        size: sizeMap[aspectRatio] || '1024x1024',
        quality: 'standard',
        n: 1
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E 3 API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.data?.[0]?.url) {
      return data.data[0].url;
    }

    throw new Error('No image URL in DALL-E 3 response');
  }

  // Gemini Nano图片生成 (模拟实现)
  private async generateWithGemini(description: string, aspectRatio: string, apiKey?: string): Promise<string> {
    // 注意：这是一个模拟实现，实际需要根据Google Gemini的具体API进行调整
    if (!apiKey) {
      throw new Error('Gemini requires API key');
    }

    // 暂时返回占位图片，实际项目中需要实现真实的Gemini API调用
    return this.getPlaceholderImage(description, aspectRatio);
  }

  // Pollinations AI (免费)
  private async generateWithPollinations(description: string, aspectRatio: string): Promise<string> {
    const dimensions = this.getDimensions(aspectRatio);
    const encodedPrompt = encodeURIComponent(`${description}, high quality, professional`);
    
    // Pollinations API是免费的，但可能不稳定
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${Math.floor(Math.random() * 1000000)}`;
    
    // 验证图片是否可访问
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        return imageUrl;
      }
    } catch (error) {
      // 如果验证失败，仍然返回URL，因为某些情况下HEAD请求可能失败但图片仍然可用
    }
    
    return imageUrl;
  }

  // Unsplash搜索 (免费摄影图片)
  private async generateWithUnsplash(description: string, aspectRatio: string): Promise<string> {
    const dimensions = this.getDimensions(aspectRatio);
    
    try {
      // 使用Unsplash的公共API端点
      const keywords = this.extractKeywords(description);
      const query = keywords.join(',');
      
      const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=demo&w=${dimensions.width}&h=${dimensions.height}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.urls?.custom || data.urls?.regular) {
          return data.urls.custom || data.urls.regular;
        }
      }
    } catch (error) {
      console.warn('Unsplash API failed:', error);
    }

    // 降级到Unsplash的直接URL方式
    const keywords = this.extractKeywords(description);
    return `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${encodeURIComponent(keywords.join(','))}`;
  }

  // Pixabay搜索 (免费)
  private async generateWithPixabay(description: string, aspectRatio: string): Promise<string> {
    // 注意：Pixabay需要API key，这里提供一个备用实现
    const keywords = this.extractKeywords(description);
    const dimensions = this.getDimensions(aspectRatio);
    
    // 使用Pixabay的搜索关键词生成占位图片URL
    return `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/4A90E2/FFFFFF?text=${encodeURIComponent(keywords.join(' '))}`;
  }

  // 提取关键词
  private extractKeywords(description: string): string[] {
    // 简单的关键词提取
    const stopWords = ['的', '和', '与', '或', '但', '也', '都', '要', '想', '可以', '能够', 'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    
    return description
      .toLowerCase()
      .split(/[，。、！？\s,!?.]+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 5); // 最多5个关键词
  }

  // 获取尺寸
  private getDimensions(aspectRatio: string): { width: number; height: number } {
    const ratios = {
      '1:1': { width: 800, height: 800 },
      '16:9': { width: 1200, height: 675 },
      '4:3': { width: 1000, height: 750 },
      '3:4': { width: 750, height: 1000 }
    };
    
    return ratios[aspectRatio] || ratios['16:9'];
  }

  // 生成占位图片
  private getPlaceholderImage(description: string, aspectRatio: string): string {
    const dimensions = this.getDimensions(aspectRatio);
    const text = encodeURIComponent(description.slice(0, 50));
    
    // 使用多个占位服务作为备选
    const placeholderServices = [
      `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/3B82F6/FFFFFF?text=${text}`,
      `https://dummyimage.com/${dimensions.width}x${dimensions.height}/3B82F6/FFFFFF&text=${text}`,
      `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Math.floor(Math.random() * 1000)}`
    ];
    
    // 返回第一个服务的URL
    return placeholderServices[0];
  }

  // 验证图片URL是否有效
  private async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }

  // 获取图片元信息
  async getImageMetadata(url: string): Promise<{ width: number; height: number; size: number } | null> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) return null;
      
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength) : 0;
      
      // 这里简化返回，实际实现可能需要加载图片来获取尺寸
      return {
        width: 0,
        height: 0,
        size
      };
    } catch {
      return null;
    }
  }

  // 批量生成图片
  async generateBatch(
    requests: Array<{
      description: string;
      aspectRatio?: string;
      provider?: string;
    }>,
    preferredProvider: string,
    apiKey?: string
  ): Promise<Array<{ url: string; success: boolean; error?: string }>> {
    const results = await Promise.allSettled(
      requests.map(req => 
        this.generateWithFallback(
          req.description,
          req.provider || preferredProvider,
          req.aspectRatio || '16:9',
          apiKey
        )
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { url: result.value, success: true };
      } else {
        return { 
          url: this.getPlaceholderImage(requests[index].description, requests[index].aspectRatio || '16:9'),
          success: false,
          error: result.reason.message
        };
      }
    });
  }
}