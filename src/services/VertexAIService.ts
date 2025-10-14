/**
 * Google Cloud Vertex AI Imagen API 服务
 * 基于官方文档: https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images
 */

export interface ImagenRequest {
  model: 'imagen-4.0-generate-001' | 'imagen-4.0-fast-generate-001' | 'imagen-3.0-generate-002' | 'imagen-3.0-fast-generate-001'
  prompt: string
  projectId: string
  location: string
  
  // 可选参数
  sampleCount?: number  // 1-4
  aspectRatio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16'
  addWatermark?: boolean
  enhancePrompt?: boolean
  includeRaiReason?: boolean
  includeSafetyAttributes?: boolean
  mimeType?: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/bmp' | 'image/tiff'
  compressionQuality?: number  // 0-100, JPEG only
  personGeneration?: 'allow_adult' | 'dont_allow'
  safetySetting?: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high'
  seed?: number  // 1-2147483647, requires addWatermark=false
  storageUri?: string  // GCS bucket path like gs://bucket/prefix/
}

export interface ImagenResponse {
  success: boolean
  model: string
  images: ImageResult[]
  enhancedPrompt?: string
  rai?: {
    included: boolean
    reasonCodes?: string[]
    safetyAttributes?: Record<string, any>
  }
  quota?: {
    rpmHint: number
  }
  error?: string
}

export interface ImageResult {
  mimeType: string
  dataUrl?: string  // data:image/png;base64,... 
  gcsUri?: string   // gs://bucket/path
  publicUrl?: string
  bytesBase64?: string
}

// 模型配置和约束
export const ImagenModels = {
  'imagen-4.0-generate-001': {
    name: 'Imagen 4.0 Generate',
    description: '追求画质、合规(数字水印、安全设置、提示重写)，多语种提示',
    maxSampleCount: 4,
    rpmLimit: null, // 根据项目配额
    supportedAspectRatios: ['1:1', '3:4', '4:3', '16:9', '9:16'],
    supportedResolutions: {
      '1:1': ['1024x1024', '2048x2048'],
      '3:4': ['768x1024', '1536x2048'], 
      '4:3': ['1024x768', '2048x1536'],
      '16:9': ['1024x576', '2048x1152'],
      '9:16': ['576x1024', '1152x2048']
    },
    features: {
      watermark: true,
      promptEnhancement: true,
      multiLanguage: true,
      safetyFiltering: true
    }
  },
  'imagen-4.0-fast-generate-001': {
    name: 'Imagen 4.0 Fast Generate',
    description: '快速产图、缩短等待(分辨率档位精简，1:1~16:9常用比例)',
    maxSampleCount: 4,
    rpmLimit: null,
    supportedAspectRatios: ['1:1', '3:4', '4:3', '16:9', '9:16'],
    supportedResolutions: {
      '1:1': ['1024x1024'],
      '3:4': ['768x1024'], 
      '4:3': ['1024x768'],
      '16:9': ['1024x576'],
      '9:16': ['576x1024']
    },
    features: {
      watermark: true,
      promptEnhancement: true,
      multiLanguage: true,
      safetyFiltering: true
    }
  },
  'imagen-3.0-generate-002': {
    name: 'Imagen 3.0 Generate',
    description: '稳定的3系列标准通道(每项目每分钟20 RPM)',
    maxSampleCount: 4,
    rpmLimit: 20,
    supportedAspectRatios: ['1:1', '3:4', '4:3', '16:9', '9:16'],
    supportedResolutions: {
      '1:1': ['1024x1024'],
      '3:4': ['768x1024'], 
      '4:3': ['1024x768'],
      '16:9': ['1024x576'],
      '9:16': ['576x1024']
    },
    features: {
      watermark: true,
      promptEnhancement: false,
      multiLanguage: false,
      safetyFiltering: true
    }
  },
  'imagen-3.0-fast-generate-001': {
    name: 'Imagen 3.0 Fast Generate', 
    description: '高速通道(每项目每分钟200 RPM)，适合批量与内测素材',
    maxSampleCount: 4,
    rpmLimit: 200,
    supportedAspectRatios: ['1:1', '3:4', '4:3', '16:9', '9:16'],
    supportedResolutions: {
      '1:1': ['1024x1024'],
      '3:4': ['768x1024'], 
      '4:3': ['1024x768'],
      '16:9': ['1024x576'],
      '9:16': ['576x1024']
    },
    features: {
      watermark: true,
      promptEnhancement: false,
      multiLanguage: false,
      safetyFiltering: true
    }
  }
} as const

export class VertexAIService {
  private accessToken: string | null = null
  private projectId: string
  private location: string

  constructor(projectId: string, location: string = 'us-central1') {
    this.projectId = projectId
    this.location = location
  }

  /**
   * 获取Google Cloud访问令牌
   * 在生产环境中，这应该通过服务账号密钥或其他认证方式
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken
    }

    // 注意: 在实际部署中，这里应该使用服务账号密钥
    // 当前示例中，访问令牌需要通过其他方式获取
    throw new Error('Access token not configured. Please set up Google Cloud authentication.')
  }

  /**
   * 设置访问令牌 (用于开发和测试)
   */
  setAccessToken(token: string) {
    this.accessToken = token
  }

  /**
   * 验证请求参数
   */
  private validateRequest(request: ImagenRequest): string[] {
    const errors: string[] = []
    const modelConfig = ImagenModels[request.model]

    if (!modelConfig) {
      errors.push(`Unsupported model: ${request.model}`)
      return errors
    }

    // 验证提示词长度 (≤ 480 tokens)
    if (!request.prompt || request.prompt.trim().length === 0) {
      errors.push('Prompt is required')
    } else if (request.prompt.length > 2000) { // 粗略估算
      errors.push('Prompt is too long (≤ 480 tokens)')
    }

    // 验证sampleCount
    if (request.sampleCount && (request.sampleCount < 1 || request.sampleCount > modelConfig.maxSampleCount)) {
      errors.push(`sampleCount must be between 1 and ${modelConfig.maxSampleCount}`)
    }

    // 验证aspectRatio
    if (request.aspectRatio && !modelConfig.supportedAspectRatios.includes(request.aspectRatio)) {
      errors.push(`Unsupported aspect ratio for ${request.model}: ${request.aspectRatio}`)
    }

    // 验证seed和watermark组合
    if (request.seed && request.addWatermark !== false) {
      errors.push('Using seed requires addWatermark=false')
    }

    // 验证seed范围
    if (request.seed && (request.seed < 1 || request.seed > 2147483647)) {
      errors.push('Seed must be between 1 and 2147483647')
    }

    // 验证compressionQuality
    if (request.compressionQuality && (request.compressionQuality < 0 || request.compressionQuality > 100)) {
      errors.push('compressionQuality must be between 0 and 100')
    }

    // 验证MIME类型和compressionQuality组合
    if (request.compressionQuality && request.mimeType !== 'image/jpeg') {
      errors.push('compressionQuality only applies to image/jpeg')
    }

    return errors
  }

  /**
   * 构建Vertex AI API请求体
   */
  private buildRequestBody(request: ImagenRequest): any {
    const requestBody: any = {
      instances: [
        {
          prompt: request.prompt
        }
      ],
      parameters: {
        sampleCount: request.sampleCount || 1
      }
    }

    // 添加可选参数
    if (request.addWatermark !== undefined) {
      requestBody.parameters.addWatermark = request.addWatermark
    }

    if (request.aspectRatio) {
      requestBody.parameters.aspectRatio = request.aspectRatio
    }

    if (request.enhancePrompt !== undefined) {
      requestBody.parameters.enhancePrompt = request.enhancePrompt
    }

    if (request.includeRaiReason !== undefined) {
      requestBody.parameters.includeRaiReason = request.includeRaiReason
    }

    if (request.includeSafetyAttributes !== undefined) {
      requestBody.parameters.includeSafetyAttributes = request.includeSafetyAttributes
    }

    if (request.mimeType || request.compressionQuality) {
      requestBody.parameters.outputOptions = {}
      if (request.mimeType) {
        requestBody.parameters.outputOptions.mimeType = request.mimeType
      }
      if (request.compressionQuality) {
        requestBody.parameters.outputOptions.compressionQuality = request.compressionQuality
      }
    }

    if (request.personGeneration) {
      requestBody.parameters.personGeneration = request.personGeneration
    }

    if (request.safetySetting) {
      requestBody.parameters.safetySetting = request.safetySetting
    }

    if (request.seed) {
      requestBody.parameters.seed = request.seed
    }

    if (request.storageUri) {
      requestBody.parameters.storageUri = request.storageUri
    }

    return requestBody
  }

  /**
   * 生成图像
   */
  async generateImage(request: ImagenRequest): Promise<ImagenResponse> {
    try {
      // 验证参数
      const validationErrors = this.validateRequest(request)
      if (validationErrors.length > 0) {
        return {
          success: false,
          model: request.model,
          images: [],
          error: `Validation errors: ${validationErrors.join(', ')}`
        }
      }

      // 获取访问令牌
      const accessToken = await this.getAccessToken()

      // 构建请求
      const requestBody = this.buildRequestBody(request)
      const url = `https://${request.location || this.location}-aiplatform.googleapis.com/v1/projects/${request.projectId || this.projectId}/locations/${request.location || this.location}/publishers/google/models/${request.model}:predict`

      console.log('Vertex AI Request:', {
        url,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer [REDACTED]',
          'Content-Type': 'application/json'
        },
        body: requestBody
      })

      // 发送请求
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Vertex AI Error Response:', errorText)
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error && errorJson.error.message) {
            errorMessage = errorJson.error.message
          }
        } catch (e) {
          // 保持原始错误消息
        }

        return {
          success: false,
          model: request.model,
          images: [],
          error: errorMessage
        }
      }

      // 解析响应
      const responseData = await response.json()
      console.log('Vertex AI Response:', responseData)

      const result: ImagenResponse = {
        success: true,
        model: request.model,
        images: [],
        quota: {
          rpmHint: ImagenModels[request.model].rpmLimit || 100
        }
      }

      // 处理预测结果
      if (responseData.predictions && Array.isArray(responseData.predictions)) {
        for (const prediction of responseData.predictions) {
          const imageResult: ImageResult = {
            mimeType: prediction.mimeType || request.mimeType || 'image/png'
          }

          if (prediction.bytesBase64Encoded) {
            imageResult.bytesBase64 = prediction.bytesBase64Encoded
            imageResult.dataUrl = `data:${imageResult.mimeType};base64,${prediction.bytesBase64Encoded}`
          }

          // 如果有增强后的提示词
          if (prediction.prompt) {
            result.enhancedPrompt = prediction.prompt
          }

          result.images.push(imageResult)
        }
      }

      return result

    } catch (error) {
      console.error('Vertex AI Service Error:', error)
      return {
        success: false,
        model: request.model,
        images: [],
        error: `Service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * 获取模型信息
   */
  getModelInfo(modelId: string) {
    return ImagenModels[modelId as keyof typeof ImagenModels] || null
  }

  /**
   * 获取所有支持的模型
   */
  getAllModels() {
    return ImagenModels
  }
}

// 导出默认实例（需要在使用前配置projectId）
export const vertexAIService = new VertexAIService('your-project-id', 'us-central1')