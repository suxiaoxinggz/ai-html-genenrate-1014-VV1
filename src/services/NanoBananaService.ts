/**
 * Nano Banana (Gemini 2.5 Flash Image Preview) Service
 * 专门处理 Nano Banana 图片生成的服务
 */

export interface NanoBananaConfig {
  apiKey: string;
  basePromptStyle?: string;
  styleEnhancement?: string;
  outputFormat?: 'base64' | 'url'; // 支持用户选择输出格式
}

// 第一排基础风格映射（中文 -> 英文）
export const BASE_PROMPT_STYLES: Record<string, string> = {
  'photorealistic': 'photorealistic editorial photo, natural daylight, 50–85mm look, gentle depth of field, true-to-life color',
  'sticker': 'vector-like sticker, bold clean outlines, simple cel shading, crisp silhouette',
  'logo': 'modern minimalist logo lockup, clean bold sans-serif typography, simple geometric icon integrated with text, high legibility',
  'product': 'studio product photo on seamless white, high-key softbox lighting, subtle natural shadow under the item, ultra-sharp focus',
  'illustration': 'minimal backdrop with generous negative space for overlay text, soft diffused lighting, quiet premium mood',
  'comic': 'single comic panel, cinematic noir tone, dramatic lighting, high-contrast inks, clear focal framing',
  'flatlay': 'flat-lay composition shot from directly above, balanced arrangement, soft top light, clean background',
  'ui': 'flat, UI-inspired illustration, clear iconography, minimal color palette, high readability'
};

// 第二排主题风格映射（中文 -> 英文）
export const STYLE_ENHANCEMENTS: Record<string, string> = {
  'professional': 'neutral palette, balanced composition, soft frontal lighting, crisp detail',
  'warm': 'warm golden-hour lighting, soft shadows, welcoming mood',
  'tech': 'cool tones, subtle gradients/glass-like sheen, rim lighting, clean geometry',
  'energetic': 'high contrast, dynamic angle, energetic color accents',
  'minimal': 'minimalist layout, generous negative space, muted premium palette',
  'natural': 'natural daylight, airy atmosphere, organic textures',
  'dramatic': 'dramatic chiaroscuro lighting, deep shadows, high contrast focal point'
};

export interface NanoBananaAPIResponse {
  ok: boolean;
  provider: string;
  model: string;
  image?: {
    b64: string;
    mime: string;
  };
  meta: {
    created: number;
    usage: null;
  };
  error?: {
    code: string;
    message: string;
  };
}

export class NanoBananaService {
  // 🔧 CORS修复：完全使用后端代理，不再直连Google API
  private static readonly TIMEOUT_MS = 60000; // 60秒超时

  /**
   * 构建最终的提示词
   * 将LLM生成的alt文本与用户选择的风格配置组合
   */
  private static buildEnhancedPrompt(altText: string, config: NanoBananaConfig): string {
    const enhancements = [];
    
    // 首先添加LLM生成的alt文本
    enhancements.push(altText);
    
    // 添加基础风格（如果选择了）
    if (config.basePromptStyle && BASE_PROMPT_STYLES[config.basePromptStyle]) {
      enhancements.push(BASE_PROMPT_STYLES[config.basePromptStyle]);
    }
    
    // 添加主题风格（如果选择了）
    if (config.styleEnhancement && STYLE_ENHANCEMENTS[config.styleEnhancement]) {
      enhancements.push(STYLE_ENHANCEMENTS[config.styleEnhancement]);
    }
    
    // 用逗号连接所有部分
    return enhancements.filter(Boolean).join(', ');
  }

  /**
   * 调用 Nano Banana API 生成图片 - 通过后端代理
   */
  static async generateImage(altText: string, config: NanoBananaConfig): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Nano Banana requires API key. Please configure it in the modal.');
    }

    if (!altText || altText.trim().length === 0) {
      throw new Error('Image description (alt text) is required.');
    }

    // 构建增强的提示词 - 保留原有的风格配置逻辑
    const enhancedPrompt = this.buildEnhancedPrompt(altText, config);
    
    console.log(`🍌 Nano Banana generating image via backend proxy: ${enhancedPrompt.substring(0, 100)}...`);

    // 🚀 强制使用后端代理，避免 CORS 问题
    // 注释掉 SDK 路径，直接使用后端代理
    console.log('🔗 Nano Banana now using backend proxy only (CORS fix)');

    // 🔄 通过后端代理调用 API
    try {
      console.log('🔗 Using backend proxy for Nano Banana API call');
      
      // 🔧 修复：在浏览器环境中，使用相对路径调用后端 API
      // 在 Cloudflare Pages 中，前端 JS 通过相对路径访问 Worker API
      console.log('🚀 Calling Nano Banana generation endpoint via relative path');
      console.log('📍 Environment check:', {
        hasWindow: typeof window !== 'undefined',
        origin: typeof window !== 'undefined' ? window.location.origin : 'server-side'
      });
      
      const generateResponse = await fetch('/api/generate/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          prompt: enhancedPrompt,
          outputFormat: config.outputFormat || 'base64'
        })
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error(`❌ Generate response error (${generateResponse.status}):`, errorText);
        throw new Error(`Image generation failed: ${generateResponse.status} - ${errorText}`);
      }

      const generateResult = await generateResponse.json();
      console.log('📊 Generate result:', generateResult);
      
      if (!generateResult.success || !generateResult.imageUrl) {
        throw new Error(generateResult.error || 'No image data received');
      }

      console.log('✅ Nano Banana image generated successfully via backend proxy');
      return generateResult.imageUrl;

    } catch (error) {
      console.error('❌ Nano Banana backend proxy error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again with a simpler description.');
      }
      
      // 重新抛出错误，保持原始错误信息
      throw error;
    }
  }

  /**
   * 验证配置是否有效
   */
  static validateConfig(config: NanoBananaConfig): { valid: boolean; error?: string } {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      return { valid: false, error: 'API Key is required' };
    }

    if (config.apiKey.trim().length < 10) {
      return { valid: false, error: 'API Key seems too short' };
    }

    if (config.basePromptStyle && !BASE_PROMPT_STYLES[config.basePromptStyle]) {
      return { valid: false, error: 'Invalid base prompt style' };
    }

    if (config.styleEnhancement && !STYLE_ENHANCEMENTS[config.styleEnhancement]) {
      return { valid: false, error: 'Invalid style enhancement' };
    }

    if (config.outputFormat && !['base64', 'url'].includes(config.outputFormat)) {
      return { valid: false, error: 'Invalid output format. Must be "base64" or "url"' };
    }

    return { valid: true };
  }

  /**
   * 获取可用的基础风格选项
   */
  static getBasePromptStyleOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'photorealistic', label: '写实摄影' },
      { value: 'sticker', label: '贴纸 / 图标' },
      { value: 'logo', label: 'Logo / 含文字' },
      { value: 'product', label: '商品图（白底）' },
      { value: 'illustration', label: '留白背景插图' },
      { value: 'comic', label: '漫画分格' },
      { value: 'flatlay', label: '俯拍平铺（Flat-lay）' },
      { value: 'ui', label: 'UI / 图解插图' }
    ];
  }

  /**
   * 获取可用的主题风格选项
   */
  static getStyleEnhancementOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'professional', label: '可信专业' },
      { value: 'warm', label: '温暖亲和' },
      { value: 'tech', label: '科技未来' },
      { value: 'energetic', label: '活力年轻' },
      { value: 'minimal', label: '极简高级' },
      { value: 'natural', label: '自然清新' },
      { value: 'dramatic', label: '戏剧对比' }
    ];
  }
}