// AI Model Management Service
import { ModelConfig, ModelProvider } from '../types';

export class ModelService {
  
  // 支持的文本模型配置
  static getTextModels(): Record<string, ModelProvider> {
    return {
      qwen3: {
        name: 'QWEN3系列',
        models: [
          'qwen-max',
          'qwen-plus', 
          'qwen-turbo'
        ],
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        costPerToken: 0.0008,
        strengths: ['中文理解', '性价比高', 'HTML生成'],
        isDefault: true
      },
      claude: {
        name: 'Claude 3.5',
        models: ['claude-3-5-sonnet-20241022'],
        baseURL: 'https://api.anthropic.com/v1',
        costPerToken: 0.003,
        strengths: ['HTML质量', '创意内容', '逻辑推理']
      },
      openai: {
        name: 'OpenAI GPT',
        models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
        baseURL: 'https://api.openai.com/v1',
        costPerToken: 0.01,
        strengths: ['综合能力', '生态完善', 'SEO优化']
      }
    };
  }

  // 支持的图片模型配置
  static getImageModels(): Record<string, ModelProvider> {
    return {
      'qwen-vl': {
        name: 'QWEN-VL系列',
        models: ['qwen-vl-max', 'qwen-vl-plus'],
        costPerToken: 0.05,
        strengths: ['中文理解', '成本控制', '生成速度'],
        isDefault: true
      },
      dalle3: {
        name: 'DALL-E 3',
        models: ['dall-e-3'],
        costPerToken: 0.20,
        strengths: ['图片质量', '风格统一', '细节丰富']
      },
      'gemini-nano': {
        name: 'Gemini Nano Banana',
        models: ['gemini-nano-banana'],
        costPerToken: 0.05,
        strengths: ['速度快', '性价比', '多样性']
      },
      // 免费图片源
      pollinations: { 
        name: 'Pollinations AI', 
        models: ['pollinations'],
        costPerToken: 0.00,
        strengths: ['免费', '快速', '多样性']
      },
      unsplash: { 
        name: 'Unsplash', 
        models: ['unsplash'],
        costPerToken: 0.00,
        strengths: ['免费', '高质量摄影', '商用友好']
      }
    };
  }

  // 验证API密钥
  static async validateApiKey(provider: string, apiKey: string): Promise<boolean> {
    try {
      const models = this.getTextModels();
      const modelConfig = models[provider];
      
      if (!modelConfig?.baseURL) return false;
      
      const response = await fetch(`${modelConfig.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  // 获取可用模型列表
  static async fetchAvailableModels(provider: string, apiKey: string): Promise<string[]> {
    try {
      const models = this.getTextModels();
      const modelConfig = models[provider];
      
      if (!modelConfig?.baseURL) {
        return modelConfig?.models || [];
      }
      
      const response = await fetch(`${modelConfig.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return modelConfig.models || [];
      }
      
      const data = await response.json();
      const availableModels = data.data
        ?.filter((model: any) => this.isRelevantModel(model.id, provider))
        ?.map((model: any) => model.id) || [];
      
      return availableModels.length > 0 ? availableModels : (modelConfig.models || []);
      
    } catch (error) {
      console.error('Failed to fetch models:', error);
      const models = this.getTextModels();
      return models[provider]?.models || [];
    }
  }

  // 判断模型是否相关
  private static isRelevantModel(modelId: string, provider: string): boolean {
    const filters: Record<string, (id: string) => boolean> = {
      qwen3: (id) => id.toLowerCase().includes('qwen'),
      claude: (id) => id.toLowerCase().includes('claude-3'),
      openai: (id) => ['gpt-4', 'gpt-3.5'].some(gpt => id.toLowerCase().includes(gpt))
    };
    
    return filters[provider]?.(modelId) || false;
  }

  // 计算预估成本
  static calculateEstimatedCost(
    textProvider: string, 
    imageProvider: string, 
    promptLength: number, 
    imageCount: number
  ): number {
    const textModels = this.getTextModels();
    const imageModels = this.getImageModels();
    
    const textCost = (textModels[textProvider]?.costPerToken || 0.001) * (promptLength / 4); // 约4字符=1token
    const imageCost = (imageModels[imageProvider]?.costPerToken || 0.05) * imageCount;
    
    return Math.round((textCost + imageCost) * 100) / 100; // 保留2位小数
  }

  // 获取推荐模型组合
  static getRecommendedCombinations(): ModelConfig[] {
    return [
      {
        id: 'qwen-combo',
        name: 'QWEN组合 (推荐)',
        textModelProvider: 'qwen3',
        textModelName: 'qwen-max',
        imageModelProvider: 'qwen-vl',
        imageModelName: 'qwen-vl-max',
        costLimit: 0.5,
        isDefault: true
      },
      {
        id: 'claude-dalle',
        name: 'Claude + DALL-E (高质量)',
        textModelProvider: 'claude',
        textModelName: 'claude-3-5-sonnet-20241022',
        imageModelProvider: 'dalle3',
        imageModelName: 'dall-e-3',
        costLimit: 1.0
      },
      {
        id: 'gpt-gemini',
        name: 'GPT-4 + Gemini (均衡)',
        textModelProvider: 'openai',
        textModelName: 'gpt-4-turbo',
        imageModelProvider: 'gemini-nano',
        imageModelName: 'gemini-nano-banana',
        costLimit: 0.8
      },
      {
        id: 'free-combo',
        name: '免费组合 (经济)',
        textModelProvider: 'qwen3',
        textModelName: 'qwen-turbo',
        imageModelProvider: 'pollinations',
        imageModelName: 'pollinations',
        costLimit: 0.1
      }
    ];
  }
}