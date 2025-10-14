# 图片模型增强架构设计方案 V9

## 📋 概述

本方案旨在在不破坏现有代码和路由的基础上，通过新增独立路由的方式，为 AI HTML Generator V9 项目增加多个图片模型提供商支持，包括阿里通义万相、字节跳动即梦4.0、Stability AI、Hugging Face、Azure OpenAI、Replicate 等。

## 🎯 设计原则

### 核心原则
1. **零破坏性**: 不修改现有路由和工作流程
2. **安全隔离**: 新增路由独立处理，通过内部 API 对接现有系统
3. **API Key 前端管理**: 所有 API Key 由前端输入，后端不存储
4. **渐进式集成**: 新功能通过现有图片处理流程融入系统
5. **向下兼容**: 保持现有 Cloudflare Workers AI 等提供商正常工作

### 技术策略
- **新增配置管理路由**: 专门处理新模型的配置和参数
- **统一图片处理接口**: 新模型生成的图片通过现有 R2 存储和代理系统
- **异步任务集成**: 新模型任务通过现有 KV 存储状态跟踪系统
- **WordPress 兼容**: 生成的图片自动适配现有 WordPress 转换 API

## 🏗️ 整体架构

### 当前工作流程 (保持不变)
```
用户输入 → HTML生成 → 图片占位符识别 → 现有图片生成API → R2存储 → WordPress转换
```

### 增强后的工作流程
```
用户输入 → HTML生成 → 图片占位符识别 → [路由选择器] → [新增图片生成API] → R2存储 → WordPress转换
                                              ↓
                                        [现有图片生成API] 
```

### 路由分层设计
```
/api/generate (现有) - 保持原有逻辑
/api/v2/image-providers (新增) - 图片提供商管理
/api/v2/image-generate (新增) - 统一图片生成入口
/api/v2/config (新增) - 配置管理
```

## 🔧 新增路由设计

### 1. 图片提供商配置路由: `/api/v2/image-providers`

#### 1.1 获取提供商列表
**GET** `/api/v2/image-providers`

**Response:**
```json
{
  "providers": [
    {
      "id": "alibaba-dashscope",
      "name": "阿里通义万相",
      "category": "commercial",
      "models": ["wanx-v1", "alt_diffusion_v2"],
      "capabilities": ["text2img", "style_transfer"],
      "requiresApiKey": true,
      "configSchema": {
        "apiKey": { "type": "string", "required": true },
        "model": { "type": "string", "default": "wanx-v1" },
        "size": { "type": "string", "default": "1024*1024", "enum": ["1024*1024", "720*1280", "1280*720"] }
      }
    },
    {
      "id": "bytedance-ark",
      "name": "字节跳动即梦4.0", 
      "category": "commercial",
      "models": ["doubao-seedream-4-0", "doubao-seedream-3-0-t2i"],
      "capabilities": ["text2img", "img2img", "sequential_generation"],
      "requiresApiKey": true,
      "configSchema": {
        "apiKey": { "type": "string", "required": true },
        "model": { "type": "string", "default": "doubao-seedream-4-0-250828" },
        "size": { "type": "string", "default": "2K", "enum": ["1K", "2K"] },
        "sequential_image_generation": { "type": "string", "default": "disabled", "enum": ["disabled", "auto"] }
      }
    }
  ]
}
```

#### 1.2 获取特定提供商详情
**GET** `/api/v2/image-providers/{providerId}`

**Response (以阿里为例):**
```json
{
  "id": "alibaba-dashscope",
  "name": "阿里通义万相",
  "description": "阿里云DashScope平台提供的文本到图像生成服务",
  "baseUrl": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image_synthesis",
  "authType": "bearer",
  "models": [
    {
      "id": "wanx-v1",
      "name": "通义万相 V1",
      "capabilities": ["text2img", "style_transfer"],
      "maxSize": "1024*1024",
      "supportedSizes": ["1024*1024", "720*1280", "1280*720"]
    }
  ],
  "parameters": {
    "prompt": { "type": "string", "required": true, "maxLength": 500 },
    "negative_prompt": { "type": "string", "required": false, "maxLength": 300 },
    "size": { "type": "string", "default": "1024*1024" },
    "n": { "type": "integer", "default": 1, "min": 1, "max": 4 },
    "seed": { "type": "integer", "required": false }
  }
}
```

### 2. 统一图片生成路由: `/api/v2/image-generate`

#### 2.1 生成图片任务
**POST** `/api/v2/image-generate`

**Request Body:**
```json
{
  "provider": "alibaba-dashscope",
  "model": "wanx-v1", 
  "prompt": "一只穿着太空服的猫，在月球上跳跃",
  "config": {
    "apiKey": "user-provided-api-key",
    "negative_prompt": "模糊，低质量",
    "size": "1024*1024",
    "n": 1,
    "seed": 12345
  },
  "metadata": {
    "jobId": "1760297087138-a5vznkp2kf", // 关联的HTML生成任务
    "imageIndex": 0, // 在HTML中的第几张图片
    "altText": "太空猫咪" // 原始alt属性
  }
}
```

**Response:**
```json
{
  "taskId": "img_task_1760297087138_0",
  "status": "processing",
  "provider": "alibaba-dashscope", 
  "estimatedTime": 30,
  "message": "图片生成任务已提交"
}
```

#### 2.2 查询生成状态
**GET** `/api/v2/image-generate/{taskId}`

**Response (处理中):**
```json
{
  "taskId": "img_task_1760297087138_0",
  "status": "processing",
  "provider": "alibaba-dashscope",
  "progress": 65,
  "message": "正在生成图片..."
}
```

**Response (完成):**
```json
{
  "taskId": "img_task_1760297087138_0", 
  "status": "completed",
  "provider": "alibaba-dashscope",
  "result": {
    "imageUrl": "/api/image-proxy/img_task_1760297087138_0.jpg",
    "proxyUrl": "https://ai-html-generator-v9.pages.dev/api/image-proxy/img_task_1760297087138_0.jpg",
    "wordpressCompatibleUrl": "/api/image-proxy/img_task_1760297087138_0.jpg",
    "metadata": {
      "width": 1024,
      "height": 1024,
      "format": "jpeg", 
      "seed": 12345,
      "generationTime": 28.5
    }
  }
}
```

### 3. 配置管理路由: `/api/v2/config`

#### 3.1 保存用户配置 (可选，用于会话级别)
**POST** `/api/v2/config/session`

**Request Body:**
```json
{
  "provider": "alibaba-dashscope",
  "config": {
    "model": "wanx-v1",
    "defaultSize": "1024*1024",
    "defaultN": 1
  },
  "apiKeyHash": "sha256-hash-for-identification" // 用于识别用户会话，不存储实际key
}
```

## 📝 各提供商请求体设计

### 1. 阿里巴巴通义万相 (alibaba-dashscope)

#### 必需字段
- `apiKey` (string): DashScope API密钥
- `prompt` (string): 图片生成提示词

#### 可选字段
- `model` (string): 模型版本，默认 "wanx-v1"
- `negative_prompt` (string): 负向提示词
- `size` (string): 图片尺寸，默认 "1024*1024"
- `n` (integer): 生成数量，默认 1，范围 [1,4]
- `seed` (integer): 随机种子
- `style` (string): 预设风格

#### 内部转换逻辑
```typescript
const alibabaRequest = {
  model: config.model || "wanx-v1",
  input: {
    prompt: prompt,
    negative_prompt: config.negative_prompt
  },
  parameters: {
    size: config.size || "1024*1024", 
    n: config.n || 1,
    seed: config.seed,
    style: config.style
  }
}
```

### 2. 字节跳动即梦4.0 (bytedance-ark)

#### 必需字段
- `apiKey` (string): 火山方舟 API密钥
- `prompt` (string): 图片生成提示词

#### 可选字段
- `model` (string): 模型版本，默认 "doubao-seedream-4-0-250828"
- `size` (string): 图片尺寸，默认 "2K"，可选 ["1K", "2K"]
- `sequential_image_generation` (string): 是否生成组图，默认 "disabled"
- `response_format` (string): 返回格式，默认 "url"
- `watermark` (boolean): 是否添加水印，默认 true
- `stream` (boolean): 是否流式返回，默认 false

#### 内部转换逻辑
```typescript
const bytedanceRequest = {
  model: config.model || "doubao-seedream-4-0-250828",
  prompt: prompt,
  size: config.size || "2K",
  sequential_image_generation: config.sequential_image_generation || "disabled",
  stream: config.stream || false,
  response_format: config.response_format || "url", 
  watermark: config.watermark !== false
}
```

### 3. Stability AI (stability-ai)

#### 必需字段
- `apiKey` (string): Stability AI API密钥
- `prompt` (string): 图片生成提示词

#### 可选字段
- `model` (string): 模型版本，默认 "stable-image-ultra"，可选 ["stable-image-ultra", "stable-image-core", "sd3.5-large"]
- `output_format` (string): 输出格式，默认 "webp"，可选 ["webp", "png", "jpeg"]
- `aspect_ratio` (string): 宽高比，默认 "1:1"
- `seed` (integer): 随机种子，范围 [0, 4294967294]

#### 内部转换逻辑
```typescript
const stabilityRequest = new FormData()
stabilityRequest.append('prompt', prompt)
stabilityRequest.append('output_format', config.output_format || 'webp')
if (config.aspect_ratio) stabilityRequest.append('aspect_ratio', config.aspect_ratio)
if (config.seed) stabilityRequest.append('seed', config.seed.toString())
```

### 4. Hugging Face (hugging-face)

#### 必需字段
- `apiKey` (string): Hugging Face Token
- `model` (string): 模型名称，如 "black-forest-labs/FLUX.1-dev"
- `prompt` (string): 图片生成提示词

#### 可选字段
- `baseUrl` (string): 自定义端点URL（用于Inference Endpoints）
- `guidance_scale` (number): 引导系数，默认 7.5
- `num_inference_steps` (number): 推理步数，默认 50
- `seed` (integer): 随机种子

#### 内部转换逻辑
```typescript
const hfRequest = {
  inputs: prompt,
  parameters: {
    guidance_scale: config.guidance_scale || 7.5,
    num_inference_steps: config.num_inference_steps || 50,
    seed: config.seed
  }
}
```

### 5. Azure OpenAI (azure-openai)

#### 必需字段
- `apiKey` (string): Azure OpenAI API密钥
- `resource` (string): Azure资源名称
- `deployment` (string): 部署名称
- `apiVersion` (string): API版本，如 "2024-02-01"
- `prompt` (string): 图片生成提示词

#### 可选字段
- `size` (string): 图片尺寸，默认 "1024x1024"
- `quality` (string): 图片质量，默认 "standard"，可选 ["standard", "hd"]
- `style` (string): 图片风格，可选 ["natural", "vivid"]
- `n` (integer): 生成数量，默认 1

#### 内部转换逻辑
```typescript
const azureRequest = {
  prompt: prompt,
  size: config.size || "1024x1024",
  quality: config.quality || "standard",
  style: config.style,
  n: config.n || 1
}
```

### 6. Replicate (replicate)

#### 必需字段
- `apiKey` (string): Replicate API Token
- `model` (string): 模型路径，如 "black-forest-labs/flux-schnell"
- `prompt` (string): 图片生成提示词

#### 可选字段
- `width` (integer): 图片宽度，默认 1024
- `height` (integer): 图片高度，默认 1024
- `guidance_scale` (number): 引导系数
- `num_inference_steps` (integer): 推理步数
- `seed` (integer): 随机种子

#### 内部转换逻辑
```typescript
const replicateRequest = {
  input: {
    prompt: prompt,
    width: config.width || 1024,
    height: config.height || 1024,
    guidance_scale: config.guidance_scale,
    num_inference_steps: config.num_inference_steps,
    seed: config.seed
  }
}
```

## 🔗 与现有工作流的集成

### 1. 现有路由保持不变
- `/api/generate` 继续处理原有的HTML生成逻辑
- `/api/jobs/status/{jobId}` 继续处理作业状态查询
- `/api/image-proxy/{imageId}` 继续处理图片代理服务

### 2. 新增路由安全对接
```typescript
// 在现有的图片生成逻辑中添加提供商路由
async function generateImageWithProvider(prompt: string, provider: string, config: any) {
  // 调用新增的统一图片生成路由
  const response = await fetch('/api/v2/image-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, prompt, config })
  })
  
  const result = await response.json()
  
  // 返回结果符合现有期望格式
  return {
    success: true,
    imageUrl: result.result?.proxyUrl || result.imageUrl,
    taskId: result.taskId
  }
}
```

### 3. 图片处理流程统一化
```typescript
// 新模型生成的图片统一通过现有R2存储
async function storeGeneratedImage(imageBuffer: ArrayBuffer, taskId: string) {
  const imageId = `enhanced_${taskId}_${Date.now()}`
  const key = `temp-images/${imageId}.jpg`
  
  // 使用现有的R2存储逻辑
  await env.R2.put(key, imageBuffer, {
    httpMetadata: { contentType: 'image/jpeg' }
  })
  
  // 返回现有格式的代理URL
  return `/api/image-proxy/${imageId}.jpg`
}
```

### 4. WordPress兼容性保持
- 新生成的图片自动获得WordPress兼容的代理URL
- 图片元数据符合现有WordPress转换API期望
- 支持现有的6小时临时存储策略

## 🎨 前端界面增强

### 1. 模型选择器增强
```html
<!-- 在现有的模型选择基础上增加提供商分类 -->
<div class="image-provider-section">
  <h4>图片生成提供商</h4>
  <div class="provider-tabs">
    <button class="tab-btn active" data-category="cloudflare">Cloudflare AI</button>
    <button class="tab-btn" data-category="commercial">商业模型</button>
    <button class="tab-btn" data-category="opensource">开源模型</button>
  </div>
  
  <div id="cloudflare-models" class="provider-models active">
    <!-- 现有的Cloudflare模型选项 -->
  </div>
  
  <div id="commercial-models" class="provider-models">
    <select id="commercial-provider">
      <option value="alibaba-dashscope">阿里通义万相</option>
      <option value="bytedance-ark">字节跳动即梦4.0</option>
      <option value="stability-ai">Stability AI</option>
    </select>
  </div>
</div>
```

### 2. 配置模态框
```javascript
// 当用户选择新提供商时，弹出配置模态框
function showProviderConfigModal(providerId) {
  const modal = document.getElementById('provider-config-modal')
  const configForm = document.getElementById('provider-config-form')
  
  // 根据providerId动态生成配置表单
  fetch(`/api/v2/image-providers/${providerId}`)
    .then(res => res.json())
    .then(providerInfo => {
      generateConfigForm(configForm, providerInfo.parameters)
      modal.style.display = 'block'
    })
}

function generateConfigForm(container, parameters) {
  container.innerHTML = ''
  
  Object.entries(parameters).forEach(([key, param]) => {
    const field = createFormField(key, param)
    container.appendChild(field)
  })
}
```

## 📊 状态跟踪和监控

### 1. 任务状态管理
- 使用现有的KV存储系统跟踪新模型的生成任务
- 状态包括：`queued`, `processing`, `completed`, `failed`
- 支持批量状态查询和实时更新

### 2. 错误处理和回退
- API失败时自动回退到现有的多层回退机制
- 记录失败原因和提供商响应时间统计
- 用户友好的错误提示和建议

### 3. 性能监控
- 跟踪各提供商的平均响应时间
- 监控成功率和失败原因分布
- 成本追踪（如果提供商按API调用收费）

## 🔒 安全性考虑

### 1. API Key安全
- 所有API Key在前端输入，后端不持久化存储
- 使用HTTPS传输，在内存中临时保存
- 支持会话级别的配置缓存（加密存储）

### 2. 请求验证
- 严格的参数验证和过滤
- 防止注入攻击和恶意提示词
- 限制请求频率和并发数

### 3. 数据隐私
- 生成的图片遵循现有的6小时自动删除策略
- 不记录用户的提示词内容
- 符合GDPR和其他隐私法规要求

## 🚀 实施计划

### Phase 1: 核心架构 (1-2周)
1. 创建新增路由的基础框架
2. 实现提供商配置管理系统
3. 建立统一的图片生成接口规范

### Phase 2: 提供商集成 (2-3周)
1. 集成阿里巴巴通义万相
2. 集成字节跳动即梦4.0
3. 集成Stability AI

### Phase 3: 开源模型支持 (1-2周)
1. 集成Hugging Face Inference API
2. 集成Replicate平台
3. 支持自定义模型端点

### Phase 4: 前端界面和体验优化 (1周)
1. 实现新的提供商选择界面
2. 添加实时状态监控和进度显示
3. 完善错误处理和用户提示

### Phase 5: 测试和部署 (1周)
1. 全面测试各提供商集成
2. 性能优化和安全审查
3. 生产环境部署和监控

## 📈 预期收益

### 1. 功能增强
- 图片生成质量和多样性大幅提升
- 用户选择更加丰富和灵活
- 支持商业级和开源模型混合使用

### 2. 技术优势
- 架构清晰，易于维护和扩展
- 零风险升级，现有功能完全不受影响
- 模块化设计，便于后续添加新提供商

### 3. 用户体验
- 更快的图片生成速度（并行多提供商）
- 更高的成功率（智能回退机制）
- 更好的图片质量和风格选择

## 🎉 总结

本增强方案通过新增独立路由的方式，在完全不影响现有系统的前提下，为AI HTML Generator V9项目添加了强大的多提供商图片生成能力。方案设计考虑了安全性、可维护性和用户体验，能够seamlessly集成到现有的WordPress兼容工作流中，为用户提供更丰富、更高质量的AI图片生成服务。

---

**文档版本**: v1.0  
**最后更新**: 2024-10-12  
**适用项目**: AI HTML Generator V9 扩展模型支持