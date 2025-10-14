/**
 * Cloudflare环境绑定类型定义
 */
export interface CloudflareBindings {
  // D1数据库绑定
  DB?: D1Database
  
  // KV存储绑定 - 任务状态管理
  JOBS?: KVNamespace
  
  // KV存储绑定 (通用)
  KV?: KVNamespace
  
  // R2对象存储绑定
  R2?: R2Bucket
  
  // 环境变量
  ENVIRONMENT?: string
}

/**
 * AI模型配置接口
 */
export interface ModelConfig {
  id: string
  name: string
  provider: string
  type: 'text' | 'image'
  requiresApiKey: boolean
  apiKeyName?: string
  maxTokens?: number
  supportedFeatures?: string[]
}

/**
 * API响应接口
 */
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 生成进度接口
 */
export interface GenerationProgress {
  step: number
  totalSteps: number
  currentTask: string
  status: 'running' | 'completed' | 'error'
  result?: string
}

/**
 * HTML生成配置接口
 */
export interface GenerationConfig {
  topic: string
  textModel: string
  imageModel: string
  includeImages: boolean
  seoOptimization: boolean
  responsiveDesign: boolean
  convertToBase64: boolean
}

/**
 * SDK客户端状态接口
 */
export interface SDKStatus {
  openai: boolean
  anthropic: boolean
  google: boolean
}

/**
 * 模型测试结果接口
 */
export interface ModelTestResult {
  modelId: string
  success: boolean
  responseTime?: number
  error?: string
  sampleResponse?: string
}

/**
 * 异步任务状态
 */
export type AsyncJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * 异步任务接口
 */
export interface AsyncJob {
  id: string
  status: AsyncJobStatus
  requestData: any // 保持原始请求数据格式不变
  htmlStructure?: string
  imagesData?: Array<{
    placeholder: string
    url?: string
    error?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
  }>
  errorMessage?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

/**
 * 异步生成响应接口
 */
export interface AsyncGenerationResponse {
  success: boolean
  jobId: string
  status: AsyncJobStatus
  html?: string // 立即返回的HTML框架
  message?: string
  error?: string
}