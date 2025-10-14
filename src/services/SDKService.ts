import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * SDK服务类 - 使用官方SDK进行AI API调用
 * 这些SDK都兼容Cloudflare Workers环境
 */
export class SDKService {
  private openaiClient: OpenAI | null = null
  private anthropicClient: Anthropic | null = null
  private googleClient: GoogleGenerativeAI | null = null

  /**
   * 初始化OpenAI客户端
   */
  initOpenAI(apiKey: string) {
    this.openaiClient = new OpenAI({
      apiKey,
      // 在Cloudflare Workers中，使用全局fetch
      fetch: globalThis.fetch
    })
  }

  /**
   * 初始化Anthropic客户端
   */
  initAnthropic(apiKey: string) {
    this.anthropicClient = new Anthropic({
      apiKey,
      // 在Cloudflare Workers中，使用全局fetch
      fetch: globalThis.fetch
    })
  }

  /**
   * 初始化Google AI客户端
   */
  initGoogle(apiKey: string) {
    this.googleClient = new GoogleGenerativeAI(apiKey)
  }

  /**
   * 使用OpenAI SDK生成文本
   */
  async generateWithOpenAI(prompt: string, model: string = 'gpt-4'): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const completion = await this.openaiClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      return completion.choices[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('OpenAI SDK Error:', error)
      throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 使用Anthropic SDK生成文本
   */
  async generateWithAnthropic(prompt: string, model: string = 'claude-3-sonnet-20240229'): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized')
    }

    try {
      const message = await this.anthropicClient.messages.create({
        model,
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = message.content[0]
      if (content.type === 'text') {
        return content.text
      }
      
      throw new Error('Unexpected response format from Anthropic')
    } catch (error) {
      console.error('Anthropic SDK Error:', error)
      throw new Error(`Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 使用Google AI SDK生成文本
   */
  async generateWithGoogle(prompt: string, model: string = 'gemini-pro'): Promise<string> {
    if (!this.googleClient) {
      throw new Error('Google AI client not initialized')
    }

    try {
      const genModel = this.googleClient.getGenerativeModel({ model })
      const result = await genModel.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Google AI SDK Error:', error)
      throw new Error(`Google AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 使用OpenAI SDK生成图像
   */
  async generateImageWithOpenAI(prompt: string, size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024'): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const response = await this.openaiClient.images.generate({
        model: 'dall-e-3',
        prompt,
        size,
        quality: 'standard',
        n: 1
      })

      const imageUrl = response.data[0]?.url
      if (!imageUrl) {
        throw new Error('No image URL in response')
      }

      return imageUrl
    } catch (error) {
      console.error('OpenAI Image Generation Error:', error)
      throw new Error(`OpenAI image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 使用Google AI SDK生成图像 (Nano Banana)
   * 🚫 禁用前端直连以避免CORS问题
   */
  async generateImageWithGoogle(prompt: string, model: string = 'gemini-2.5-flash-image-preview'): Promise<string> {
    // 🔧 修复：检测浏览器环境，防止前端直连Google API导致CORS问题
    if (typeof window !== 'undefined') {
      console.error('🚫 [CORS Fix] Google AI SDK image generation is disabled in browser environment');
      console.error('💡 [CORS Fix] Please use NanoBananaService with backend proxy instead');
      throw new Error('Google AI SDK image generation is disabled in browser to prevent CORS issues. Please use NanoBananaService with backend proxy.');
    }

    if (!this.googleClient) {
      throw new Error('Google AI client not initialized')
    }

    try {
      console.log(`🍌 Google AI SDK generating image (server-side): ${prompt.substring(0, 100)}...`)
      
      // 获取生成模型
      const genModel = this.googleClient.getGenerativeModel({ 
        model,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 32,
          maxOutputTokens: 8192
        }
      })
      
      // 生成内容 - 使用正确的请求格式
      const result = await genModel.generateContent({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
      
      // 解析响应中的图像数据
      const response = await result.response
      const candidates = response.candidates
      
      if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png'
            const base64Data = part.inlineData.data
            
            console.log('✅ Google AI SDK image generation successful')
            return `data:${mimeType};base64,${base64Data}`
          }
        }
      }

      throw new Error('No image data found in Google AI response')
    } catch (error) {
      console.error('Google AI Image Generation Error:', error)
      throw new Error(`Google AI image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 批量初始化客户端
   */
  initializeClients(apiKeys: Record<string, string>) {
    if (apiKeys.openai) {
      this.initOpenAI(apiKeys.openai)
    }
    
    if (apiKeys.anthropic) {
      this.initAnthropic(apiKeys.anthropic)
    }
    
    if (apiKeys.google) {
      this.initGoogle(apiKeys.google)
    }
  }

  /**
   * 检查SDK可用性
   */
  getAvailableSDKs(): string[] {
    const available: string[] = []
    
    if (this.openaiClient) available.push('OpenAI')
    if (this.anthropicClient) available.push('Anthropic')
    if (this.googleClient) available.push('Google AI')
    
    return available
  }

  /**
   * 智能模型选择 - 根据可用的SDK自动选择最佳模型
   */
  async generateWithBestAvailable(prompt: string, preferredProvider?: string): Promise<{ content: string; provider: string; model: string }> {
    const availableSDKs = this.getAvailableSDKs()
    
    if (availableSDKs.length === 0) {
      throw new Error('No SDK clients initialized. Please configure API keys first.')
    }

    // 优先使用用户指定的提供商
    if (preferredProvider) {
      switch (preferredProvider.toLowerCase()) {
        case 'openai':
          if (this.openaiClient) {
            const content = await this.generateWithOpenAI(prompt, 'gpt-4')
            return { content, provider: 'OpenAI', model: 'gpt-4' }
          }
          break
        case 'anthropic':
        case 'claude':
          if (this.anthropicClient) {
            const content = await this.generateWithAnthropic(prompt)
            return { content, provider: 'Anthropic', model: 'claude-3-sonnet-20240229' }
          }
          break
        case 'google':
        case 'gemini':
          if (this.googleClient) {
            const content = await this.generateWithGoogle(prompt)
            return { content, provider: 'Google AI', model: 'gemini-pro' }
          }
          break
      }
    }

    // 自动选择第一个可用的SDK
    if (availableSDKs.includes('OpenAI')) {
      const content = await this.generateWithOpenAI(prompt, 'gpt-4')
      return { content, provider: 'OpenAI', model: 'gpt-4' }
    }
    
    if (availableSDKs.includes('Anthropic')) {
      const content = await this.generateWithAnthropic(prompt)
      return { content, provider: 'Anthropic', model: 'claude-3-sonnet-20240229' }
    }
    
    if (availableSDKs.includes('Google AI')) {
      const content = await this.generateWithGoogle(prompt)
      return { content, provider: 'Google AI', model: 'gemini-pro' }
    }

    throw new Error('No available SDK for text generation')
  }
}

// 创建全局SDK服务实例
export const sdkService = new SDKService()