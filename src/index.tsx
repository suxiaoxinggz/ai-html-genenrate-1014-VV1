import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { CloudflareBindings, APIResponse, SDKStatus, ModelTestResult } from './types'
import { sdkService } from './services/SDKService'
import { NanoBananaService, NanoBananaConfig } from './services/NanoBananaService'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
// In production (Cloudflare Pages), static files are served directly by the platform
// In development, serve from the built output directory
app.use('/static/*', serveStatic({ root: './' }))

// Main landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>智能HTML页面生成器 - AI驱动的专业网页制作工具</title>
        <meta name="description" content="使用AI模型自动生成包含完整SEO优化、响应式设计和高质量配图的专业网页。支持QWEN3、Claude、GPT、Gemini等多种AI模型。">
        <meta name="keywords" content="AI网页生成器,HTML生成器,SEO优化,响应式设计,QWEN3,Claude,GPT,Gemini">
        
        <!-- Open Graph -->
        <meta property="og:title" content="智能HTML页面生成器">
        <meta property="og:description" content="AI驱动的专业网页制作工具，自动生成SEO优化的响应式网页">
        <meta property="og:type" content="website">
        
        <!-- Local Tailwind CSS -->
        <link href="/static/styles.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-3">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                            <i class="fas fa-magic text-white text-sm"></i>
                        </div>
                        <h1 class="text-xl font-bold text-gray-900">AI HTML Generator</h1>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Generator Section -->
        <section id="generator" class="py-16 bg-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h3 class="text-3xl font-bold text-gray-900 mb-4">智能HTML页面生成器</h3>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto">只需描述您的需求，AI将为您生成专业的英文响应式网页</p>
                </div>

                <div class="bg-gray-50 rounded-2xl p-8">
                    <!-- Model Configuration Section -->
                    <div class="mb-8 model-section pl-6">
                        <h4 class="text-xl font-semibold mb-6 flex items-center">
                            <i class="fas fa-cogs mr-2 text-blue-600"></i>
                            模型配置
                        </h4>
                        
                        <!-- Model Selection Mode -->
                        <div class="mb-6 bg-white p-4 rounded-lg border">
                            <label class="block text-sm font-medium text-gray-700 mb-3">模型选择模式:</label>
                            <div class="flex space-x-6">
                                <label class="flex items-center">
                                    <input type="radio" name="modelMode" value="unified" class="mr-2">
                                    <span>统一模式</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="modelMode" value="separated" checked class="mr-2">
                                    <span class="font-medium text-blue-600">分离模式 (推荐)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Text Model Configuration -->
                        <div class="mb-6 bg-white p-4 rounded-lg border">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                文字模型: 
                                <button onclick="fetchModels('text')" class="ml-2 text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-sync-alt text-sm"></i> 获取模型
                                </button>
                                <button onclick="testTextModel()" class="ml-2 text-orange-600 hover:text-orange-800">
                                    <i class="fas fa-flask text-sm"></i> 测试模型
                                </button>
                            </label>
                            <select id="textModelProvider" onchange="updateTextModels()" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3">
                                <option value="qwen3">QWEN3系列 (旧版)</option>
                                <option value="qwen3-new">QWEN3系列 (新版)</option>
                                <option value="claude">Claude 3.5</option>
                                <option value="openai">OpenAI GPT</option>
                                <option value="gemini">Gemini</option>
                                <option value="custom-openai">自定义OpenAI协议</option>
                            </select>
                            <input type="password" id="textApiKey" placeholder="API Key (本地存储，不会上传服务器)" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3">
                            <select id="textModel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="qwen-max">qwen-max</option>
                                <option value="qwen-plus">qwen-plus</option>
                                <option value="qwen-turbo">qwen-turbo</option>
                            </select>
                            <!-- Custom OpenAI Configuration -->
                            <div id="customOpenaiConfig" class="hidden mt-3 space-y-3">
                                <input type="url" id="customBaseUrl" placeholder="自定义Base URL (例如: https://api.openai.com/v1)" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <input type="text" id="customModelName" placeholder="模型名称 (例如: gpt-4-turbo)" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>

                        <!-- Image Model Configuration -->
                        <div class="mb-6 bg-white p-4 rounded-lg border">
                            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                图片模型: 
                                <button onclick="fetchModels('image')" class="ml-2 text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-sync-alt text-sm"></i> 获取模型
                                </button>
                                <button onclick="testImageGeneration()" class="ml-2 text-green-600 hover:text-green-800">
                                    <i class="fas fa-image text-sm"></i> 测试图片生成
                                </button>
                            </label>
                            <select id="imageModelProvider" onchange="updateImageModels()" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3">
                                <option value="vertex-ai-imagen" selected>🚀 Vertex AI Imagen (官方)</option>
                                <option value="chatgpt">🤖 ChatGPT (gpt-image-1, dall-e-2, dall-e-3)</option>
                                <option value="qwen-vl">QWEN-VL系列</option>
                                <option value="qwen-image">QWEN图像生成</option>
                                <option value="wanx-v1">万相-WanX V1</option>
                                <option value="dalle3">DALL-E 3</option>
                                <option value="gemini-imagen">Gemini Imagen 3</option>
                                <option value="nano-banana">Nano Banana (Gemini)</option>
                                <option value="imagen-4">Gemini Imagen 4</option>
                                <option value="openai-compatible">OpenAI协议兼容</option>
                                <option value="bytedance-jimeng">🚀 字节跳动 豆包 即梦4.0</option>
                                <option value="cloudflare-workers-ai">☁️ Cloudflare Workers AI</option>
                                <option value="unsplash">Unsplash (免费)</option>
                                <option value="pollinations">Pollinations (免费)</option>
                            </select>
                            <input type="password" id="imageApiKey" placeholder="API Key (本地存储，不会上传服务器)" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3">
                            <select id="imageModel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="qwen-vl-max">qwen-vl-max</option>
                                <option value="qwen-vl-plus">qwen-vl-plus</option>
                            </select>
                            <!-- OpenAI Compatible Configuration -->
                            <div id="imageOpenaiConfig" class="hidden mt-3 space-y-3">
                                <input type="url" id="imageBaseUrl" placeholder="Base URL (例如: https://api.openai.com/v1)" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <input type="text" id="imageModelName" placeholder="模型名称 (例如: dall-e-3)" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <!-- Vertex AI Imagen Configuration -->
                            <div id="vertexAIImagenConfig" class="hidden mt-3 space-y-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <div class="flex items-center mb-2">
                                    <i class="fab fa-google text-blue-600 mr-2"></i>
                                    <h4 class="font-semibold text-gray-800">Google Cloud Vertex AI 配置</h4>
                                </div>
                                
                                <input type="text" id="gcpProjectId" placeholder="GCP Project ID (例如: my-project-123)" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                
                                <select id="gcpLocation" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="us-central1">us-central1 (推荐)</option>
                                    <option value="europe-west2">europe-west2</option>
                                    <option value="asia-northeast3">asia-northeast3</option>
                                </select>
                                
                                <input type="password" id="gcpAccessToken" placeholder="Google Cloud Access Token" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                
                                <div class="text-sm text-gray-600 bg-white p-3 rounded border">
                                    <p><strong>获取Access Token:</strong></p>
                                    <code class="text-xs">gcloud auth print-access-token</code>
                                    <p class="mt-1 text-xs">或通过Google Cloud Console API密钥管理获取</p>
                                </div>
                                
                                <!-- 高级参数配置 -->
                                <div class="border-t pt-3">
                                    <label class="flex items-center cursor-pointer" onclick="toggleVertexAIAdvanced()">
                                        <input type="checkbox" id="showVertexAIAdvanced" class="mr-2">
                                        <span class="text-sm font-medium text-gray-700">显示高级参数</span>
                                        <i class="fas fa-chevron-down ml-2 text-xs text-gray-500" id="vertexAIAdvancedIcon"></i>
                                    </label>
                                </div>
                                
                                <div id="vertexAIAdvancedParams" class="hidden space-y-3 pt-3 border-t">
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">宽高比</label>
                                            <select id="vertexAspectRatio" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                                <option value="1:1">1:1 (方形)</option>
                                                <option value="3:4">3:4 (广告/社媒)</option>
                                                <option value="4:3">4:3 (电视/摄影)</option>
                                                <option value="16:9">16:9 (横向)</option>
                                                <option value="9:16">9:16 (纵向)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">生成数量</label>
                                            <select id="vertexSampleCount" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                                <option value="1">1张</option>
                                                <option value="2">2张</option>
                                                <option value="3">3张</option>
                                                <option value="4">4张</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">输出格式</label>
                                            <select id="vertexMimeType" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                                <option value="image/png">PNG</option>
                                                <option value="image/jpeg">JPEG</option>
                                                <option value="image/webp">WebP</option>
                                            </select>
                                        </div>
                                        <div id="jpegQualityDiv" class="hidden">
                                            <label class="block text-sm font-medium text-gray-700 mb-1">JPEG质量</label>
                                            <input type="number" id="vertexCompressionQuality" min="1" max="100" value="85" 
                                                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">人物生成</label>
                                            <select id="vertexPersonGeneration" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                                <option value="allow_adult">允许成年人</option>
                                                <option value="dont_allow">禁止人物</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">安全设置</label>
                                            <select id="vertexSafetySetting" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                                <option value="block_medium_and_above">中等安全 (推荐)</option>
                                                <option value="block_low_and_above">最高安全</option>
                                                <option value="block_only_high">最低安全</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center space-x-4">
                                        <label class="flex items-center">
                                            <input type="checkbox" id="vertexAddWatermark" checked class="mr-2">
                                            <span class="text-sm text-gray-700">启用数字水印</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" id="vertexEnhancePrompt" checked class="mr-2">
                                            <span class="text-sm text-gray-700">提示词增强</span>
                                        </label>
                                    </div>
                                    
                                    <div class="flex items-center space-x-4">
                                        <label class="flex items-center">
                                            <input type="checkbox" id="vertexIncludeRaiReason" class="mr-2">
                                            <span class="text-sm text-gray-700">包含RAI原因</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" id="vertexIncludeSafetyAttributes" class="mr-2">
                                            <span class="text-sm text-gray-700">安全属性</span>
                                        </label>
                                    </div>
                                    
                                    <div class="flex items-center space-x-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" id="vertexUseSeed" class="mr-2">
                                            <span class="text-sm text-gray-700">固定种子</span>
                                        </label>
                                        <input type="number" id="vertexSeed" placeholder="1-2147483647" min="1" max="2147483647" 
                                            class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" disabled>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cost Estimation -->
                        <div class="bg-white p-4 rounded-lg border">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">成本预估: </span>
                                <span id="costEstimate" class="font-semibold text-green-600">≈ $0.25/页面</span>
                                <button onclick="setCostLimit()" class="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600">
                                    💰 设置上限
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Page Configuration Section -->
                    <div class="mb-8 model-section pl-6">
                        <h4 class="text-xl font-semibold mb-4 flex items-center">
                            <i class="fas fa-palette mr-2 text-purple-600"></i>
                            页面配置
                        </h4>
                        
                        <div class="bg-white p-4 rounded-lg border mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">页面标题:</label>
                            <input type="text" id="pageTitle" placeholder="例如：Elite Coffee Shop Official Website" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div class="bg-white p-4 rounded-lg border mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">页面需求描述: (至少6行输入框)</label>
                            <textarea id="contentDescription" rows="8" placeholder="我想要一个精品咖啡店的官网&#10;需要展示不同产地的咖啡豆&#10;包含价格表、联系方式和在线订购&#10;风格要现代简约，温暖的色调&#10;需要FAQ常见问题解答&#10;展示团队成员介绍&#10;&#10;注意：用户输入中文，但生成的网页内容将是英文" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"></textarea>
                            
                            <div class="mt-3">
                                <button id="advancedPromptToggle" onclick="toggleAdvancedPrompt()" class="text-blue-600 hover:text-blue-800 flex items-center">
                                    <i class="fas fa-chevron-down mr-2"></i>
                                    展开专业提示词设置 (高级用户可编辑)
                                </button>
                                <div id="advancedPromptSection" class="hidden mt-3">
                                    <textarea id="advancedPrompt" rows="10" placeholder="系统将根据您的需求自动生成专业提示词..." 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 text-sm"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-white p-4 rounded-lg border">
                                <label class="block text-sm font-medium text-gray-700 mb-2">主题色号:</label>
                                <div class="flex space-x-3">
                                    <input type="color" id="themeColor" value="#8B4513" class="w-16 h-12 border border-gray-300 rounded-lg">
                                    <input type="text" id="themeColorText" value="#8B4513" 
                                        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>
                            <div class="bg-white p-4 rounded-lg border">
                                <label class="block text-sm font-medium text-gray-700 mb-2">页面类型:</label>
                                <select id="pageType" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="homepage">首页</option>
                                    <option value="product-list">产品列表页</option>
                                    <option value="blog">博客页</option>
                                    <option value="feature">功能页</option>
                                    <option value="product-detail">产品详情页</option>
                                    <option value="contact">联系我们</option>
                                    <option value="about">关于我们页</option>
                                    <option value="policy">政策页</option>
                                    <option value="article">文章页</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Image Models Section (V2 API) -->
                    <div class="mb-8 model-section pl-6">
                        <h4 class="text-xl font-semibold mb-4 flex items-center">
                            <i class="fas fa-magic mr-2 text-purple-600"></i>
                            增强图片模型 (多提供商支持)
                            <span class="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">NEW</span>
                        </h4>
                        
                        <!-- Provider Selector -->
                        <div class="bg-white p-4 rounded-lg border mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-3">选择图片生成提供商:</label>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <!-- Cloudflare Workers AI (Default) -->
                                <label class="provider-option cursor-pointer">
                                    <input type="radio" name="imageProvider" value="cloudflare" checked class="sr-only">
                                    <div class="provider-card border-2 border-blue-500 bg-blue-50 rounded-lg p-4 transition-all">
                                        <div class="flex items-center mb-2">
                                            <i class="fab fa-cloudflare text-orange-500 mr-2 text-lg"></i>
                                            <span class="font-medium text-blue-800">Cloudflare AI</span>
                                            <span class="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">默认</span>
                                        </div>
                                        <p class="text-xs text-gray-600">免费额度，快速生成，无需API Key</p>
                                    </div>
                                </label>

                                <!-- Alibaba DashScope -->
                                <label class="provider-option cursor-pointer">
                                    <input type="radio" name="imageProvider" value="alibaba-dashscope" class="sr-only">
                                    <div class="provider-card border-2 border-gray-300 hover:border-orange-500 rounded-lg p-4 transition-all">
                                        <div class="flex items-center mb-2">
                                            <i class="fas fa-cloud text-orange-600 mr-2"></i>
                                            <span class="font-medium">阿里通义万相</span>
                                            <span class="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">商业</span>
                                        </div>
                                        <p class="text-xs text-gray-600">高质量中文理解，支持多种尺寸</p>
                                    </div>
                                </label>

                                <!-- ByteDance Ark -->
                                <label class="provider-option cursor-pointer">
                                    <input type="radio" name="imageProvider" value="bytedance-ark" class="sr-only">
                                    <div class="provider-card border-2 border-gray-300 hover:border-red-500 rounded-lg p-4 transition-all">
                                        <div class="flex items-center mb-2">
                                            <i class="fas fa-bolt text-red-600 mr-2"></i>
                                            <span class="font-medium">字节即梦4.0</span>
                                            <span class="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">2K高清</span>
                                        </div>
                                        <p class="text-xs text-gray-600">超高清生成，支持组图模式</p>
                                    </div>
                                </label>

                                <!-- Stability AI -->
                                <label class="provider-option cursor-pointer">
                                    <input type="radio" name="imageProvider" value="stability-ai" class="sr-only">
                                    <div class="provider-card border-2 border-gray-300 hover:border-purple-500 rounded-lg p-4 transition-all">
                                        <div class="flex items-center mb-2">
                                            <i class="fas fa-palette text-purple-600 mr-2"></i>
                                            <span class="font-medium">Stability AI</span>
                                            <span class="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">Ultra</span>
                                        </div>
                                        <p class="text-xs text-gray-600">专业摄影级质量，艺术风格丰富</p>
                                    </div>
                                </label>

                                <!-- Hugging Face -->
                                <label class="provider-option cursor-pointer">
                                    <input type="radio" name="imageProvider" value="hugging-face" class="sr-only">
                                    <div class="provider-card border-2 border-gray-300 hover:border-yellow-500 rounded-lg p-4 transition-all">
                                        <div class="flex items-center mb-2">
                                            <i class="fas fa-robot text-yellow-600 mr-2"></i>
                                            <span class="font-medium">Hugging Face</span>
                                            <span class="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">FLUX</span>
                                        </div>
                                        <p class="text-xs text-gray-600">开源模型，FLUX系列，社区驱动</p>
                                    </div>
                                </label>

                                <!-- Replicate -->
                                <label class="provider-option cursor-pointer">
                                    <input type="radio" name="imageProvider" value="replicate" class="sr-only">
                                    <div class="provider-card border-2 border-gray-300 hover:border-green-500 rounded-lg p-4 transition-all">
                                        <div class="flex items-center mb-2">
                                            <i class="fas fa-sync-alt text-green-600 mr-2"></i>
                                            <span class="font-medium">Replicate</span>
                                            <span class="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">云端</span>
                                        </div>
                                        <p class="text-xs text-gray-600">云端运行，多种开源模型选择</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Provider Configuration -->
                        <div id="providerConfig" class="bg-white p-4 rounded-lg border mb-4">
                            <!-- Cloudflare Config (Default - No API Key needed) -->
                            <div id="cloudflare-config" class="provider-config">
                                <div class="flex items-center mb-3">
                                    <i class="fab fa-cloudflare text-orange-500 mr-2"></i>
                                    <h5 class="font-medium text-gray-800">Cloudflare Workers AI 配置</h5>
                                </div>
                                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p class="text-sm text-green-700">
                                        <i class="fas fa-check-circle mr-2"></i>
                                        无需配置API Key，使用现有Cloudflare Workers AI服务
                                    </p>
                                </div>
                            </div>

                            <!-- Alibaba DashScope Config -->
                            <div id="alibaba-dashscope-config" class="provider-config hidden">
                                <div class="flex items-center mb-3">
                                    <i class="fas fa-cloud text-orange-600 mr-2"></i>
                                    <h5 class="font-medium text-gray-800">阿里通义万相配置</h5>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">DashScope API Key *</label>
                                        <input type="password" id="alibaba-api-key" placeholder="sk-xxx..." 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500">
                                        <p class="text-xs text-gray-500 mt-1">
                                            <a href="https://dashscope.console.aliyun.com/" target="_blank" class="text-blue-600 hover:underline">
                                                获取API Key →
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
                                        <select id="alibaba-model" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500">
                                            <option value="wanx-v1">通义万相 V1 (推荐)</option>
                                            <option value="alt_diffusion_v2">Alt Diffusion V2</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">图片尺寸</label>
                                        <select id="alibaba-size" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500">
                                            <option value="1024*1024">1024×1024 (正方形)</option>
                                            <option value="720*1280">720×1280 (竖向)</option>
                                            <option value="1280*720">1280×720 (横向)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
                                        <select id="alibaba-n" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500">
                                            <option value="1">1张</option>
                                            <option value="2">2张</option>
                                            <option value="3">3张</option>
                                            <option value="4">4张</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- ByteDance Ark Config -->
                            <div id="bytedance-ark-config" class="provider-config hidden">
                                <div class="flex items-center mb-3">
                                    <i class="fas fa-bolt text-red-600 mr-2"></i>
                                    <h5 class="font-medium text-gray-800">字节跳动即梦4.0配置</h5>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">火山方舟 API Key *</label>
                                        <input type="password" id="bytedance-api-key" placeholder="Bearer token..." 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500">
                                        <p class="text-xs text-gray-500 mt-1">
                                            <a href="https://console.volcengine.com/ark" target="_blank" class="text-blue-600 hover:underline">
                                                获取API Key →
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
                                        <select id="bytedance-model" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500">
                                            <option value="doubao-seedream-4-0-250828">即梦4.0 (推荐)</option>
                                            <option value="doubao-seedream-3-0-t2i-250415">即梦3.0文生图</option>
                                            <option value="doubao-seededit-3-0-i2i-250628">即梦3.0图生图</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-3 mt-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">分辨率</label>
                                        <select id="bytedance-size" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500">
                                            <option value="2K">2K (3104×1312)</option>
                                            <option value="1K">1K (1024×1024)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">组图模式</label>
                                        <select id="bytedance-sequential" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500">
                                            <option value="disabled">单张图片</option>
                                            <option value="auto">自动组图</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="flex items-center pt-6">
                                            <input type="checkbox" id="bytedance-watermark" checked class="mr-2">
                                            <span class="text-sm">水印标识</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Stability AI Config -->
                            <div id="stability-ai-config" class="provider-config hidden">
                                <div class="flex items-center mb-3">
                                    <i class="fas fa-palette text-purple-600 mr-2"></i>
                                    <h5 class="font-medium text-gray-800">Stability AI 配置</h5>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Stability API Key *</label>
                                        <input type="password" id="stability-api-key" placeholder="sk-xxx..." 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                                        <p class="text-xs text-gray-500 mt-1">
                                            <a href="https://platform.stability.ai/account/keys" target="_blank" class="text-blue-600 hover:underline">
                                                获取API Key →
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
                                        <select id="stability-model" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                                            <option value="stable-image-ultra">Stable Image Ultra (8学分)</option>
                                            <option value="stable-image-core">Stable Image Core (3学分)</option>
                                            <option value="sd3.5-large">SD3.5 Large (6.5学分)</option>
                                            <option value="sd3.5-large-turbo">SD3.5 Large Turbo (4学分)</option>
                                            <option value="sd3.5-medium">SD3.5 Medium (3.5学分)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-3 mt-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">宽高比</label>
                                        <select id="stability-aspect-ratio" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                                            <option value="1:1">1:1 (正方形)</option>
                                            <option value="16:9">16:9 (横向)</option>
                                            <option value="9:16">9:16 (竖向)</option>
                                            <option value="4:5">4:5 (竖向)</option>
                                            <option value="5:4">5:4 (横向)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                                        <select id="stability-output-format" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                                            <option value="webp">WebP (推荐)</option>
                                            <option value="png">PNG</option>
                                            <option value="jpeg">JPEG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">风格预设</label>
                                        <select id="stability-style-preset" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                                            <option value="">无预设</option>
                                            <option value="photographic">摄影</option>
                                            <option value="digital-art">数字艺术</option>
                                            <option value="cinematic">电影</option>
                                            <option value="anime">动漫</option>
                                            <option value="fantasy-art">奇幻艺术</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Hugging Face Config -->
                            <div id="hugging-face-config" class="provider-config hidden">
                                <div class="flex items-center mb-3">
                                    <i class="fas fa-robot text-yellow-600 mr-2"></i>
                                    <h5 class="font-medium text-gray-800">Hugging Face 配置</h5>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Hugging Face Token *</label>
                                        <input type="password" id="hf-api-key" placeholder="hf_xxx..." 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500">
                                        <p class="text-xs text-gray-500 mt-1">
                                            <a href="https://huggingface.co/settings/tokens" target="_blank" class="text-blue-600 hover:underline">
                                                获取Token →
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
                                        <select id="hf-model" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500">
                                            <option value="black-forest-labs/FLUX.1-dev">FLUX.1-dev (推荐)</option>
                                            <option value="ByteDance/SDXL-Lightning">SDXL-Lightning</option>
                                            <option value="Qwen/Qwen-Image">Qwen-Image</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Endpoint URL (可选，用于私有推理端点)</label>
                                    <input type="url" id="hf-base-url" placeholder="https://your-endpoint.endpoints.huggingface.cloud" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500">
                                    <p class="text-xs text-gray-500 mt-1">留空使用公共推理API，填写使用私有Inference Endpoint</p>
                                </div>
                            </div>

                            <!-- Replicate Config -->
                            <div id="replicate-config" class="provider-config hidden">
                                <div class="flex items-center mb-3">
                                    <i class="fas fa-sync-alt text-green-600 mr-2"></i>
                                    <h5 class="font-medium text-gray-800">Replicate 配置</h5>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Replicate API Token *</label>
                                        <input type="password" id="replicate-api-key" placeholder="r8_xxx..." 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                                        <p class="text-xs text-gray-500 mt-1">
                                            <a href="https://replicate.com/account/api-tokens" target="_blank" class="text-blue-600 hover:underline">
                                                获取Token →
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
                                        <select id="replicate-model" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                                            <option value="black-forest-labs/flux-schnell">FLUX Schnell (快速)</option>
                                            <option value="black-forest-labs/flux-dev">FLUX Dev</option>
                                            <option value="black-forest-labs/flux-1.1-pro">FLUX 1.1 Pro</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">图片宽度</label>
                                        <input type="number" id="replicate-width" value="1024" min="256" max="2048" step="64" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">图片高度</label>
                                        <input type="number" id="replicate-height" value="1024" min="256" max="2048" step="64" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Generation Status -->
                        <div id="v2-generation-status" class="bg-blue-50 border border-blue-200 rounded-lg p-4 hidden">
                            <div class="flex items-center">
                                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                <div>
                                    <p class="font-medium text-blue-800">正在使用增强模型生成图片...</p>
                                    <p id="v2-status-detail" class="text-sm text-blue-600 mt-1">准备中...</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <div class="bg-blue-200 rounded-full h-2">
                                    <div id="v2-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>

                        <!-- V2 Test Button -->
                        <div class="bg-white p-4 rounded-lg border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h5 class="font-medium text-gray-800 mb-1">增强模型测试</h5>
                                    <p class="text-sm text-gray-600">测试所选提供商的连通性和图片生成能力</p>
                                </div>
                                <button onclick="testV2ImageGeneration()" 
                                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                                    <i class="fas fa-flask mr-2"></i>
                                    测试生成
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Action Controls Section -->
                    <div class="mb-8 model-section pl-6">
                        <h4 class="text-xl font-semibold mb-4 flex items-center">
                            <i class="fas fa-play mr-2 text-green-600"></i>
                            操作控制
                        </h4>
                        
                        <div class="bg-white p-6 rounded-lg border">
                            <!-- WordPress兼容性选项 -->
                            <div class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-500">
                                <div class="flex items-center mb-3">
                                    <i class="fab fa-wordpress text-blue-600 mr-2 text-lg"></i>
                                    <label class="block text-sm font-medium text-gray-700">WordPress兼容性配置</label>
                                </div>
                                
                                <div class="space-y-3">
                                    <label class="flex items-center cursor-pointer">
                                        <input type="checkbox" id="wordpressCompatible" checked class="mr-3 w-4 h-4 text-blue-600">
                                        <div>
                                            <span class="font-medium text-green-700">启用WordPress兼容模式 (推荐)</span>
                                            <p class="text-xs text-gray-600 mt-1">
                                                自动转换图片为WordPress可识别的HTTP URL，支持自动下载和本地化
                                            </p>
                                        </div>
                                    </label>
                                    
                                    <div id="wordpressOptions" class="ml-7 space-y-2 border-l-2 border-gray-200 pl-3">
                                        <div class="text-xs text-gray-500">
                                            <i class="fas fa-clock mr-1"></i>
                                            <strong>临时图片链接:</strong> 6小时有效期，请及时导入WordPress
                                        </div>
                                        <div class="text-xs text-gray-500">
                                            <i class="fas fa-download mr-1"></i>
                                            <strong>使用方法:</strong> 下载HTML → 导入WordPress → 系统自动本地化图片
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 传统格式选项 (高级用户) -->
                                <details class="mt-4">
                                    <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                        <i class="fas fa-cog mr-1"></i>
                                        高级选项: 传统图片格式
                                    </summary>
                                    <div class="mt-3 space-y-2">
                                        <label class="flex items-center text-sm">
                                            <input type="radio" name="imageFormat" value="url" checked class="mr-2">
                                            <span>HTTP URL (WordPress兼容)</span>
                                        </label>
                                        <label class="flex items-center text-sm">
                                            <input type="radio" name="imageFormat" value="base64" class="mr-2">
                                            <span>Base64嵌入 (体积较大)</span>
                                        </label>
                                    </div>
                                </details>
                            </div>
                            
                            <div class="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
                                <button id="generateBtn" onclick="startGeneration()" 
                                    class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                    <i class="fas fa-magic mr-2"></i>
                                    开始制作
                                </button>
                                <button id="previewBtn" onclick="previewHTML()" disabled
                                    class="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                    <i class="fas fa-eye mr-2"></i>
                                    预览
                                </button>
                                <button id="copyBtn" onclick="copyHTML()" disabled
                                    class="bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                    <i class="fas fa-copy mr-2"></i>
                                    复制代码
                                </button>
                                <button id="downloadBtn" onclick="downloadHTML()" disabled
                                    class="bg-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                    <i class="fas fa-download mr-2"></i>
                                    下载HTML
                                </button>
                            </div>

                            <!-- Progress Display -->
                            <div id="progressSection" class="hidden">
                                <div class="mb-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-medium text-gray-700">生成进度:</span>
                                        <span id="progressPercentage" class="text-sm text-gray-600">85%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-4">
                                        <div id="progressBar" class="bg-blue-600 h-4 rounded-full transition-all duration-500" style="width: 85%"></div>
                                    </div>
                                </div>
                                <p id="progressMessage" class="text-sm text-gray-600 text-center">状态: 正在生成图片... (3/5 已完成)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Result Display -->
                    <div id="resultSection" class="hidden model-section pl-6">
                        <h4 class="text-xl font-semibold mb-4 flex items-center text-green-600">
                            <i class="fas fa-check-circle mr-2"></i>
                            生成完成！
                        </h4>
                        <div class="bg-white rounded-lg border p-6">
                            <div class="bg-gray-100 rounded-lg p-4 max-h-96 overflow-auto">
                                <pre id="generatedHTML" class="text-sm text-gray-800 whitespace-pre-wrap"></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            let generatedHTMLContent = '';
            let costLimit = 1.0;



            // Load saved API keys from localStorage
            function loadSavedKeys() {
                const textKey = localStorage.getItem('textApiKey');
                const imageKey = localStorage.getItem('imageApiKey');
                if (textKey) document.getElementById('textApiKey').value = textKey;
                if (imageKey) document.getElementById('imageApiKey').value = imageKey;
                
                // 初始化SDK服务
                initializeSDKService();
            }

            // SDK服务相关功能 - 设置为全局变量
            window.sdkStatus = { openai: false, anthropic: false, google: false };

            async function initializeSDKService() {
                try {
                    // 收集所有可用的API密钥
                    const apiKeys = {};
                    
                    const textKey = localStorage.getItem('textApiKey');
                    const imageKey = localStorage.getItem('imageApiKey');
                    
                    // 根据具体选择的模型来初始化SDK，而不是根据提供商
                    const textProvider = document.getElementById('textModelProvider')?.value;
                    const imageProvider = document.getElementById('imageModelProvider')?.value;
                    const selectedTextModel = document.getElementById('textModel')?.value;
                    const selectedImageModel = document.getElementById('imageModel')?.value;
                    
                    // 🔧 修复: 只在选择特定模型时才初始化对应的SDK
                    if (textKey) {
                        // OpenAI SDK - 只在选择OpenAI文本模型或DALL-E图像模型时初始化
                        if (textProvider === 'openai' || 
                            imageProvider === 'dalle3' || 
                            (selectedTextModel && selectedTextModel.includes('gpt')) ||
                            (selectedImageModel && selectedImageModel.includes('dall'))) {
                            apiKeys.openai = textKey;
                        }
                        // Anthropic SDK - 只在选择Claude模型时初始化
                        else if (textProvider === 'claude' || 
                                (selectedTextModel && selectedTextModel.includes('claude'))) {
                            apiKeys.anthropic = textKey;
                        }
                        // Google AI SDK - 为Gemini文本模型初始化，即使图像使用nano-banana
                        else if (textProvider === 'gemini' || 
                                (selectedTextModel && selectedTextModel.includes('gemini'))) {
                            apiKeys.google = textKey;
                            if (imageProvider === 'nano-banana') {
                                console.log('🔧 Google SDK initialized for Gemini text model, Nano Banana will use backend proxy only');
                            } else {
                                console.log('🔧 Google SDK initialized for text model:', selectedTextModel || textProvider);
                            }
                        }
                    }
                    
                    // 图像API密钥处理 - 只在实际选择DALL-E时使用OpenAI SDK
                    if (imageKey && (imageProvider === 'dalle3' || 
                                   (selectedImageModel && selectedImageModel.includes('dall'))) && 
                        !apiKeys.openai) {
                        apiKeys.openai = imageKey;
                    }

                    // 如果有API密钥，初始化SDK客户端
                    if (Object.keys(apiKeys).length > 0) {
                        const response = await fetch('/api/sdk/init', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ apiKeys })
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            console.log('✅ SDK initialized:', result.data.initialized);
                            updateSDKStatus();
                        } else {
                            console.warn('⚠️ SDK initialization failed:', result.error);
                        }
                    }
                    
                } catch (error) {
                    console.error('SDK initialization error:', error);
                }
            }

            async function updateSDKStatus() {
                try {
                    const response = await fetch('/api/sdk/status');
                    const result = await response.json();
                    
                    if (result.success) {
                        window.sdkStatus = result.data;
                        updateSDKStatusDisplay();
                    }
                } catch (error) {
                    console.error('Failed to get SDK status:', error);
                }
            }

            function updateSDKStatusDisplay() {
                // 在UI中显示SDK状态（如果有相应的元素）
                const statusElement = document.getElementById('sdkStatus');
                if (statusElement) {
                    const availableSDKs = Object.entries(window.sdkStatus)
                        .filter(([_, available]) => available)
                        .map(([name, _]) => name)
                        .join(', ');
                    
                    statusElement.textContent = availableSDKs 
                        ? 'SDK可用: ' + availableSDKs
                        : 'SDK未初始化';
                }
            }

            async function testSDKModel(modelId) {
                try {
                    const response = await fetch('/api/sdk/test', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ models: [modelId] })
                    });
                    
                    const result = await response.json();
                    if (result.success && result.data.length > 0) {
                        const testResult = result.data[0];
                        if (testResult.success) {
                            console.log('✅ Model ' + modelId + ' test passed (' + testResult.responseTime + 'ms)');
                            return true;
                        } else {
                            console.warn('❌ Model ' + modelId + ' test failed:', testResult.error);
                            return false;
                        }
                    }
                } catch (error) {
                    console.error('SDK model test error for ' + modelId + ':', error);
                    return false;
                }
            }

            // 使用SDK生成内容的增强版本
            async function generateWithSDK(prompt, provider) {
                try {
                    const response = await fetch('/api/sdk/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ prompt, provider })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        return result.data;
                    } else {
                        throw new Error(result.error);
                    }
                } catch (error) {
                    console.error('SDK generation error:', error);
                    throw error;
                }
            }

            // Save API keys to localStorage
            function saveApiKey(type, key) {
                localStorage.setItem(type + 'ApiKey', key);
            }

            // 🔧 统一配置收集函数 - 避免后端访问localStorage
            function collectUnifiedConfig() {
                // 安全的存储访问
                const safeGet = (k) => {
                    try { 
                        return sessionStorage.getItem(k) || localStorage.getItem(k); 
                    } catch { 
                        return null; 
                    }
                };
                const json = (k, defaultValue) => { 
                    try { 
                        const val = safeGet(k);
                        return val ? JSON.parse(val) : defaultValue; 
                    } catch { 
                        return defaultValue; 
                    } 
                };

                return {
                    text: {
                        provider: document.getElementById('textModelProvider')?.value || 'test',
                        model: document.getElementById('textModel')?.value || '',
                        apiKey: safeGet('textApiKey') || '',
                        baseUrl: document.getElementById('customBaseUrl')?.value || '',
                        customModelName: document.getElementById('customModelName')?.value || ''
                    },
                    image: {
                        provider: document.getElementById('imageModelProvider')?.value || 'unsplash',
                        model: document.getElementById('imageModel')?.value || '',
                        apiKey: safeGet('imageApiKey') || '',
                        // 🔧 修复：添加输出格式选择
                        outputFormat: document.querySelector('input[name="imageFormat"]:checked')?.value || 'url',
                        
                        // ✨ V2 API 增强配置
                        v2Provider: document.querySelector('input[name="imageProvider"]:checked')?.value,
                        v2Model: (() => {
                            const provider = document.querySelector('input[name="imageProvider"]:checked')?.value;
                            switch(provider) {
                                case 'alibaba-dashscope': return document.getElementById('alibaba-model')?.value;
                                case 'bytedance-ark': return document.getElementById('bytedance-model')?.value;
                                case 'stability-ai': return document.getElementById('stability-model')?.value;
                                case 'hugging-face': return document.getElementById('hf-model')?.value;
                                case 'replicate': return document.getElementById('replicate-model')?.value;
                                default: return '@cf/bytedance/stable-diffusion-xl-lightning';
                            }
                        })(),
                        v2Config: (() => {
                            const provider = document.querySelector('input[name="imageProvider"]:checked')?.value;
                            const config = { provider };
                            
                            switch(provider) {
                                case 'alibaba-dashscope':
                                    config.apiKey = document.getElementById('alibaba-api-key')?.value?.trim();
                                    config.size = document.getElementById('alibaba-size')?.value;
                                    config.n = parseInt(document.getElementById('alibaba-n')?.value) || 1;
                                    break;
                                case 'bytedance-ark':
                                    config.apiKey = document.getElementById('bytedance-api-key')?.value?.trim();
                                    config.size = document.getElementById('bytedance-size')?.value;
                                    config.sequential_image_generation = document.getElementById('bytedance-sequential')?.value;
                                    config.watermark = document.getElementById('bytedance-watermark')?.checked;
                                    break;
                                case 'stability-ai':
                                    config.apiKey = document.getElementById('stability-api-key')?.value?.trim();
                                    config.aspect_ratio = document.getElementById('stability-aspect-ratio')?.value;
                                    config.output_format = document.getElementById('stability-output-format')?.value;
                                    config.style_preset = document.getElementById('stability-style-preset')?.value;
                                    break;
                                case 'hugging-face':
                                    config.apiKey = document.getElementById('hf-api-key')?.value?.trim();
                                    config.baseUrl = document.getElementById('hf-base-url')?.value?.trim();
                                    break;
                                case 'replicate':
                                    config.apiKey = document.getElementById('replicate-api-key')?.value?.trim();
                                    config.width = parseInt(document.getElementById('replicate-width')?.value) || 1024;
                                    config.height = parseInt(document.getElementById('replicate-height')?.value) || 1024;
                                    break;
                            }
                            return config;
                        })(),
                        
                        // Vertex AI 配置
                        vertexAI: json('vertexAIConfig', { projectId: '', location: '', accessToken: '' }),
                        // ChatGPT 配置
                        chatGPT: json('chatGPTConfig', {}),
                        // Nano Banana 配置
                        nanoBanana: json('nanoBananaConfig', { basePromptStyle: '', styleEnhancement: '' }),
                        // Cloudflare Workers AI 配置
                        cloudflareWorkersAI: json('cloudflareWorkersAIConfig', { 
                            apiKey: '', 
                            accountId: '', 
                            model: '@cf/bytedance/stable-diffusion-xl-lightning', 
                            steps: 20,
                            guidance: 7.5,
                            width: 1024,
                            height: 1024,
                            negativePrompt: '',
                            seed: null
                        }),
                        // OpenAI Compatible 配置
                        openaiCompatible: json('customImageOpenAIConfig', { 
                            apiKey: '', 
                            baseUrl: '', 
                            model: 'dall-e-3',
                            outputFormat: 'url'
                        }),
                        baseUrl: document.getElementById('imageBaseUrl')?.value || '',
                        customModelName: document.getElementById('imageModelName')?.value || ''
                    },
                    limits: {
                        costLimit: parseFloat(safeGet('costLimit') || '1') || 1
                    }
                };
            }

            // 🔧 可靠的请求函数 - 自动重试503等临时错误
            async function makeReliableRequest(url, data, maxRetries = 3) {
                let lastError = null;
                
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        console.log(\`📡 Attempt \${attempt}/\${maxRetries} to \${url}\`);
                        
                        const response = await axios.post(url, data, {
                            timeout: 120000, // 2分钟超时
                            validateStatus: function (status) {
                                // 重试这些状态码
                                if ([503, 502, 504, 429, 500].includes(status)) {
                                    return false; // 触发错误，进入重试逻辑
                                }
                                return status >= 200 && status < 300; // 正常响应
                            }
                        });
                        
                        console.log(\`✅ Request successful on attempt \${attempt}\`);
                        
                        // 🔧 安全的响应头读取 - 如果将来需要从响应头读取token
                        // 使用兼容 Axios/Fetch 的通用写法
                        const getResponseHeader = (headerName) => {
                            try {
                                // AxiosHeaders/Headers 方式
                                if (response.headers?.get) {
                                    return response.headers.get(headerName);
                                }
                                // 普通对象方式
                                return response.headers?.[headerName.toLowerCase()];
                            } catch (error) {
                                console.warn('Error reading response header:', headerName, error);
                                return undefined;
                            }
                        };
                        
                        // 示例：如果需要读取authorization头（但推荐在JSON中返回token）
                        // const token = getResponseHeader('authorization');
                        
                        return response;
                        
                    } catch (error) {
                        lastError = error;
                        const status = error.response?.status;
                        const isRetriable = !error.response || 
                                          [503, 502, 504, 429, 500].includes(status) ||
                                          error.code === 'NETWORK_ERROR' ||
                                          error.message?.toLowerCase().includes('timeout');
                        
                        console.log(\`⚠️ Request attempt \${attempt} failed:\`, {
                            status: status || 'No status',
                            message: error.message,
                            retriable: isRetriable
                        });
                        
                        if (!isRetriable || attempt === maxRetries) {
                            console.error(\`❌ Request failed permanently after \${attempt} attempts\`);
                            throw error;
                        }
                        
                        // 指数退避等待
                        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                        console.log(\`⏳ Waiting \${waitTime}ms before retry...\`);
                        
                        // 更新进度条显示重试状态
                        updateProgress(
                            5 + (attempt * 2), 
                            \`请求失败，\${waitTime/1000}秒后重试...\`
                        );
                        
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
                
                throw lastError;
            }

            // 🔄 异步任务状态轮询 - 等待图片处理完成
            async function pollJobStatus(jobId) {
                console.log(\`🔄 [\${jobId}] Starting job status polling\`);
                const maxAttempts = 60; // 最多轮询5分钟 (每5秒一次)
                let attempt = 0;
                
                while (attempt < maxAttempts) {
                    try {
                        const response = await axios.get(\`/api/jobs/\${jobId}/status\`, {
                            timeout: 10000 // 10秒超时
                        });
                        
                        if (response.data.success) {
                            const status = response.data.status;
                            const progress = response.data.progress || 33;
                            const currentStep = response.data.currentStep || 1;
                            const steps = response.data.steps || [];
                            
                            console.log(\`📊 [\${jobId}] Status: \${status}, Progress: \${progress}%, Step: \${currentStep}\`);
                            
                            // 🚀 CRITICAL FIX: 自动触发图片处理 (解决Cloudflare Pages Functions限制)
                            if (status === 'pending' && currentStep === 1 && response.data.htmlReady && attempt === 1) {
                                console.log(\`🔄 [\${jobId}] Auto-triggering image processing on first poll\`);
                                
                                try {
                                    const processResponse = await axios.post(\`/api/jobs/\${jobId}/process\`, {}, {
                                        timeout: 30000 // 30秒超时，给图片处理充足时间
                                    });
                                    
                                    if (processResponse.data.success) {
                                        console.log(\`✅ [\${jobId}] Auto-trigger successful, processing completed\`);
                                        // 立即检查完成状态，无需继续轮询
                                        const finalResponse = await axios.get(\`/api/jobs/\${jobId}/status\`, {
                                            timeout: 10000
                                        });
                                        
                                        if (finalResponse.data.status === 'completed') {
                                            generatedHTMLContent = finalResponse.data.finalHtml;
                                            showResult();
                                            return; // 提前退出轮询
                                        }
                                    } else {
                                        console.log(\`⚠️ [\${jobId}] Auto-trigger failed:\`, processResponse.data.error);
                                    }
                                } catch (processError) {
                                    console.log(\`❌ [\${jobId}] Auto-trigger error:\`, processError.message);
                                    // 继续正常轮询流程
                                }
                            }
                            
                            // 显示当前步骤的详细进度
                            let progressMessage = '处理中...';
                            if (steps.length > 0 && currentStep <= steps.length) {
                                const currentStepInfo = steps[currentStep - 1];
                                progressMessage = currentStepInfo ? currentStepInfo.name : progressMessage;
                            }
                            
                            if (status === 'completed') {
                                // 🎉 所有处理完成，获取最终HTML
                                if (response.data.finalHtml) {
                                    generatedHTMLContent = response.data.finalHtml;
                                    
                                    // 更新显示
                                    showResult();
                                    updateProgress(100, '🎉 全部生成完成！包含图片');
                                    
                                    // Enable all buttons
                                    document.getElementById('copyBtn').disabled = false;
                                    document.getElementById('downloadBtn').disabled = false;
                                    
                                    console.log(\`✅ [\${jobId}] All stages completed successfully\`);
                                    return; // 完成，退出轮询
                                }
                            } else if (status === 'failed') {
                                // ❌ 处理失败，但HTML框架可用
                                const errorMsg = response.data.error ? \`: \${response.data.error}\` : '';
                                updateProgress(progress, \`❌ \${progressMessage}失败\${errorMsg}，HTML框架可用\`);
                                document.getElementById('copyBtn').disabled = false;
                                document.getElementById('downloadBtn').disabled = false;
                                console.warn(\`❌ [\${jobId}] Job failed at step \${currentStep}, but HTML available\`);
                                return;
                            } else if (status === 'processing') {
                                // 🔄 处理中，显示详细进度
                                updateProgress(progress, \`🔄 \${progressMessage} (\${progress}%)\`);
                                
                                // 如果HTML内容更新了，实时更新显示
                                if (response.data.finalHtml && response.data.finalHtml !== generatedHTMLContent) {
                                    generatedHTMLContent = response.data.finalHtml;
                                    showResult(); // 实时更新，让用户看到图片逐步填充
                                }
                            }
                        }
                        
                    } catch (error) {
                        console.warn(\`⚠️ [\${jobId}] Status check failed (attempt \${attempt + 1}):\`, error.message);
                        
                        // 轮询失败不是致命错误，继续尝试
                        if (attempt > 5) {
                            // 5次失败后降级处理
                            updateProgress(100, '图片可能仍在处理中，HTML框架可用');
                            document.getElementById('copyBtn').disabled = false;
                            document.getElementById('downloadBtn').disabled = false;
                            return;
                        }
                    }
                    
                    // 等待5秒后下次轮询
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    attempt++;
                }
                
                // 超时处理
                console.warn(\`⏰ [\${jobId}] Polling timeout after \${maxAttempts} attempts\`);
                updateProgress(100, '图片处理超时，HTML框架可用');
                document.getElementById('copyBtn').disabled = false;
                document.getElementById('downloadBtn').disabled = false;
            }

            // Theme color synchronization
            document.getElementById('themeColor').addEventListener('change', function(e) {
                document.getElementById('themeColorText').value = e.target.value;
                updateCostEstimate();
            });
            
            document.getElementById('themeColorText').addEventListener('change', function(e) {
                document.getElementById('themeColor').value = e.target.value;
                updateCostEstimate();
            });

            // API key saving
            document.getElementById('textApiKey').addEventListener('change', function(e) {
                saveApiKey('text', e.target.value);
            });
            
            document.getElementById('imageApiKey').addEventListener('change', function(e) {
                saveApiKey('image', e.target.value);
            });

            // Model provider changes
            function updateTextModels() {
                const provider = document.getElementById('textModelProvider').value;
                const modelSelect = document.getElementById('textModel');
                const customConfig = document.getElementById('customOpenaiConfig');
                
                // Clear existing options
                modelSelect.innerHTML = '';
                
                // Show/hide custom configuration
                if (provider === 'custom-openai') {
                    customConfig.classList.remove('hidden');
                } else {
                    customConfig.classList.add('hidden');
                }
                
                // Add models based on provider - 2025最新模型
                const models = {
                    'qwen3': ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen2.5-72b-instruct'],
                    'qwen3-new': ['qwen3-70b-instruct', 'qwen3-32b-instruct', 'qwen3-14b-instruct', 'qwen3-7b-instruct'],
                    'claude': ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'],
                    'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
                    'gemini': ['gemini-2.5-pro', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
                    'custom-openai': ['自定义模型']
                };
                
                models[provider].forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });
                
                updateCostEstimate();
            }

            function updateImageModels() {
                const provider = document.getElementById('imageModelProvider').value;
                const modelSelect = document.getElementById('imageModel');
                const openaiConfig = document.getElementById('imageOpenaiConfig');
                const vertexAIConfig = document.getElementById('vertexAIImagenConfig');
                
                // Clear existing options
                modelSelect.innerHTML = '';
                
                // Show/hide configurations - 改为弹窗模式
                if (provider === 'openai-compatible') {
                    openaiConfig.classList.remove('hidden');
                    vertexAIConfig.classList.add('hidden');
                } else if (provider === 'vertex-ai-imagen') {
                    // Vertex AI使用弹窗配置
                    console.log('Selected Vertex AI Imagen, showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    // 使用setTimeout确保函数已定义
                    setTimeout(() => {
                        if (window.showVertexAIConfigModal) {
                            window.showVertexAIConfigModal();
                        } else {
                            console.error('showVertexAIConfigModal not yet defined, retrying...');
                        }
                    }, 100);
                } else if (provider === 'chatgpt') {
                    // ChatGPT使用弹窗配置
                    console.log('Selected ChatGPT, showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    // 使用setTimeout确保函数已定义
                    setTimeout(() => {
                        if (window.showChatGPTConfigModal) {
                            window.showChatGPTConfigModal();
                        } else {
                            console.error('showChatGPTConfigModal not yet defined, retrying...');
                        }
                    }, 100);
                } else if (provider === 'nano-banana') {
                    // Nano Banana使用弹窗配置
                    console.log('Selected Nano Banana, showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    openNanoBananaModal();
                } else if (provider === 'bytedance-jimeng') {
                    // 字节跳动即梦4.0使用弹窗配置
                    console.log('Selected ByteDance Jimeng 4.0, showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    openByteDanceJimengModal();
                } else if (provider === 'cloudflare-workers-ai') {
                    // Cloudflare Workers AI使用弹窗配置
                    console.log('Selected Cloudflare Workers AI, showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    openCloudflareWorkersAIModal();
                } else if (provider === 'openai-compatible') {
                    // 🔧 新增: 自定义图像OpenAI协议使用弹窗配置
                    console.log('Selected Custom Image OpenAI, showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    openCustomImageOpenAIModal();
                } else if (provider === 'unsplash' || provider === 'pollinations') {
                    // 🔧 修复: Unsplash 和 Pollinations 使用弹窗配置（支持可选API Key）
                    console.log('Selected ' + provider + ', showing modal configuration...');
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                    openFreeServiceModal(provider);
                } else {
                    openaiConfig.classList.add('hidden');
                    vertexAIConfig.classList.add('hidden');
                }
                
                // Add models based on provider - 2025最新图像模型
                const models = {
                    'vertex-ai-imagen': ['imagen-4.0-generate-001', 'imagen-4.0-fast-generate-001', 'imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001'],
                    'chatgpt': ['gpt-image-1', 'dall-e-3', 'dall-e-2'],
                    'qwen-vl': ['qwen-vl-max', 'qwen-vl-plus', 'qwen2-vl-72b-instruct'],
                    'qwen-image': ['qwen-image-plus', 'qwen-image'],
                    'wanx-v1': ['wanx-v1'],
                    'dalle3': ['dall-e-3'],
                    'gemini-imagen': ['gemini-imagen-3.0', 'gemini-imagen-2.0', 'imagen-3', 'imagen-2'],
                    'nano-banana': ['gemini-2.5-flash-image-preview'],
                    'imagen-4': ['imagen-4.0-generate-001', 'imagen-4.0-fast-generate-001'],
                    'openai-compatible': ['dall-e-3', 'dall-e-2'], // 默认OpenAI模型，可通过API获取更多
                    'bytedance-jimeng': ['doubao-seedream-4-0-250828', 'doubao-seedream-3-0-t2i-250415', 'doubao-seededit-3-0-i2i-250628'],
                    'cloudflare-workers-ai': ['@cf/bytedance/stable-diffusion-xl-lightning', '@cf/stabilityai/stable-diffusion-xl-base-1.0', '@cf/runwayml/stable-diffusion-v1-5-inpainting', '@cf/black-forest-labs/flux-1-schnell'],
                    'unsplash': ['unsplash-api'],
                    'pollinations': ['pollinations-free']
                };
                
                if (models[provider]) {
                    console.log('Adding ' + models[provider].length + ' models for provider: ' + provider);
                    models[provider].forEach(model => {
                        const option = document.createElement('option');
                        option.value = model;
                        option.textContent = model;
                        
                        // Add descriptions for Vertex AI models
                        if (provider === 'vertex-ai-imagen') {
                            const descriptions = {
                                'imagen-4.0-generate-001': 'Imagen 4.0 Generate - 追求画质、合规',
                                'imagen-4.0-fast-generate-001': 'Imagen 4.0 Fast - 快速产图',
                                'imagen-3.0-generate-002': 'Imagen 3.0 Generate - 稳定(20 RPM)',
                                'imagen-3.0-fast-generate-001': 'Imagen 3.0 Fast - 高速(200 RPM)'
                            };
                            option.textContent = descriptions[model] || model;
                            console.log('Added Vertex AI model: ' + model + ' -> ' + option.textContent);
                        }
                        
                        // Add descriptions for ChatGPT models
                        if (provider === 'chatgpt') {
                            const descriptions = {
                                'gpt-image-1': 'GPT Image 1 - 最新多模态图像生成',
                                'dall-e-3': 'DALL-E 3 - 高质量图像生成',
                                'dall-e-2': 'DALL-E 2 - 经典稳定模型'
                            };
                            option.textContent = descriptions[model] || model;
                            console.log('Added ChatGPT model: ' + model + ' -> ' + option.textContent);
                        }
                        
                        // Add descriptions for Nano Banana models
                        if (provider === 'nano-banana') {
                            const descriptions = {
                                'gemini-2.5-flash-image-preview': 'Gemini 2.5 Flash Image Preview - 快速图像生成'
                            };
                            option.textContent = descriptions[model] || model;
                            console.log('Added Nano Banana model: ' + model + ' -> ' + option.textContent);
                        }
                        
                        // Add descriptions for ByteDance Jimeng models
                        if (provider === 'bytedance-jimeng') {
                            const descriptions = {
                                'doubao-seedream-4-0-250828': '即梦4.0 - 文生图/图生图/组图生成，最新版本',
                                'doubao-seedream-3-0-t2i-250415': '即梦3.0 文生图 - 文字转图像专用',
                                'doubao-seededit-3-0-i2i-250628': '即梦3.0 图生图 - 图像编辑专用'
                            };
                            option.textContent = descriptions[model] || model;
                            console.log('Added ByteDance Jimeng model: ' + model + ' -> ' + option.textContent);
                        }
                        
                        modelSelect.appendChild(option);
                    });
                } else {
                    console.warn('No models found for provider: ' + provider);
                }
                
                updateCostEstimate();
                // 🔧 在图像模型选择变化时重新初始化SDK
                initializeSDKService();
            }

            // Update text model options based on provider selection
            function updateTextModels() {
                const provider = document.getElementById('textModelProvider').value;
                const modelSelect = document.getElementById('textModel');
                const customConfig = document.getElementById('customOpenaiConfig');
                
                // Show/hide custom config
                if (provider === 'custom-openai') {
                    customConfig.classList.remove('hidden');
                } else {
                    customConfig.classList.add('hidden');
                }
                
                // Update model options based on provider - 2024年最新模型
                const defaultModels = {
                    'qwen3': ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen2.5-72b-instruct', 'qwen2.5-32b-instruct'],
                    'qwen3-new': ['qwen3-70b-instruct', 'qwen3-32b-instruct', 'qwen3-14b-instruct', 'qwen3-7b-instruct'],
                    'claude': ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'],
                    'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
                    'gemini': ['gemini-2.5-pro', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
                    'custom-openai': ['自定义模型']
                };
                
                const models = defaultModels[provider] || [];
                modelSelect.innerHTML = '';
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });
            }
            


            // Fetch models from API
            window.fetchModels = async function fetchModels(type) {
                const provider = document.getElementById(type + 'ModelProvider').value;
                const apiKey = document.getElementById(type + 'ApiKey').value;
                
                console.log('Fetching models for ' + type + ' provider: ' + provider);
                
                // 🔧 修复: 更新服务分类，支持可选API Key的免费服务
                const trueFreeServices = []; // 完全免费，无需API Key
                const optionalKeyServices = ['pollinations', 'unsplash']; // 可选API Key，有无限制不同
                const paidServices = ['qwen3', 'qwen3-new', 'claude', 'openai', 'gemini', 'custom-openai', 'qwen-vl', 'qwen-image', 'wanx-v1', 'dalle3', 'gemini-imagen', 'nano-banana', 'imagen-4', 'openai-compatible', 'cloudflare-workers-ai'];
                
                if (!apiKey && paidServices.includes(provider)) {
                    alert('请先输入API Key');
                    return;
                }
                
                // 对于可选API Key的服务，显示提示信息
                if (!apiKey && optionalKeyServices.includes(provider)) {
                    console.log('🔧 ' + provider + ': 无API Key，将使用基础免费服务');
                }
                
                // 显示加载状态
                const fetchButton = event.target;
                const originalText = fetchButton.innerHTML;
                fetchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 获取中...';
                fetchButton.disabled = true;
                
                try {
                    const headers = {};
                    if (apiKey) {
                        headers['X-API-Key'] = apiKey;
                    }
                    
                    // 🔧 修复: 对于自定义协议，需要传递自定义 base URL
                    let requestConfig = {
                        headers: headers,
                        timeout: 10000  // 10秒超时
                    };
                    
                    if (provider === 'custom-openai') {
                        const customBaseUrl = document.getElementById('customBaseUrl')?.value;
                        if (!customBaseUrl) {
                            alert('请先输入自定义Base URL');
                            return;
                        }
                        headers['X-Custom-Base-URL'] = customBaseUrl;
                        console.log('🔧 Custom OpenAI: Using base URL:', customBaseUrl);
                    } else if (provider === 'openai-compatible') {
                        // 🔧 新增: 图像模型自定义 OpenAI 协议支持
                        const imageCustomBaseUrl = document.getElementById('imageBaseUrl')?.value;
                        if (!imageCustomBaseUrl) {
                            alert('请先输入图像模型自定义Base URL');
                            return;
                        }
                        headers['X-Custom-Base-URL'] = imageCustomBaseUrl;
                        console.log('🔧 Custom Image OpenAI: Using base URL:', imageCustomBaseUrl);
                    }
                    
                    console.log('Making API request with headers:', headers);
                    
                    const response = await axios.get('/api/models/' + provider, requestConfig);
                    
                    console.log('API response:', response.data);
                    
                    if (response.data.success) {
                        const modelSelect = document.getElementById(type + 'Model');
                        const currentValue = modelSelect.value; // 保存当前选择
                        
                        modelSelect.innerHTML = '';
                        
                        if (response.data.models && response.data.models.length > 0) {
                            response.data.models.forEach(model => {
                                const option = document.createElement('option');
                                option.value = model;
                                option.textContent = model;
                                modelSelect.appendChild(option);
                            });
                            
                            // 尝试恢复之前的选择
                            if (currentValue && response.data.models.includes(currentValue)) {
                                modelSelect.value = currentValue;
                            }
                            
                            alert('成功获取 ' + response.data.models.length + ' 个' + (type === 'text' ? '文字' : '图片') + '模型');
                        } else {
                            alert('API返回空模型列表');
                        }
                    } else {
                        throw new Error(response.data.error || '获取模型失败');
                    }
                } catch (error) {
                    console.error('Failed to fetch models:', error);
                    let errorMessage = '获取模型失败: ';
                    
                    if (error.response) {
                        errorMessage += 'HTTP ' + error.response.status + ' - ' + (error.response.data?.error || error.response.statusText);
                    } else if (error.code === 'ECONNABORTED') {
                        errorMessage += '请求超时，请检查网络连接';
                    } else {
                        errorMessage += error.message;
                    }
                    
                    alert(errorMessage);
                } finally {
                    // 恢复按钮状态
                    fetchButton.innerHTML = originalText;
                    fetchButton.disabled = false;
                }
            }

            // Cost estimation
            function updateCostEstimate() {
                const textProvider = document.getElementById('textModelProvider').value;
                const imageProvider = document.getElementById('imageModelProvider').value;
                const description = document.getElementById('contentDescription').value;
                
                // Simple cost calculation
                let baseCost = 0.05;
                
                // Text model costs
                const textCosts = {
                    'qwen3': 0.008,
                    'claude': 0.15,
                    'openai': 0.20,
                    'gemini': 0.10,
                    'custom-openai': 0.15
                };
                
                // Image model costs
                const imageCosts = {
                    'qwen-vl': 0.05,
                    'dalle3': 0.20,
                    'gemini-imagen': 0.08,
                    'openai-compatible': 0.15,
                    'cloudflare-workers-ai': 0.02,
                    'unsplash': 0.00,
                    'pollinations': 0.00
                };
                
                baseCost += textCosts[textProvider] || 0.1;
                baseCost += (imageCosts[imageProvider] || 0.1) * Math.min(Math.ceil(description.length / 100), 5);
                
                document.getElementById('costEstimate').textContent = '≈ $' + baseCost.toFixed(2) + '/页面';
                
                // Update advanced prompt
                updateAdvancedPrompt();
            }

            // Update advanced prompt
            function updateAdvancedPrompt() {
                const userInput = document.getElementById('contentDescription').value;
                const pageType = document.getElementById('pageType').value;
                const themeColor = document.getElementById('themeColorText').value;
                
                if (!userInput.trim()) return;
                
                const prompt = \`根据用户需求："$\{userInput\}"生成专业的英文HTML页面

页面配置：
- 类型：$\{pageType\}
- 主题色：$\{themeColor\}

技术要求：
- 完整HTML5 + Tailwind CSS响应式设计
- 三端适配：手机(sm:) 平板(md:) 桌面(lg: xl:)
- 完整SEO优化包含所有meta标签
- 禁止使用自定义CSS和内联样式

内容要求：
- 创造真实专业的英文内容，不用占位符
- 图片占位符格式：{{IMAGE_PLACEHOLDER_N}}
- 所有图片必须有具体的英文alt描述
- 网页内容全部使用英文

SEO优化要求：
- 智能生成结构化数据 (Schema.org)
- 根据内容自动判断需要的Schema类型
- 完整的meta标签和Open Graph支持\`;
                
                document.getElementById('advancedPrompt').value = prompt;
            }

            // Toggle advanced prompt
            window.toggleAdvancedPrompt = function toggleAdvancedPrompt() {
                const section = document.getElementById('advancedPromptSection');
                const button = document.getElementById('advancedPromptToggle');
                const icon = button.querySelector('i');
                
                if (section.classList.contains('hidden')) {
                    section.classList.remove('hidden');
                    icon.className = 'fas fa-chevron-up mr-2';
                    button.innerHTML = icon.outerHTML + '收起专业提示词设置';
                    updateAdvancedPrompt();
                } else {
                    section.classList.add('hidden');
                    icon.className = 'fas fa-chevron-down mr-2';
                    button.innerHTML = icon.outerHTML + '展开专业提示词设置 (高级用户可编辑)';
                }
            }

            // Set cost limit
            window.setCostLimit = function setCostLimit() {
                const limit = prompt('请设置成本上限 (美元):', costLimit.toString());
                if (limit && !isNaN(limit)) {
                    costLimit = parseFloat(limit);
                    alert('成本上限已设置为 $' + costLimit.toFixed(2));
                }
            }

            // ===============================================
            // 🚀 Enhanced Image Generation (V2 API) Functions
            // ===============================================
            
            // Handle provider selection
            window.handleProviderSelection = function handleProviderSelection() {
                const providers = document.querySelectorAll('input[name="imageProvider"]');
                const configs = document.querySelectorAll('.provider-config');
                
                providers.forEach(provider => {
                    provider.addEventListener('change', function() {
                        if (this.checked) {
                            // Update provider card styles
                            document.querySelectorAll('.provider-card').forEach(card => {
                                card.classList.remove('border-blue-500', 'bg-blue-50', 'border-orange-500', 'bg-orange-50', 
                                                  'border-red-500', 'bg-red-50', 'border-purple-500', 'bg-purple-50',
                                                  'border-yellow-500', 'bg-yellow-50', 'border-green-500', 'bg-green-50');
                                card.classList.add('border-gray-300');
                            });
                            
                            // Highlight selected provider
                            const selectedCard = this.parentElement.querySelector('.provider-card');
                            if (this.value === 'cloudflare') {
                                selectedCard.classList.add('border-blue-500', 'bg-blue-50');
                            } else if (this.value === 'alibaba-dashscope') {
                                selectedCard.classList.add('border-orange-500', 'bg-orange-50');
                            } else if (this.value === 'bytedance-ark') {
                                selectedCard.classList.add('border-red-500', 'bg-red-50');
                            } else if (this.value === 'stability-ai') {
                                selectedCard.classList.add('border-purple-500', 'bg-purple-50');
                            } else if (this.value === 'hugging-face') {
                                selectedCard.classList.add('border-yellow-500', 'bg-yellow-50');
                            } else if (this.value === 'replicate') {
                                selectedCard.classList.add('border-green-500', 'bg-green-50');
                            }
                            selectedCard.classList.remove('border-gray-300');
                            
                            // Show corresponding config
                            configs.forEach(config => config.classList.add('hidden'));
                            const targetConfig = document.getElementById(this.value + '-config');
                            if (targetConfig) {
                                targetConfig.classList.remove('hidden');
                            }
                        }
                    });
                });
            };

            // Collect V2 API configuration
            window.collectV2Config = function collectV2Config() {
                const selectedProvider = document.querySelector('input[name="imageProvider"]:checked');
                if (!selectedProvider) return null;
                
                const provider = selectedProvider.value;
                const config = { provider };
                
                switch (provider) {
                    case 'cloudflare':
                        // No additional config needed for Cloudflare
                        break;
                        
                    case 'alibaba-dashscope':
                        config.apiKey = document.getElementById('alibaba-api-key')?.value?.trim();
                        config.model = document.getElementById('alibaba-model')?.value || 'wanx-v1';
                        config.size = document.getElementById('alibaba-size')?.value || '1024*1024';
                        config.n = parseInt(document.getElementById('alibaba-n')?.value) || 1;
                        break;
                        
                    case 'bytedance-ark':
                        config.apiKey = document.getElementById('bytedance-api-key')?.value?.trim();
                        config.model = document.getElementById('bytedance-model')?.value || 'doubao-seedream-4-0-250828';
                        config.size = document.getElementById('bytedance-size')?.value || '2K';
                        config.sequential_image_generation = document.getElementById('bytedance-sequential')?.value || 'disabled';
                        config.watermark = document.getElementById('bytedance-watermark')?.checked ?? true;
                        break;
                        
                    case 'stability-ai':
                        config.apiKey = document.getElementById('stability-api-key')?.value?.trim();
                        config.model = document.getElementById('stability-model')?.value || 'stable-image-ultra';
                        config.aspect_ratio = document.getElementById('stability-aspect-ratio')?.value || '1:1';
                        config.output_format = document.getElementById('stability-output-format')?.value || 'webp';
                        config.style_preset = document.getElementById('stability-style-preset')?.value || '';
                        break;
                        
                    case 'hugging-face':
                        config.apiKey = document.getElementById('hf-api-key')?.value?.trim();
                        config.model = document.getElementById('hf-model')?.value || 'black-forest-labs/FLUX.1-dev';
                        config.baseUrl = document.getElementById('hf-base-url')?.value?.trim() || '';
                        break;
                        
                    case 'replicate':
                        config.apiKey = document.getElementById('replicate-api-key')?.value?.trim();
                        config.model = document.getElementById('replicate-model')?.value || 'black-forest-labs/flux-schnell';
                        config.width = parseInt(document.getElementById('replicate-width')?.value) || 1024;
                        config.height = parseInt(document.getElementById('replicate-height')?.value) || 1024;
                        break;
                }
                
                return config;
            };

            // Generate image using V2 API
            window.generateImageV2 = async function generateImageV2(prompt, altText) {
                const v2Config = collectV2Config();
                if (!v2Config) {
                    throw new Error('No V2 provider selected');
                }
                
                // Show generation status
                const statusDiv = document.getElementById('v2-generation-status');
                const statusDetail = document.getElementById('v2-status-detail');
                const progressBar = document.getElementById('v2-progress-bar');
                
                statusDiv.classList.remove('hidden');
                statusDetail.textContent = '正在连接 ' + getProviderName(v2Config.provider) + '...';
                progressBar.style.width = '10%';
                
                try {
                    // Submit generation request
                    const response = await fetch('/api/v2/image-generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            provider: v2Config.provider,
                            model: v2Config.model,
                            prompt: prompt,
                            config: v2Config
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                    }
                    
                    const result = await response.json();
                    if (!result.taskId) {
                        throw new Error('No task ID received');
                    }
                    
                    statusDetail.textContent = '任务已提交，正在生成...';
                    progressBar.style.width = '30%';
                    
                    // Poll for results
                    return await pollV2Generation(result.taskId, statusDetail, progressBar);
                    
                } catch (error) {
                    statusDiv.classList.add('hidden');
                    throw error;
                }
            };

            // Poll V2 generation status
            async function pollV2Generation(taskId, statusDetail, progressBar) {
                const maxAttempts = 60; // 5 minutes maximum
                let attempts = 0;
                
                while (attempts < maxAttempts) {
                    try {
                        const response = await fetch(\`/api/v2/image-generate/\${taskId}\`);
                        const result = await response.json();
                        
                        if (result.status === 'completed') {
                            statusDetail.textContent = '生成完成！';
                            progressBar.style.width = '100%';
                            
                            setTimeout(() => {
                                document.getElementById('v2-generation-status').classList.add('hidden');
                            }, 2000);
                            
                            return result.imageUrl;
                        } else if (result.status === 'failed') {
                            throw new Error(result.error || 'Generation failed');
                        } else {
                            // Still processing
                            const progress = Math.min(30 + (attempts * 2), 90);
                            progressBar.style.width = progress + '%';
                            statusDetail.textContent = result.message || '正在处理...';
                        }
                        
                    } catch (error) {
                        console.warn('Polling attempt failed:', error);
                    }
                    
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                }
                
                throw new Error('Generation timeout');
            }

            // Get provider display name
            function getProviderName(provider) {
                const names = {
                    'cloudflare': 'Cloudflare Workers AI',
                    'alibaba-dashscope': '阿里通义万相',
                    'bytedance-ark': '字节即梦4.0',
                    'stability-ai': 'Stability AI',
                    'hugging-face': 'Hugging Face',
                    'replicate': 'Replicate'
                };
                return names[provider] || provider;
            }

            // Main generation function
            window.startGeneration = async function startGeneration() {
                const generateBtn = document.getElementById('generateBtn');
                const progressSection = document.getElementById('progressSection');
                const resultSection = document.getElementById('resultSection');
                
                // Validate inputs
                const title = document.getElementById('pageTitle').value.trim();
                const description = document.getElementById('contentDescription').value.trim();
                const textApiKey = document.getElementById('textApiKey').value.trim();
                const imageApiKey = document.getElementById('imageApiKey').value.trim();
                
                if (!title || !description) {
                    alert('请填写页面标题和内容描述');
                    return;
                }

                const textProvider = document.getElementById('textModelProvider').value;
                const imageProvider = document.getElementById('imageModelProvider').value;
                
                // Check V2 API configuration
                const v2Config = collectV2Config();
                const usingV2API = v2Config && v2Config.provider !== 'cloudflare';
                
                // Check API keys for paid services
                if (!textApiKey && ['qwen3', 'claude', 'openai', 'gemini', 'custom-openai'].includes(textProvider)) {
                    alert('请输入文字模型的API Key');
                    return;
                }
                
                // Check V2 API keys
                if (usingV2API && v2Config.provider !== 'cloudflare' && !v2Config.apiKey) {
                    alert(\`请输入\${getProviderName(v2Config.provider)}的API Key\`);
                    return;
                }
                
                // Legacy image providers
                if (!usingV2API && !imageApiKey && ['qwen-vl', 'dalle3', 'gemini-imagen', 'openai-compatible'].includes(imageProvider)) {
                    alert('请输入图片模型的API Key');
                    return;
                }

                // Disable button and show progress
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
                progressSection.classList.remove('hidden');
                resultSection.classList.add('hidden');
                
                // Disable other buttons
                document.getElementById('previewBtn').disabled = true;
                document.getElementById('copyBtn').disabled = true;
                document.getElementById('downloadBtn').disabled = true;
                
                try {
                    // Prepare model configuration
                    const modelConfig = {
                        textModelProvider: textProvider,
                        textModelName: document.getElementById('textModel').value,
                        textApiKey: textApiKey,
                        imageModelProvider: imageProvider,
                        imageModelName: document.getElementById('imageModel').value,
                        imageApiKey: imageApiKey,
                        costLimit: costLimit
                    };
                    
                    // Add custom configuration if needed
                    if (textProvider === 'custom-openai') {
                        modelConfig.customBaseUrl = document.getElementById('customBaseUrl').value;
                        modelConfig.customModelName = document.getElementById('customModelName').value;
                    }
                    
                    if (imageProvider === 'openai-compatible') {
                        modelConfig.imageBaseUrl = document.getElementById('imageBaseUrl').value;
                        modelConfig.imageModelName = document.getElementById('imageModelName').value;
                    }
                    
                    // 🔧 为所有图像提供商加载相应的配置，并确保 API Key 正确传递
                    if (imageProvider === 'nano-banana') {
                        try {
                            const nanoBananaConfigStr = localStorage.getItem('nanoBananaConfig');
                            if (nanoBananaConfigStr) {
                                modelConfig.nanoBanana = JSON.parse(nanoBananaConfigStr);
                                // 🔧 关键修复：确保 API Key 正确传递到 imageApiKey
                                if (modelConfig.nanoBanana.apiKey && !modelConfig.imageApiKey) {
                                    modelConfig.imageApiKey = modelConfig.nanoBanana.apiKey;
                                }
                                console.log('✅ [Config] Loaded Nano Banana config from localStorage:', modelConfig.nanoBanana);
                            } else {
                                console.warn('⚠️ [Config] No Nano Banana config found in localStorage');
                            }
                        } catch (error) {
                            console.error('❌ [Config] Failed to load Nano Banana config:', error);
                        }
                    } else if (imageProvider === 'cloudflare-workers-ai') {
                        try {
                            const cloudflareConfigStr = localStorage.getItem('cloudflareWorkersAIConfig');
                            if (cloudflareConfigStr) {
                                modelConfig.cloudflareWorkersAI = JSON.parse(cloudflareConfigStr);
                                // 🔧 关键修复：确保 API Key 正确传递到 imageApiKey
                                if (modelConfig.cloudflareWorkersAI.apiKey && !modelConfig.imageApiKey) {
                                    modelConfig.imageApiKey = modelConfig.cloudflareWorkersAI.apiKey;
                                }
                                console.log('✅ [Config] Loaded Cloudflare Workers AI config from localStorage:', modelConfig.cloudflareWorkersAI);
                            } else {
                                console.warn('⚠️ [Config] No Cloudflare Workers AI config found in localStorage');
                            }
                        } catch (error) {
                            console.error('❌ [Config] Failed to load Cloudflare Workers AI config:', error);
                        }
                    } else if (imageProvider === 'bytedance-jimeng') {
                        try {
                            const byteDanceConfigStr = localStorage.getItem('byteDanceJimengConfig');
                            if (byteDanceConfigStr) {
                                modelConfig.byteDanceJimeng = JSON.parse(byteDanceConfigStr);
                                // 🔧 关键修复：确保 API Key 正确传递到 imageApiKey
                                if (modelConfig.byteDanceJimeng.apiKey && !modelConfig.imageApiKey) {
                                    modelConfig.imageApiKey = modelConfig.byteDanceJimeng.apiKey;
                                }
                                console.log('✅ [Config] Loaded ByteDance Jimeng config from localStorage:', modelConfig.byteDanceJimeng);
                            } else {
                                console.warn('⚠️ [Config] No ByteDance Jimeng config found in localStorage');
                            }
                        } catch (error) {
                            console.error('❌ [Config] Failed to load ByteDance Jimeng config:', error);
                        }
                    } else if (imageProvider === 'vertex-ai-imagen') {
                        try {
                            const vertexConfigStr = localStorage.getItem('vertexAIConfig');
                            if (vertexConfigStr) {
                                modelConfig.vertexAI = JSON.parse(vertexConfigStr);
                                // 🔧 关键修复：确保 API Key 正确传递到 imageApiKey
                                if (modelConfig.vertexAI.apiKey && !modelConfig.imageApiKey) {
                                    modelConfig.imageApiKey = modelConfig.vertexAI.apiKey;
                                }
                                console.log('✅ [Config] Loaded Vertex AI config from localStorage:', modelConfig.vertexAI);
                            } else {
                                console.warn('⚠️ [Config] No Vertex AI config found in localStorage');
                            }
                        } catch (error) {
                            console.error('❌ [Config] Failed to load Vertex AI config:', error);
                        }
                    } else if (imageProvider === 'chatgpt') {
                        try {
                            const chatgptConfigStr = localStorage.getItem('chatGPTConfig');
                            if (chatgptConfigStr) {
                                modelConfig.chatGPT = JSON.parse(chatgptConfigStr);
                                // 🔧 关键修复：确保 API Key 正确传递到 imageApiKey
                                if (modelConfig.chatGPT.apiKey && !modelConfig.imageApiKey) {
                                    modelConfig.imageApiKey = modelConfig.chatGPT.apiKey;
                                }
                                console.log('✅ [Config] Loaded ChatGPT config from localStorage:', modelConfig.chatGPT);
                            } else {
                                console.warn('⚠️ [Config] No ChatGPT config found in localStorage');
                            }
                        } catch (error) {
                            console.error('❌ [Config] Failed to load ChatGPT config:', error);
                        }
                    }
                    
                    // 获取图片格式选择
                    const imageFormat = document.querySelector('input[name="imageFormat"]:checked')?.value || 'url'
                    const convertImagesToBase64 = imageFormat === 'base64'
                    
                    // 初始化进度显示
                    updateProgress(5, '准备开始生成...');
                    
                    // 🔧 使用统一配置替代原有的 modelConfig
                    const unifiedConfig = collectUnifiedConfig();
                    
                    const requestData = {
                        userPrompt: description,
                        advancedPrompt: document.getElementById('advancedPrompt').value,
                        pageConfig: {
                            title: title,
                            description: description.slice(0, 200),
                            pageType: document.getElementById('pageType').value,
                            themeColor: document.getElementById('themeColorText').value
                        },
                        unifiedConfig: unifiedConfig,
                        outputLanguage: 'english', // 强制输出英文
                        convertImagesToBase64: convertImagesToBase64
                    };

                    console.log('Sending generation request with unified config:', {
                        ...requestData,
                        unifiedConfig: {
                            ...requestData.unifiedConfig,
                            // 不在日志中打印API密钥
                            text: { ...requestData.unifiedConfig.text, apiKey: '[REDACTED]' },
                            image: { ...requestData.unifiedConfig.image, apiKey: '[REDACTED]' }
                        }
                    });
                    // 🚀 发送异步生成请求 (保持所有配置字段不变)
                    const response = await makeReliableRequest('/api/generate', requestData);
                    
                    if (response.data.success && response.data.jobId) {
                        // ⚡ 立即显示HTML框架
                        updateProgress(30, 'HTML框架生成完成，正在处理图片...');
                        
                        // 显示初始HTML (带占位符)
                        generatedHTMLContent = response.data.html;
                        showResult(); // 立即显示结果
                        
                        // Enable preview (HTML ready)
                        document.getElementById('previewBtn').disabled = false;
                        
                        // 🔄 开始轮询任务状态 (图片处理进度)
                        await pollJobStatus(response.data.jobId);
                        
                    } else {
                        const errorStep = response.data.step || '未知阶段';
                        throw new Error(response.data.error || '生成失败于' + errorStep);
                    }
                    
                } catch (error) {
                    console.error('Generation failed:', error);
                    alert('生成失败: ' + (error.response?.data?.error || error.message));
                } finally {
                    // Reset button
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>开始制作';
                }
            }

            function updateProgress(progress, message) {
                document.getElementById('progressBar').style.width = progress + '%';
                document.getElementById('progressPercentage').textContent = progress + '%';
                document.getElementById('progressMessage').textContent = message;
            }

            function showResult() {
                document.getElementById('progressSection').classList.add('hidden');
                document.getElementById('resultSection').classList.remove('hidden');
                document.getElementById('generatedHTML').textContent = generatedHTMLContent;
            }

            window.previewHTML = function previewHTML() {
                if (!generatedHTMLContent) {
                    alert('没有可预览的内容');
                    return;
                }
                
                const previewWindow = window.open('', '_blank');
                previewWindow.document.write(generatedHTMLContent);
                previewWindow.document.close();
            }

            window.copyHTML = function copyHTML() {
                if (!generatedHTMLContent) {
                    alert('没有可复制的内容');
                    return;
                }
                
                navigator.clipboard.writeText(generatedHTMLContent).then(function() {
                    alert('HTML代码已复制到剪贴板');
                }, function(err) {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动选择代码复制');
                });
            }

            window.downloadHTML = function downloadHTML() {
                if (!generatedHTMLContent) {
                    alert('没有可下载的内容');
                    return;
                }
                
                const blob = new Blob([generatedHTMLContent], { type: 'text/html' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'generated-page.html';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }

            // Test text model
            window.testTextModel = async function testTextModel() {
                const provider = document.getElementById('textModelProvider').value;
                const apiKey = document.getElementById('textApiKey').value;
                const modelName = document.getElementById('textModel').value;
                
                if (!apiKey && ['qwen3', 'claude', 'openai', 'gemini', 'custom-openai'].includes(provider)) {
                    alert('请先输入API Key');
                    return;
                }
                
                const testButton = event.target;
                const originalText = testButton.innerHTML;
                testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
                testButton.disabled = true;
                
                try {
                    const modelConfig = {
                        textModelProvider: provider,
                        textModelName: modelName,
                        textApiKey: apiKey
                    };
                    
                    if (provider === 'custom-openai') {
                        modelConfig.customBaseUrl = document.getElementById('customBaseUrl').value;
                        modelConfig.customModelName = document.getElementById('customModelName').value;
                    }
                    
                    const response = await axios.post('/api/generate', {
                        userPrompt: '请生成一个简单的HTML页面，包含标题"模型测试成功"和一段介绍文字',
                        pageConfig: {
                            title: '模型测试',
                            pageType: 'business',
                            themeColor: '#3B82F6'
                        },
                        modelConfig: modelConfig
                    });
                    
                    if (response.data.success) {
                        alert('模型测试成功！' + provider + ' - ' + modelName + ' 工作正常');
                        console.log('Generated HTML length:', response.data.html.length);
                    } else {
                        throw new Error(response.data.error || '测试失败');
                    }
                } catch (error) {
                    console.error('Model test failed:', error);
                    alert('模型测试失败: ' + (error.response?.data?.error || error.message));
                } finally {
                    testButton.innerHTML = originalText;
                    testButton.disabled = false;
                }
            }

            // Test image generation
            window.testImageGeneration = async function testImageGeneration() {
                const provider = document.getElementById('imageModelProvider').value;
                
                if (provider === 'pollinations') {
                    // Test with Pollinations (free)
                    const response = await axios.post('/api/generate', {
                        userPrompt: 'Test page for image generation',
                        pageConfig: {
                            title: '图片生成测试',
                            pageType: 'business',
                            themeColor: '#3B82F6'
                        },
                        modelConfig: {
                            textModelProvider: 'test',
                            imageModelProvider: 'pollinations',
                            imageModelName: 'pollinations-free'
                        }
                    });
                    
                    if (response.data.success) {
                        // Open the test page in new window
                        const testWindow = window.open('', '_blank');
                        testWindow.document.write(response.data.html);
                        testWindow.document.close();
                        alert('图片生成测试完成！请查看新打开的窗口中的图片。');
                    } else {
                        alert('测试失败: ' + response.data.error);
                    }
                } else {
                    alert('请先选择图片提供商并确保已输入API Key（如果需要）');
                }
            }

            // Event listeners
            document.getElementById('textModelProvider').addEventListener('change', updateTextModels);
            document.getElementById('imageModelProvider').addEventListener('change', updateImageModels);
            document.getElementById('contentDescription').addEventListener('input', updateCostEstimate);
            document.getElementById('pageType').addEventListener('change', updateCostEstimate);

            // Vertex AI Imagen 相关函数
            window.toggleVertexAIAdvanced = function toggleVertexAIAdvanced() {
                const checkbox = document.getElementById('showVertexAIAdvanced');
                const params = document.getElementById('vertexAIAdvancedParams');
                const icon = document.getElementById('vertexAIAdvancedIcon');
                
                if (checkbox.checked) {
                    params.classList.remove('hidden');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    params.classList.add('hidden');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            }

            // MIME类型变化时显示/隐藏JPEG质量设置
            document.addEventListener('change', function(e) {
                if (e.target.id === 'vertexMimeType') {
                    const jpegQualityDiv = document.getElementById('jpegQualityDiv');
                    if (e.target.value === 'image/jpeg') {
                        jpegQualityDiv.classList.remove('hidden');
                    } else {
                        jpegQualityDiv.classList.add('hidden');
                    }
                }
            });

            // 种子设置启用/禁用
            document.addEventListener('change', function(e) {
                if (e.target.id === 'vertexUseSeed') {
                    const seedInput = document.getElementById('vertexSeed');
                    const watermarkCheckbox = document.getElementById('vertexAddWatermark');
                    
                    if (e.target.checked) {
                        seedInput.disabled = false;
                        watermarkCheckbox.checked = false;
                        watermarkCheckbox.disabled = true;
                    } else {
                        seedInput.disabled = true;
                        seedInput.value = '';
                        watermarkCheckbox.disabled = false;
                        watermarkCheckbox.checked = true;
                    }
                }
            });

            // 保存Vertex AI配置到localStorage
            window.saveVertexAIConfig = function saveVertexAIConfig() {
                const config = {
                    projectId: document.getElementById('gcpProjectId').value,
                    location: document.getElementById('gcpLocation').value,
                    accessToken: document.getElementById('gcpAccessToken').value
                };
                localStorage.setItem('vertexAIConfig', JSON.stringify(config));
            }

            // 加载Vertex AI配置
            function loadVertexAIConfig() {
                const saved = localStorage.getItem('vertexAIConfig');
                if (saved) {
                    try {
                        const config = JSON.parse(saved);
                        if (config.projectId) document.getElementById('gcpProjectId').value = config.projectId;
                        if (config.location) document.getElementById('gcpLocation').value = config.location;
                        if (config.accessToken) document.getElementById('gcpAccessToken').value = config.accessToken;
                    } catch (e) {
                        console.warn('Failed to load Vertex AI config:', e);
                    }
                }
            }

            // 自动保存Vertex AI配置
            ['gcpProjectId', 'gcpLocation', 'gcpAccessToken'].forEach(id => {
                document.addEventListener('change', function(e) {
                    if (e.target.id === id) {
                        saveVertexAIConfig();
                    }
                });
            });

            // Initialize
            loadSavedKeys();
            loadVertexAIConfig();
            updateTextModels();
            updateImageModels();
            updateCostEstimate();
            
            // 🔧 添加模型选择变化监听器 - 当具体模型变化时重新初始化SDK
            document.getElementById('textModel')?.addEventListener('change', () => {
                initializeSDKService();
            });
            
            document.getElementById('imageModel')?.addEventListener('change', () => {
                initializeSDKService();
            });
            
            // 🔧 Vertex AI Modal 相关函数 - 移动到主脚本块中解决函数未定义错误
            window.showVertexAIConfigModal = function showVertexAIConfigModal() {
                console.log('Opening Vertex AI configuration modal...');
                
                // 🔧 使用setTimeout让DOM元素先渲染完成
                setTimeout(() => {
                    try {
                        // 检查模态框元素是否存在
                        const modal = document.getElementById('vertexAIModal');
                        if (modal) {
                            // 先加载配置，然后显示模态框
                            loadVertexAIModalConfig();
                            modal.classList.remove('hidden');
                            console.log('Vertex AI modal opened successfully');
                        } else {
                            console.error('Vertex AI modal element not found!');
                            // 重试查找模态框
                            console.log('Available elements with "modal" in ID:');
                            document.querySelectorAll('[id*="modal"]').forEach(el => {
                                console.log(' - Found element:', el.id);
                            });
                            alert('错误：无法找到Vertex AI配置弹窗。请刷新页面重试。');
                        }
                    } catch (error) {
                        console.error('Error opening Vertex AI modal:', error);
                        alert('错误：无法打开Vertex AI配置弹窗。请刷新页面重试。');
                    }
                }, 100); // 100ms延迟，让DOM元素先渲染
            }

            window.closeVertexAIModal = function closeVertexAIModal() {
                document.getElementById('vertexAIModal').classList.add('hidden');
            }

            window.loadVertexAIModalConfig = function loadVertexAIModalConfig() {
                const saved = localStorage.getItem('vertexAIConfig');
                if (saved) {
                    try {
                        const config = JSON.parse(saved);
                        // 🔧 添加DOM元素存在性检查，避免错误
                        const setValueSafely = (id, value) => {
                            const element = document.getElementById(id);
                            if (element && value !== undefined) {
                                if (element.type === 'checkbox') {
                                    element.checked = value;
                                } else {
                                    element.value = value;
                                }
                            }
                        };
                        
                        // 使用安全设置函数
                        setValueSafely('modalGcpProjectId', config.projectId);
                        setValueSafely('modalGcpLocation', config.location);
                        setValueSafely('modalGcpAccessToken', config.accessToken);
                        setValueSafely('modalImagenModel', config.model);
                        setValueSafely('modalAspectRatio', config.aspectRatio);
                        setValueSafely('modalSampleCount', config.sampleCount);
                        setValueSafely('modalMimeType', config.mimeType);
                        setValueSafely('modalCompressionQuality', config.compressionQuality);
                        setValueSafely('modalPersonGeneration', config.personGeneration);
                        setValueSafely('modalSafetySetting', config.safetySetting);
                        setValueSafely('modalAddWatermark', config.addWatermark);
                        setValueSafely('modalEnhancePrompt', config.enhancePrompt);
                        setValueSafely('modalIncludeRaiReason', config.includeRaiReason);
                        if (config.seed) {
                            setValueSafely('modalSeed', config.seed);
                            setValueSafely('modalUseSeed', true);
                            // 只在元素存在时调用函数
                            if (typeof toggleSeedInput === 'function') {
                                toggleSeedInput();
                            }
                        }
                        // 只在函数存在时调用
                        if (typeof toggleJpegQuality === 'function') {
                            toggleJpegQuality();
                        }
                    } catch (e) {
                        console.warn('Failed to load Vertex AI modal config:', e);
                    }
                }
            }

            window.saveVertexAIConfig = function saveVertexAIConfig() {
                const projectId = document.getElementById('modalGcpProjectId').value.trim();
                const accessToken = document.getElementById('modalGcpAccessToken').value.trim();

                if (!projectId) {
                    alert('请输入GCP Project ID');
                    return;
                }

                if (!accessToken) {
                    alert('请输入Access Token');
                    return;
                }

                const config = {
                    model: document.getElementById('modalImagenModel').value,
                    projectId: projectId,
                    location: document.getElementById('modalGcpLocation').value,
                    accessToken: accessToken,
                    aspectRatio: document.getElementById('modalAspectRatio').value,
                    sampleCount: parseInt(document.getElementById('modalSampleCount').value),
                    mimeType: document.getElementById('modalMimeType').value,
                    compressionQuality: document.getElementById('modalCompressionQuality').value ? parseInt(document.getElementById('modalCompressionQuality').value) : null,
                    personGeneration: document.getElementById('modalPersonGeneration').value,
                    safetySetting: document.getElementById('modalSafetySetting').value,
                    addWatermark: document.getElementById('modalAddWatermark').checked,
                    enhancePrompt: document.getElementById('modalEnhancePrompt').checked,
                    includeRaiReason: document.getElementById('modalIncludeRaiReason').checked,
                    seed: document.getElementById('modalUseSeed').checked ? parseInt(document.getElementById('modalSeed').value) : null
                };

                localStorage.setItem('vertexAIConfig', JSON.stringify(config));
                
                // 更新主页面的模型选择
                const imageModelSelect = document.getElementById('imageModel');
                imageModelSelect.innerHTML = '<option value="' + config.model + '">' + config.model + '</option>';
                
                closeVertexAIModal();
                alert('Vertex AI 配置已保存！');
            }

            function toggleJpegQuality() {
                const mimeType = document.getElementById('modalMimeType').value;
                const jpegDiv = document.getElementById('modalJpegQualityDiv');
                if (mimeType === 'image/jpeg') {
                    jpegDiv.classList.remove('hidden');
                } else {
                    jpegDiv.classList.add('hidden');
                }
            }

            function toggleSeedInput() {
                const useSeed = document.getElementById('modalUseSeed').checked;
                const seedInput = document.getElementById('modalSeed');
                const watermarkCheckbox = document.getElementById('modalAddWatermark');

                if (useSeed) {
                    seedInput.disabled = false;
                    watermarkCheckbox.checked = false;
                    watermarkCheckbox.disabled = true;
                } else {
                    seedInput.disabled = true;
                    seedInput.value = '';
                    watermarkCheckbox.disabled = false;
                    watermarkCheckbox.checked = true;
                }
            }

            window.toggleAdvancedSettings = function toggleAdvancedSettings() {
                const settings = document.getElementById('advancedSettings');
                const icon = document.getElementById('advancedIcon');
                
                if (settings.classList.contains('hidden')) {
                    settings.classList.remove('hidden');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    settings.classList.add('hidden');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            }

            window.testVertexAIConnection = async function testVertexAIConnection() {
                const projectId = document.getElementById('modalGcpProjectId').value.trim();
                const accessToken = document.getElementById('modalGcpAccessToken').value.trim();

                if (!projectId || !accessToken) {
                    alert('请先输入Project ID和Access Token');
                    return;
                }

                try {
                    const testData = {
                        model: document.getElementById('modalImagenModel').value,
                        prompt: "A simple test image for connection verification",
                        projectId: projectId,
                        location: document.getElementById('modalGcpLocation').value,
                        accessToken: accessToken,
                        sampleCount: 1,
                        aspectRatio: '1:1'
                    };

                    const response = await fetch('/api/image-generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(testData)
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert('✅ 连接测试成功！Vertex AI配置正确。');
                    } else {
                        alert('❌ 连接测试失败：' + result.error);
                    }
                } catch (error) {
                    alert('❌ 连接测试出错：' + error.message);
                }
            }

            // 关闭弹窗的快捷键 (ESC) - 与页面事件监听器一起注册
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeVertexAIModal();
                }
            });

            // 点击背景关闭弹窗 - 与页面事件监听器一起注册
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'vertexAIModal') {
                    closeVertexAIModal();
                }
            });

            // ================================
            // ChatGPT图像生成配置相关函数 (独立模块)
            // ================================
            
            window.showChatGPTConfigModal = function showChatGPTConfigModal() {
                console.log('Opening ChatGPT configuration modal...');
                
                setTimeout(() => {
                    try {
                        const modal = document.getElementById('chatGPTModal');
                        if (modal) {
                            loadChatGPTModalConfig();
                            updateChatGPTParameters(); // 初始化参数选项
                            modal.classList.remove('hidden');
                            console.log('ChatGPT modal opened successfully');
                        } else {
                            console.error('ChatGPT modal element not found!');
                            alert('错误：无法找到ChatGPT配置弹窗。请刷新页面重试。');
                        }
                    } catch (error) {
                        console.error('Error opening ChatGPT modal:', error);
                        alert('错误：无法打开ChatGPT配置弹窗。请刷新页面重试。');
                    }
                }, 100);
            }

            window.closeChatGPTModal = function closeChatGPTModal() {
                const modal = document.getElementById('chatGPTModal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }

            window.loadChatGPTModalConfig = function loadChatGPTModalConfig() {
                const saved = localStorage.getItem('chatGPTConfig');
                if (saved) {
                    try {
                        const config = JSON.parse(saved);
                        
                        const setValueSafely = (id, value) => {
                            const element = document.getElementById(id);
                            if (element && value !== undefined) {
                                if (element.type === 'radio') {
                                    if (element.value === value) {
                                        element.checked = true;
                                    }
                                } else if (element.type === 'range') {
                                    element.value = value;
                                    // 更新显示值
                                    if (id === 'chatgptCompression') {
                                        updateCompressionValue();
                                    }
                                } else {
                                    element.value = value;
                                }
                            }
                        };

                        setValueSafely('chatgptApiKey', config.apiKey);
                        setValueSafely('chatgptModel', config.model);
                        setValueSafely('chatgptPrompt', config.prompt);
                        setValueSafely('chatgptSize', config.size);
                        setValueSafely('chatgptQuality', config.quality);
                        setValueSafely('chatgptFormat', config.format);
                        setValueSafely('chatgptN', config.n);
                        setValueSafely('chatgptCompression', config.compression);

                        // 处理radio按钮
                        if (config.background) {
                            const radios = document.querySelectorAll('input[name="chatgptBackground"]');
                            radios.forEach(radio => {
                                radio.checked = radio.value === config.background;
                            });
                        }

                    } catch (error) {
                        console.error('Error loading ChatGPT config:', error);
                    }
                }
            }

            window.saveChatGPTConfig = function saveChatGPTConfig() {
                const apiKey = document.getElementById('chatgptApiKey').value;
                if (!apiKey.trim()) {
                    alert('请输入OpenAI API Key');
                    return;
                }

                const config = {
                    apiKey: apiKey,
                    model: document.getElementById('chatgptModel').value,
                    prompt: document.getElementById('chatgptPrompt').value,
                    size: document.getElementById('chatgptSize').value,
                    quality: document.getElementById('chatgptQuality').value,
                    format: document.getElementById('chatgptFormat').value,
                    n: document.getElementById('chatgptN').value,
                    compression: document.getElementById('chatgptCompression').value,
                    background: document.querySelector('input[name="chatgptBackground"]:checked')?.value || 'opaque'
                };

                localStorage.setItem('chatGPTConfig', JSON.stringify(config));
                closeChatGPTModal();
                alert('ChatGPT 配置已保存！');
            }

            function updateChatGPTParameters() {
                const model = document.getElementById('chatgptModel').value;
                const sizeSelect = document.getElementById('chatgptSize');
                const qualitySelect = document.getElementById('chatgptQuality');
                const formatSelect = document.getElementById('chatgptFormat');
                const qualityContainer = document.getElementById('chatgptQualityContainer');
                const nContainer = document.getElementById('chatgptNContainer');
                const backgroundContainer = document.getElementById('chatgptBackgroundContainer');

                // 清空现有选项
                sizeSelect.innerHTML = '';
                qualitySelect.innerHTML = '';
                formatSelect.innerHTML = '';

                if (model === 'gpt-image-1') {
                    // gpt-image-1 参数
                    sizeSelect.innerHTML = 
                        '<option value="auto">auto (默认)</option>' +
                        '<option value="1024x1024">1024x1024</option>' +
                        '<option value="1536x1024">1536x1024</option>' +
                        '<option value="1024x1536">1024x1536</option>';
                    qualitySelect.innerHTML = 
                        '<option value="auto">auto (默认)</option>' +
                        '<option value="low">low</option>' +
                        '<option value="medium">medium</option>' +
                        '<option value="high">high</option>';
                    formatSelect.innerHTML = 
                        '<option value="png">png (默认)</option>' +
                        '<option value="jpeg">jpeg</option>' +
                        '<option value="webp">webp</option>';
                    qualityContainer.classList.remove('hidden');
                    nContainer.classList.remove('hidden');
                    backgroundContainer.classList.remove('hidden');
                    
                } else if (model === 'dall-e-2') {
                    // dall-e-2 参数
                    sizeSelect.innerHTML = 
                        '<option value="1024x1024">1024x1024 (默认)</option>' +
                        '<option value="512x512">512x512</option>' +
                        '<option value="256x256">256x256</option>';
                    qualitySelect.innerHTML = '<option value="standard">standard (默认)</option>';
                    formatSelect.innerHTML = 
                        '<option value="url">url (默认)</option>' +
                        '<option value="b64_json">b64_json</option>';
                    qualityContainer.classList.add('hidden'); // dall-e-2 质量固定
                    nContainer.classList.remove('hidden');
                    backgroundContainer.classList.add('hidden');
                    
                } else if (model === 'dall-e-3') {
                    // dall-e-3 参数
                    sizeSelect.innerHTML = 
                        '<option value="1024x1024">1024x1024 (默认)</option>' +
                        '<option value="1024x1792">1024x1792</option>' +
                        '<option value="1792x1024">1792x1024</option>';
                    qualitySelect.innerHTML = 
                        '<option value="standard">standard (默认)</option>' +
                        '<option value="hd">hd</option>';
                    formatSelect.innerHTML = 
                        '<option value="url">url (默认)</option>' +
                        '<option value="b64_json">b64_json</option>';
                    qualityContainer.classList.remove('hidden');
                    nContainer.classList.add('hidden'); // dall-e-3 固定1张
                    backgroundContainer.classList.add('hidden');
                }

                // 触发格式相关选项更新
                updateFormatDependentOptions();
            }

            function updateFormatDependentOptions() {
                const model = document.getElementById('chatgptModel').value;
                const format = document.getElementById('chatgptFormat').value;
                const compressionContainer = document.getElementById('chatgptCompressionContainer');

                // 只有gpt-image-1的jpeg/webp格式才显示压缩选项
                if (model === 'gpt-image-1' && (format === 'jpeg' || format === 'webp')) {
                    compressionContainer.classList.remove('hidden');
                } else {
                    compressionContainer.classList.add('hidden');
                }

                // 更新透明背景选项的可用性提示
                const backgroundContainer = document.getElementById('chatgptBackgroundContainer');
                const backgroundHelp = backgroundContainer?.querySelector('p');
                if (backgroundHelp && model === 'gpt-image-1') {
                    if (format === 'png' || format === 'webp') {
                        backgroundHelp.textContent = '透明背景仅在png/webp格式且medium/high质量时效果最佳';
                        backgroundHelp.className = 'text-xs text-gray-500 mt-1';
                    } else {
                        backgroundHelp.textContent = 'JPEG格式不支持透明背景，将自动使用不透明背景';
                        backgroundHelp.className = 'text-xs text-orange-500 mt-1';
                    }
                }
            }

            function updateCompressionValue() {
                const slider = document.getElementById('chatgptCompression');
                const display = document.getElementById('compressionValue');
                if (slider && display) {
                    display.textContent = slider.value;
                }
            }

            // ChatGPT模态框的快捷键和事件监听器
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const modal = document.getElementById('chatGPTModal');
                    if (modal && !modal.classList.contains('hidden')) {
                        closeChatGPTModal();
                    }
                }
            });

            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'chatGPTModal') {
                    closeChatGPTModal();
                }
            });
            
            // 🍌 Nano Banana 相关函数
            window.openNanoBananaModal = function() {
                const modal = document.getElementById('nanoBananaModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    // 加载现有配置
                    loadNanoBananaConfig();
                }
            };

            window.closeNanoBananaModal = function() {
                const modal = document.getElementById('nanoBananaModal');
                if (modal) {
                    modal.classList.add('hidden');
                    // 清除错误信息
                    const errorDiv = document.getElementById('nanoBananaError');
                    if (errorDiv) {
                        errorDiv.classList.add('hidden');
                        errorDiv.textContent = '';
                    }
                }
            };

            window.selectNanoBananaStyle = function(type, value) {
                const className = type === 'base' ? 'nano-banana-base-style' : 'nano-banana-enhancement-style';
                const buttons = document.getElementsByClassName(className);
                
                // 移除所有按钮的选中状态
                Array.from(buttons).forEach(btn => {
                    btn.classList.remove('active', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
                    btn.classList.add('border-gray-300');
                });
                
                // 为当前按钮添加选中状态
                event.target.classList.add('active', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
                event.target.classList.remove('border-gray-300');
                
                // 保存选择到临时状态
                if (type === 'base') {
                    window.nanoBananaConfigTemp = window.nanoBananaConfigTemp || {};
                    window.nanoBananaConfigTemp.basePromptStyle = value;
                } else {
                    window.nanoBananaConfigTemp = window.nanoBananaConfigTemp || {};
                    window.nanoBananaConfigTemp.styleEnhancement = value;
                }
            };

            window.saveNanoBananaConfig = function() {
                const apiKey = document.getElementById('nanoBananaApiKey').value;
                if (!apiKey.trim()) {
                    showNanoBananaError('请输入 Gemini API Key');
                    return;
                }

                const config = {
                    apiKey: apiKey.trim(),
                    basePromptStyle: (window.nanoBananaConfigTemp && window.nanoBananaConfigTemp.basePromptStyle) || '',
                    styleEnhancement: (window.nanoBananaConfigTemp && window.nanoBananaConfigTemp.styleEnhancement) || ''
                };

                // 保存到 localStorage
                localStorage.setItem('nanoBananaConfig', JSON.stringify(config));
                
                closeNanoBananaModal();
                alert('Nano Banana 配置已保存！');
                
                // 清除临时状态
                window.nanoBananaConfigTemp = {};
            };

            window.loadNanoBananaConfig = function() {
                try {
                    const config = localStorage.getItem('nanoBananaConfig');
                    if (config) {
                        const parsedConfig = JSON.parse(config);
                        
                        // 加载 API Key
                        const apiKeyInput = document.getElementById('nanoBananaApiKey');
                        if (apiKeyInput) {
                            apiKeyInput.value = parsedConfig.apiKey || '';
                        }
                        
                        // 设置临时配置状态
                        window.nanoBananaConfigTemp = {
                            basePromptStyle: parsedConfig.basePromptStyle || '',
                            styleEnhancement: parsedConfig.styleEnhancement || ''
                        };
                        
                        // 恢复基础风格选择
                        setTimeout(() => {
                            const baseButtons = document.getElementsByClassName('nano-banana-base-style');
                            Array.from(baseButtons).forEach(btn => {
                                btn.classList.remove('active', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
                                btn.classList.add('border-gray-300');
                                
                                if (btn.getAttribute('onclick').includes("'" + parsedConfig.basePromptStyle + "'")) {
                                    btn.classList.add('active', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
                                    btn.classList.remove('border-gray-300');
                                }
                            });
                            
                            // 恢复主题风格选择
                            const enhancementButtons = document.getElementsByClassName('nano-banana-enhancement-style');
                            Array.from(enhancementButtons).forEach(btn => {
                                btn.classList.remove('active', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
                                btn.classList.add('border-gray-300');
                                
                                if (btn.getAttribute('onclick').includes("'" + parsedConfig.styleEnhancement + "'")) {
                                    btn.classList.add('active', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
                                    btn.classList.remove('border-gray-300');
                                }
                            });
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error loading Nano Banana config:', error);
                }
            };

            window.testNanoBananaConnection = function() {
                const apiKey = document.getElementById('nanoBananaApiKey').value;
                const testButton = event.target;
                const testResult = document.getElementById('nanoBananaTestResult');
                
                if (!apiKey.trim()) {
                    showNanoBananaError('请先输入 API Key');
                    return;
                }
                
                // 显示测试中状态
                testButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>测试中...';
                testButton.disabled = true;
                testResult.classList.remove('hidden');
                testResult.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2 text-blue-500"></i>正在测试连接...';
                testResult.className = 'mt-3 text-sm text-blue-600';
                
                // 🔧 修复：使用后端代理进行测试，避免CORS问题
                console.log('🍌 [CORS Fix] Testing Nano Banana connection via backend proxy');
                fetch('/api/test/nano-banana', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        apiKey: apiKey.trim()
                    })
                })
                .then(response => {
                    if (response.ok) {
                        testResult.innerHTML = '<i class="fas fa-check-circle mr-2 text-green-500"></i>连接成功！API Key 有效';
                        testResult.className = 'mt-3 text-sm text-green-600';
                    } else {
                        throw new Error('API 响应错误: ' + response.status);
                    }
                })
                .catch(error => {
                    let errorMessage = 'API Key 无效或网络连接失败';
                    if (error.message.includes('401')) {
                        errorMessage = 'API Key 无效，请检查密钥';
                    } else if (error.message.includes('403')) {
                        errorMessage = 'API Key 权限不足';
                    } else if (error.message.includes('429')) {
                        errorMessage = 'API 调用次数超限';
                    }
                    
                    testResult.innerHTML = '<i class="fas fa-exclamation-triangle mr-2 text-red-500"></i>' + errorMessage;
                    testResult.className = 'mt-3 text-sm text-red-600';
                })
                .finally(() => {
                    // 恢复按钮状态
                    testButton.innerHTML = '<i class="fas fa-play mr-2"></i>测试连接';
                    testButton.disabled = false;
                });
            };

            window.showNanoBananaError = function showNanoBananaError(message) {
                const errorDiv = document.getElementById('nanoBananaError');
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.classList.remove('hidden');
                }
            }

            // Nano Banana Modal 点击外部关闭
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'nanoBananaModal') {
                    closeNanoBananaModal();
                }
            });

            // 🔧 新增: 自定义图像OpenAI协议 相关函数
            window.openCustomImageOpenAIModal = function() {
                const modal = document.getElementById('customImageOpenAIModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    // 加载现有配置
                    loadCustomImageOpenAIConfig();
                }
            };

            window.closeCustomImageOpenAIModal = function() {
                const modal = document.getElementById('customImageOpenAIModal');
                if (modal) {
                    modal.classList.add('hidden');
                    // 清除错误信息
                    const errorDiv = document.getElementById('customImageOpenAIError');
                    if (errorDiv) {
                        errorDiv.classList.add('hidden');
                        errorDiv.textContent = '';
                    }
                }
            };

            window.saveCustomImageOpenAIConfig = function() {
                const apiKey = document.getElementById('customImageOpenAIApiKey').value;
                const baseUrl = document.getElementById('customImageOpenAIBaseUrl').value;
                const model = document.getElementById('customImageOpenAIModel').value;
                const outputFormat = document.getElementById('customImageOpenAIOutputFormat').value;

                if (!apiKey.trim()) {
                    showCustomImageOpenAIError('请输入API Key');
                    return;
                }

                if (!baseUrl.trim()) {
                    showCustomImageOpenAIError('请输入Base URL');
                    return;
                }

                if (!model.trim()) {
                    showCustomImageOpenAIError('请输入模型名称');
                    return;
                }

                try {
                    // 验证URL格式
                    new URL(baseUrl);
                } catch (e) {
                    showCustomImageOpenAIError('Base URL 格式不正确');
                    return;
                }

                // 保存配置
                const config = {
                    apiKey: apiKey.trim(),
                    baseUrl: baseUrl.trim(),
                    model: model.trim(),
                    outputFormat: outputFormat || 'url',
                    provider: 'openai-compatible'
                };

                localStorage.setItem('customImageOpenAIConfig', JSON.stringify(config));
                
                // 更新主界面的API Key字段
                document.getElementById('imageApiKey').value = apiKey.trim();
                
                alert('自定义图像OpenAI配置已保存！');
                closeCustomImageOpenAIModal();
            };

            function loadCustomImageOpenAIConfig() {
                try {
                    const savedConfig = localStorage.getItem('customImageOpenAIConfig');
                    if (savedConfig) {
                        const config = JSON.parse(savedConfig);
                        document.getElementById('customImageOpenAIApiKey').value = config.apiKey || '';
                        document.getElementById('customImageOpenAIBaseUrl').value = config.baseUrl || '';
                        document.getElementById('customImageOpenAIModel').value = config.model || '';
                        document.getElementById('customImageOpenAIOutputFormat').value = config.outputFormat || 'url';
                    }
                } catch (error) {
                    console.error('Error loading custom image OpenAI config:', error);
                }
            }

            window.showCustomImageOpenAIError = function(message) {
                const errorDiv = document.getElementById('customImageOpenAIError');
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.classList.remove('hidden');
                }
            }

            window.testCustomImageOpenAIConnection = function() {
                const testButton = event.target;
                const testResult = document.getElementById('customImageOpenAITestResult');
                
                const apiKey = document.getElementById('customImageOpenAIApiKey').value;
                const baseUrl = document.getElementById('customImageOpenAIBaseUrl').value;
                
                if (!apiKey.trim()) {
                    showCustomImageOpenAIError('请先输入API Key');
                    return;
                }
                
                if (!baseUrl.trim()) {
                    showCustomImageOpenAIError('请先输入Base URL');
                    return;
                }
                
                // 显示测试状态
                const originalText = testButton.innerHTML;
                testButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>测试中...';
                testButton.disabled = true;
                testResult.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2 text-blue-500"></i>正在测试连接...';
                testResult.className = 'mt-3 text-sm text-blue-600';
                
                // 测试连接
                fetch('/api/models/openai-compatible', {
                    method: 'GET',
                    headers: {
                        'X-API-Key': apiKey.trim(),
                        'X-Custom-Base-URL': baseUrl.trim(),
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.models && data.models.length > 0) {
                        testResult.innerHTML = '<i class="fas fa-check-circle mr-2 text-green-500"></i>连接成功！获取到 ' + data.models.length + ' 个模型';
                        testResult.className = 'mt-3 text-sm text-green-600';
                    } else {
                        testResult.innerHTML = '<i class="fas fa-exclamation-triangle mr-2 text-red-500"></i>连接失败：' + (data.error || '未知错误');
                        testResult.className = 'mt-3 text-sm text-red-600';
                    }
                })
                .catch(error => {
                    let errorMessage = '连接失败：' + error.message;
                    if (error.message.includes('401')) {
                        errorMessage = 'API Key 无效';
                    } else if (error.message.includes('403')) {
                        errorMessage = 'API Key 权限不足';
                    } else if (error.message.includes('429')) {
                        errorMessage = 'API 调用次数超限';
                    }
                    
                    testResult.innerHTML = '<i class="fas fa-exclamation-triangle mr-2 text-red-500"></i>' + errorMessage;
                    testResult.className = 'mt-3 text-sm text-red-600';
                })
                .finally(() => {
                    testButton.innerHTML = originalText;
                    testButton.disabled = false;
                });
            };

            // 🔧 新增: 免费服务 (Unsplash & Pollinations) 相关函数
            window.openFreeServiceModal = function(service) {
                const modal = document.getElementById('freeServiceModal');
                const title = document.getElementById('freeServiceTitle');
                const description = document.getElementById('freeServiceDescription');
                
                if (modal && title && description) {
                    // 设置服务特定信息
                    if (service === 'unsplash') {
                        title.textContent = 'Unsplash 配置';
                        description.innerHTML = '<div class="mb-4">' +
                            '<h4 class="font-medium text-gray-800 mb-2">服务说明:</h4>' +
                            '<ul class="text-sm text-gray-600 space-y-1">' +
                                '<li>• <strong>无API Key</strong>: 免费使用，但有请求限制</li>' +
                                '<li>• <strong>有API Key</strong>: 更高的请求限制和优先级</li>' +
                                '<li>• 获取API Key: <a href="https://unsplash.com/developers" target="_blank" class="text-blue-600 underline">unsplash.com/developers</a></li>' +
                            '</ul>' +
                        '</div>';
                    } else if (service === 'pollinations') {
                        title.textContent = 'Pollinations 配置';
                        description.innerHTML = '<div class="mb-4">' +
                            '<h4 class="font-medium text-gray-800 mb-2">服务说明:</h4>' +
                            '<ul class="text-sm text-gray-600 space-y-1">' +
                                '<li>• <strong>无API Key</strong>: 完全免费，但可能有速度限制</li>' +
                                '<li>• <strong>有API Key</strong>: 更快的生成速度和优先处理</li>' +
                                '<li>• Pollinations 是开源免费的AI图像生成服务</li>' +
                            '</ul>' +
                        '</div>';
                    }
                    
                    modal.classList.remove('hidden');
                    modal.dataset.service = service; // 保存当前服务
                    loadFreeServiceConfig(service);
                }
            };

            window.closeFreeServiceModal = function() {
                const modal = document.getElementById('freeServiceModal');
                if (modal) {
                    modal.classList.add('hidden');
                    delete modal.dataset.service;
                }
            };

            window.saveFreeServiceConfig = function() {
                const modal = document.getElementById('freeServiceModal');
                const service = modal?.dataset?.service;
                const apiKey = document.getElementById('freeServiceApiKey').value;
                
                if (!service) {
                    alert('服务配置错误');
                    return;
                }

                // 保存配置（API Key可以为空）
                const config = {
                    apiKey: apiKey.trim() || null,
                    provider: service
                };

                localStorage.setItem(service + 'Config', JSON.stringify(config));
                
                // 更新主界面的API Key字段
                document.getElementById('imageApiKey').value = apiKey.trim();
                
                const hasKey = apiKey.trim() ? '（已配置API Key）' : '（无API Key，使用免费限制）';
                alert(service.charAt(0).toUpperCase() + service.slice(1) + ' 配置已保存！' + hasKey);
                closeFreeServiceModal();
            };

            function loadFreeServiceConfig(service) {
                try {
                    const savedConfig = localStorage.getItem(service + 'Config');
                    if (savedConfig) {
                        const config = JSON.parse(savedConfig);
                        document.getElementById('freeServiceApiKey').value = config.apiKey || '';
                    } else {
                        document.getElementById('freeServiceApiKey').value = '';
                    }
                } catch (error) {
                    console.error('Error loading ' + service + ' config:', error);
                    document.getElementById('freeServiceApiKey').value = '';
                }
            }

            // Modal 点击外部关闭
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'customImageOpenAIModal') {
                    closeCustomImageOpenAIModal();
                }
                if (e.target && e.target.id === 'freeServiceModal') {
                    closeFreeServiceModal();
                }
            });
            
            // 定期更新SDK状态
            setInterval(updateSDKStatus, 30000); // 每30秒检查一次

            // ================================
            // Cloudflare Workers AI 图像生成配置相关函数
            // ================================
            
            window.openCloudflareWorkersAIModal = function openCloudflareWorkersAIModal() {
                const modal = document.getElementById('cloudflareWorkersAIModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    // 加载现有配置
                    loadCloudflareWorkersAIConfig();
                }
            };

            function closeCloudflareWorkersAIModal() {
                const modal = document.getElementById('cloudflareWorkersAIModal');
                if (modal) {
                    modal.classList.add('hidden');
                    // 清除错误信息
                    const errorDiv = document.getElementById('cloudflareWorkersAIError');
                    if (errorDiv) {
                        errorDiv.classList.add('hidden');
                    }
                }
            };

            function saveCloudflareWorkersAIConfig() {
                console.log('[Cloudflare Workers AI] 开始保存配置...');
                
                const apiKeyInput = document.getElementById('cloudflareWorkersAIApiKey');
                const accountIdInput = document.getElementById('cloudflareWorkersAIAccountId');
                const modelSelect = document.getElementById('cloudflareWorkersAIModel');
                const stepsInput = document.getElementById('cloudflareWorkersAISteps');
                const guidanceInput = document.getElementById('cloudflareWorkersAIGuidance');
                const widthSelect = document.getElementById('cloudflareWorkersAIWidth');
                const heightSelect = document.getElementById('cloudflareWorkersAIHeight');
                const negativePromptInput = document.getElementById('cloudflareWorkersAINegativePrompt');
                const seedInput = document.getElementById('cloudflareWorkersAISeed');
                
                console.log('[Cloudflare Workers AI] DOM元素检查:', {
                    apiKeyInput: !!apiKeyInput,
                    accountIdInput: !!accountIdInput,
                    modelSelect: !!modelSelect,
                    stepsInput: !!stepsInput,
                    guidanceInput: !!guidanceInput,
                    widthSelect: !!widthSelect,
                    heightSelect: !!heightSelect,
                    negativePromptInput: !!negativePromptInput,
                    seedInput: !!seedInput
                });
                
                if (!apiKeyInput || !accountIdInput || !modelSelect || !stepsInput || 
                    !guidanceInput || !widthSelect || !heightSelect || !negativePromptInput || !seedInput) {
                    console.error('[Cloudflare Workers AI] 配置表单DOM元素未找到');
                    showCloudflareWorkersAIError('配置表单未正确加载，请刷新页面重试');
                    return;
                }
                
                const apiKey = apiKeyInput.value;
                const accountId = accountIdInput.value;
                const selectedModel = modelSelect.value;
                const steps = stepsInput.value;
                const guidance = guidanceInput.value;
                const width = widthSelect.value;
                const height = heightSelect.value;
                const negativePrompt = negativePromptInput.value;
                const seed = seedInput.value;
                
                console.log('[Cloudflare Workers AI] 配置数据:', {
                    hasApiKey: !!apiKey.trim(),
                    hasAccountId: !!accountId.trim(),
                    model: selectedModel,
                    steps: steps,
                    guidance: guidance,
                    width: width,
                    height: height,
                    hasNegativePrompt: !!negativePrompt.trim(),
                    hasSeed: !!seed.trim()
                });
                
                if (!apiKey.trim()) {
                    console.warn('[Cloudflare Workers AI] API Key为空');
                    showCloudflareWorkersAIError('请输入 API Key');
                    return;
                }

                if (!accountId.trim()) {
                    console.warn('[Cloudflare Workers AI] Account ID为空');
                    showCloudflareWorkersAIError('请输入 Account ID');
                    return;
                }

                const config = {
                    apiKey: apiKey.trim(),
                    accountId: accountId.trim(),
                    model: selectedModel || '@cf/bytedance/stable-diffusion-xl-lightning',
                    steps: parseInt(steps) || 20,
                    guidance: parseFloat(guidance) || 7.5,
                    width: parseInt(width) || 1024,
                    height: parseInt(height) || 1024,
                    negativePrompt: negativePrompt.trim() || '',
                    seed: seed.trim() ? parseInt(seed) : null
                };
                
                console.log('[Cloudflare Workers AI] 保存配置:', config);
                
                try {
                    localStorage.setItem('cloudflareWorkersAIConfig', JSON.stringify(config));
                    console.log('[Cloudflare Workers AI] 配置保存成功');
                    
                    // 显示成功信息
                    const testResult = document.getElementById('cloudflareWorkersAITestResult');
                    if (testResult) {
                        testResult.className = 'mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded';
                        testResult.textContent = '✅ Cloudflare Workers AI 配置已保存成功！';
                        testResult.classList.remove('hidden');
                    }
                    
                    // 清除错误信息
                    const errorDiv = document.getElementById('cloudflareWorkersAIError');
                    if (errorDiv) {
                        errorDiv.classList.add('hidden');
                    }
                    
                    // 延迟关闭模态框，让用户看到成功信息
                    setTimeout(() => {
                        closeCloudflareWorkersAIModal();
                    }, 1500);
                    
                } catch (error) {
                    console.error('[Cloudflare Workers AI] 配置保存失败:', error);
                    showCloudflareWorkersAIError('配置保存失败: ' + error.message);
                }
            };

            function loadCloudflareWorkersAIConfig() {
                try {
                    const configStr = localStorage.getItem('cloudflareWorkersAIConfig');
                    if (configStr) {
                        const config = JSON.parse(configStr);
                        
                        // 恢复配置值
                        const apiKeyInput = document.getElementById('cloudflareWorkersAIApiKey');
                        const accountIdInput = document.getElementById('cloudflareWorkersAIAccountId');
                        const modelSelect = document.getElementById('cloudflareWorkersAIModel');
                        const stepsInput = document.getElementById('cloudflareWorkersAISteps');
                        const guidanceInput = document.getElementById('cloudflareWorkersAIGuidance');
                        const widthSelect = document.getElementById('cloudflareWorkersAIWidth');
                        const heightSelect = document.getElementById('cloudflareWorkersAIHeight');
                        const negativePromptInput = document.getElementById('cloudflareWorkersAINegativePrompt');
                        const seedInput = document.getElementById('cloudflareWorkersAISeed');
                        
                        if (apiKeyInput) apiKeyInput.value = config.apiKey || '';
                        if (accountIdInput) accountIdInput.value = config.accountId || '';
                        if (modelSelect) modelSelect.value = config.model || '@cf/bytedance/stable-diffusion-xl-lightning';
                        if (stepsInput) stepsInput.value = config.steps || 20;
                        if (guidanceInput) guidanceInput.value = config.guidance || 7.5;
                        if (widthSelect) widthSelect.value = config.width || 1024;
                        if (heightSelect) heightSelect.value = config.height || 1024;
                        if (negativePromptInput) negativePromptInput.value = config.negativePrompt || '';
                        if (seedInput) seedInput.value = config.seed || '';
                    }
                } catch (error) {
                    console.error('Error loading Cloudflare Workers AI config:', error);
                }
            };

            function testCloudflareWorkersAIConnection() {
                console.log('[Cloudflare Workers AI] 开始测试连接...');
                
                const apiKeyInput = document.getElementById('cloudflareWorkersAIApiKey');
                const accountIdInput = document.getElementById('cloudflareWorkersAIAccountId');
                const testResult = document.getElementById('cloudflareWorkersAITestResult');
                
                console.log('[Cloudflare Workers AI] DOM元素检查:', {
                    apiKeyInput: !!apiKeyInput,
                    accountIdInput: !!accountIdInput,
                    testResult: !!testResult
                });
                
                if (!apiKeyInput || !accountIdInput || !testResult) {
                    console.error('[Cloudflare Workers AI] DOM元素未找到');
                    showCloudflareWorkersAIError('配置表单未正确加载，请刷新页面重试');
                    return;
                }
                
                const apiKey = apiKeyInput.value;
                const accountId = accountIdInput.value;
                
                console.log('[Cloudflare Workers AI] 输入验证:', {
                    hasApiKey: !!apiKey.trim(),
                    hasAccountId: !!accountId.trim()
                });
                
                if (!apiKey.trim() || !accountId.trim()) {
                    console.warn('[Cloudflare Workers AI] 缺少必要参数');
                    showCloudflareWorkersAIError('请先输入 API Key 和 Account ID');
                    return;
                }

                // 清除之前的错误信息
                const errorDiv = document.getElementById('cloudflareWorkersAIError');
                if (errorDiv) {
                    errorDiv.classList.add('hidden');
                }

                // 查找测试按钮
                const testButton = document.getElementById('cfTestBtn');
                console.log('[Cloudflare Workers AI] 测试按钮:', !!testButton);
                
                if (testButton) {
                    testButton.disabled = true;
                    testButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>测试中...';
                }
                
                // 显示测试开始信息
                testResult.className = 'mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded';
                testResult.textContent = '🔄 正在测试 Cloudflare Workers AI 连接...';
                testResult.classList.remove('hidden');
                
                // 通过后端代理进行测试请求（避免CORS问题）
                const testPrompt = 'A simple test image';
                const testUrl = '/api/test/cloudflare-workers-ai';
                
                console.log('[Cloudflare Workers AI] 通过后端代理发送测试请求');
                
                fetch(testUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        apiKey: apiKey.trim(),
                        accountId: accountId.trim(),
                        model: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
                        prompt: testPrompt,
                        num_steps: 20
                    })
                })
                .then(async response => {
                    console.log('[Cloudflare Workers AI] 响应状态:', response.status);
                    
                    const data = await response.json();
                    console.log('[Cloudflare Workers AI] 响应数据:', data);
                    
                    if (response.ok && data.success) {
                        console.log('[Cloudflare Workers AI] 测试成功:', data);
                        
                        testResult.className = 'mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded';
                        testResult.textContent = '✅ 连接成功！Cloudflare Workers AI 配置正确。';
                        testResult.classList.remove('hidden');
                    } else {
                        console.error('[Cloudflare Workers AI] 测试失败:', data);
                        throw new Error(data.error || 'Unknown error');
                    }
                })
                .catch(error => {
                    console.error('[Cloudflare Workers AI] 连接错误:', error);
                    
                    testResult.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded';
                    testResult.textContent = '❌ 连接失败: ' + error.message;
                    testResult.classList.remove('hidden');
                })
                .finally(() => {
                    console.log('[Cloudflare Workers AI] 测试完成');
                    
                    if (testButton) {
                        testButton.disabled = false;
                        testButton.innerHTML = '<i class="fas fa-plug mr-2"></i>测试连接';
                    }
                });
            };

            function showCloudflareWorkersAIError(message) {
                const errorDiv = document.getElementById('cloudflareWorkersAIError');
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.classList.remove('hidden');
                }
            };

            // Cloudflare Workers AI Modal 点击外部关闭
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'cloudflareWorkersAIModal') {
                    closeCloudflareWorkersAIModal();
                }
            });
            
            // 添加简单的测试功能（调试用）
            window.testCloudflareAIButtons = function() {
                console.log('=== Cloudflare Workers AI 按钮测试 ===');
                
                const testBtn = document.getElementById('cfTestBtn');
                const saveBtn = document.getElementById('cfSaveBtn');
                const modal = document.getElementById('cloudflareWorkersAIModal');
                
                console.log('按钮状态:', {
                    testBtn: !!testBtn,
                    saveBtn: !!saveBtn,
                    modal: !!modal,
                    modalVisible: modal ? !modal.classList.contains('hidden') : false
                });
                
                if (testBtn) {
                    console.log('测试连接按钮存在，尝试点击...');
                    testBtn.click();
                } else {
                    console.error('测试连接按钮不存在');
                }
            };

            // ===============================================
            // ByteDance Jimeng 4.0 图像生成配置相关函数
            // ===============================================
            
            window.openByteDanceJimengModal = function openByteDanceJimengModal() {
                const modal = document.getElementById('byteDanceJimengModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    // 加载现有配置
                    loadByteDanceConfig();
                }
            };

            function closeByteDanceJimengModal() {
                const modal = document.getElementById('byteDanceJimengModal');
                if (modal) {
                    modal.classList.add('hidden');
                    // 清除错误信息
                    const errorDiv = document.getElementById('byteDanceJimengError');
                    if (errorDiv) {
                        errorDiv.classList.add('hidden');
                    }
                }
            };

            window.saveByteDanceConfig = function saveByteDanceConfig() {
                console.log('[ByteDance Jimeng] 开始保存配置...');
                
                const apiKeyInput = document.getElementById('byteDanceArkApiKey');
                const modelSelect = document.getElementById('byteDanceModel');
                const sizeSelect = document.getElementById('byteDanceSize');
                const sequentialModeSelect = document.getElementById('byteDanceSequentialMode');
                const maxImagesInput = document.getElementById('byteDanceMaxImages');
                const guidanceScaleInput = document.getElementById('byteDanceGuidanceScale');
                const seedInput = document.getElementById('byteDanceSeed');
                const responseFormatSelect = document.getElementById('byteDanceResponseFormat');
                const watermarkInput = document.getElementById('byteDanceWatermark');
                const streamModeInput = document.getElementById('byteDanceStreamMode');
                
                console.log('[ByteDance Jimeng] DOM元素检查:', {
                    apiKeyInput: !!apiKeyInput,
                    modelSelect: !!modelSelect,
                    sizeSelect: !!sizeSelect,
                    sequentialModeSelect: !!sequentialModeSelect,
                    maxImagesInput: !!maxImagesInput,
                    guidanceScaleInput: !!guidanceScaleInput,
                    seedInput: !!seedInput,
                    responseFormatSelect: !!responseFormatSelect,
                    watermarkInput: !!watermarkInput,
                    streamModeInput: !!streamModeInput
                });
                
                if (!apiKeyInput || !modelSelect || !sizeSelect) {
                    console.error('[ByteDance Jimeng] 必要的配置表单DOM元素未找到');
                    showByteDanceError('配置表单未正确加载，请刷新页面重试');
                    return;
                }
                
                const apiKey = apiKeyInput.value;
                const selectedModel = modelSelect.value;
                const size = sizeSelect.value;
                const sequentialMode = sequentialModeSelect ? sequentialModeSelect.value : 'disabled';
                const maxImages = maxImagesInput ? parseInt(maxImagesInput.value) : 3;
                const guidanceScale = guidanceScaleInput ? parseFloat(guidanceScaleInput.value) : 2.5;
                const seed = seedInput ? seedInput.value : '';
                const responseFormat = responseFormatSelect ? responseFormatSelect.value : 'url';
                const watermark = watermarkInput ? watermarkInput.checked : true;
                const streamMode = streamModeInput ? streamModeInput.checked : false;
                
                console.log('[ByteDance Jimeng] 配置数据:', {
                    hasApiKey: !!apiKey.trim(),
                    model: selectedModel,
                    size: size,
                    sequentialMode: sequentialMode,
                    maxImages: maxImages,
                    guidanceScale: guidanceScale,
                    hasSeed: !!seed.trim(),
                    responseFormat: responseFormat,
                    watermark: watermark,
                    streamMode: streamMode
                });
                
                if (!apiKey.trim()) {
                    console.warn('[ByteDance Jimeng] API Key为空');
                    showByteDanceError('请输入 ARK API Key');
                    return;
                }

                const config = {
                    apiKey: apiKey.trim(),
                    model: selectedModel || 'doubao-seedream-4-0-250828',
                    size: size || '2K',
                    sequentialImageGeneration: sequentialMode || 'disabled',
                    maxImages: maxImages || 3,
                    guidanceScale: guidanceScale || 2.5,
                    seed: seed.trim() ? parseInt(seed) : null,
                    responseFormat: responseFormat || 'url',
                    watermark: watermark !== false,
                    stream: streamMode || false
                };
                
                console.log('[ByteDance Jimeng] 保存配置:', config);
                
                try {
                    localStorage.setItem('byteDanceJimengConfig', JSON.stringify(config));
                    console.log('[ByteDance Jimeng] 配置保存成功');
                    
                    // 显示成功信息
                    const testResult = document.getElementById('byteDanceJimengTestResult');
                    if (testResult) {
                        testResult.className = 'mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded';
                        testResult.textContent = '✅ 字节跳动即梦4.0 配置已保存成功！';
                        testResult.classList.remove('hidden');
                    }
                    
                    // 清除错误信息
                    const errorDiv = document.getElementById('byteDanceJimengError');
                    if (errorDiv) {
                        errorDiv.classList.add('hidden');
                    }
                    
                    // 延迟关闭模态框，让用户看到成功信息
                    setTimeout(() => {
                        closeByteDanceJimengModal();
                    }, 1500);
                    
                } catch (error) {
                    console.error('[ByteDance Jimeng] 配置保存失败:', error);
                    showByteDanceError('配置保存失败: ' + error.message);
                }
            };

            function loadByteDanceConfig() {
                try {
                    const configStr = localStorage.getItem('byteDanceJimengConfig');
                    if (configStr) {
                        const config = JSON.parse(configStr);
                        
                        // 恢复配置值
                        const apiKeyInput = document.getElementById('byteDanceArkApiKey');
                        const modelSelect = document.getElementById('byteDanceModel');
                        const sizeSelect = document.getElementById('byteDanceSize');
                        const sequentialModeSelect = document.getElementById('byteDanceSequentialMode');
                        const maxImagesInput = document.getElementById('byteDanceMaxImages');
                        const guidanceScaleInput = document.getElementById('byteDanceGuidanceScale');
                        const seedInput = document.getElementById('byteDanceSeed');
                        const responseFormatSelect = document.getElementById('byteDanceResponseFormat');
                        const watermarkInput = document.getElementById('byteDanceWatermark');
                        const streamModeInput = document.getElementById('byteDanceStreamMode');
                        
                        if (apiKeyInput && config.apiKey) apiKeyInput.value = config.apiKey;
                        if (modelSelect && config.model) modelSelect.value = config.model;
                        if (sizeSelect && config.size) sizeSelect.value = config.size;
                        if (sequentialModeSelect && config.sequentialImageGeneration) sequentialModeSelect.value = config.sequentialImageGeneration;
                        if (maxImagesInput && config.maxImages) maxImagesInput.value = config.maxImages;
                        if (guidanceScaleInput && config.guidanceScale) guidanceScaleInput.value = config.guidanceScale;
                        if (seedInput && config.seed) seedInput.value = config.seed;
                        if (responseFormatSelect && config.responseFormat) responseFormatSelect.value = config.responseFormat;
                        if (watermarkInput) watermarkInput.checked = config.watermark !== false;
                        if (streamModeInput) streamModeInput.checked = config.stream || false;
                        
                        console.log('[ByteDance Jimeng] 配置加载成功:', config);
                    }
                } catch (error) {
                    console.error('[ByteDance Jimeng] 配置加载失败:', error);
                }
            }

            window.testByteDanceConnection = function testByteDanceConnection() {
                console.log('[ByteDance Jimeng] 开始测试连接...');
                
                const apiKeyInput = document.getElementById('byteDanceArkApiKey');
                if (!apiKeyInput || !apiKeyInput.value.trim()) {
                    showByteDanceError('请先输入 ARK API Key');
                    return;
                }
                
                const config = {
                    apiKey: apiKeyInput.value.trim(),
                    model: document.getElementById('byteDanceModel')?.value || 'doubao-seedream-4-0-250828'
                };
                
                // 显示测试进行中
                const testResult = document.getElementById('byteDanceJimengTestResult');
                if (testResult) {
                    testResult.className = 'mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded';
                    testResult.textContent = '⏳ 正在测试连接，请稍候...';
                    testResult.classList.remove('hidden');
                }
                
                // 发送测试请求到后端
                fetch('/api/test/bytedance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(config)
                })
                .then(response => response.json())
                .then(result => {
                    if (testResult) {
                        if (result.success) {
                            testResult.className = 'mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded';
                            testResult.textContent = '✅ 连接测试成功！ARK API 可正常使用';
                        } else {
                            testResult.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded';
                            testResult.textContent = '❌ 连接测试失败：' + (result.error || '未知错误');
                        }
                    }
                })
                .catch(error => {
                    console.error('[ByteDance Jimeng] 测试连接失败:', error);
                    if (testResult) {
                        testResult.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded';
                        testResult.textContent = '❌ 连接测试失败：网络错误或服务不可用';
                    }
                });
            };

            window.toggleByteDanceAdvanced = function toggleByteDanceAdvanced() {
                const checkbox = document.getElementById('showByteDanceAdvanced');
                const paramsDiv = document.getElementById('byteDanceAdvancedParams');
                const icon = document.getElementById('byteDanceAdvancedIcon');
                
                if (checkbox && paramsDiv && icon) {
                    if (checkbox.checked) {
                        paramsDiv.classList.remove('hidden');
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    } else {
                        paramsDiv.classList.add('hidden');
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            };

            function showByteDanceError(message) {
                const errorDiv = document.getElementById('byteDanceJimengError');
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.classList.remove('hidden');
                }
            };

            // ByteDance Jimeng Modal 点击外部关闭
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'byteDanceJimengModal') {
                    closeByteDanceJimengModal();
                }
            });

            // ===============================================
            // 🚀 Initialize Enhanced Image Providers (V2 API)
            // ===============================================
            
            // Initialize provider selection handling
            handleProviderSelection();
            
            // Initialize default provider configuration
            document.addEventListener('DOMContentLoaded', function() {
                // Show Cloudflare config by default
                document.querySelectorAll('.provider-config').forEach(config => {
                    config.classList.add('hidden');
                });
                document.getElementById('cloudflare-config').classList.remove('hidden');
                
                // Update cost estimation when provider changes
                document.querySelectorAll('input[name="imageProvider"]').forEach(provider => {
                    provider.addEventListener('change', updateCostEstimation);
                });
            });
            
            // Update cost estimation based on selected provider
            function updateCostEstimation() {
                const selectedProvider = document.querySelector('input[name="imageProvider"]:checked');
                if (!selectedProvider) return;
                
                const costEstimate = document.getElementById('costEstimate');
                const estimates = {
                    'cloudflare': '≈ 免费 (Cloudflare额度)',
                    'alibaba-dashscope': '≈ ¥0.10-0.50/张',
                    'bytedance-ark': '≈ ¥0.20-0.60/张',
                    'stability-ai': '≈ $0.04-0.20/张',
                    'hugging-face': '≈ $0.02-0.10/张',
                    'replicate': '≈ $0.01-0.05/张'
                };
                
                costEstimate.textContent = estimates[selectedProvider.value] || '≈ $0.25/页面';
            }
            
            // Test V2 API connection
            window.testV2ImageGeneration = async function testV2ImageGeneration() {
                const v2Config = collectV2Config();
                if (!v2Config) {
                    alert('请先选择一个图片生成提供商');
                    return;
                }
                
                if (v2Config.provider !== 'cloudflare' && !v2Config.apiKey) {
                    alert(\`请输入\${getProviderName(v2Config.provider)}的API Key\`);
                    return;
                }
                
                const testBtn = event.target;
                const originalText = testBtn.innerHTML;
                testBtn.disabled = true;
                testBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>测试中...';
                
                try {
                    const imageUrl = await generateImageV2('A beautiful sunset over mountains', 'Test image alt text');
                    alert(\`✅ \${getProviderName(v2Config.provider)} 测试成功！\\n\\n生成的图片：\${imageUrl.substring(0, 60)}...\`);
                } catch (error) {
                    console.error('V2 API test failed:', error);
                    alert(\`❌ \${getProviderName(v2Config.provider)} 测试失败：\\n\\n\${error.message}\`);
                } finally {
                    testBtn.disabled = false;
                    testBtn.innerHTML = originalText;
                }
            };

        </script>
        
        <!-- Vertex AI Imagen 配置弹窗 -->
        <div id="vertexAIModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b p-6 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                                <i class="fab fa-google text-white text-lg"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900">Google Cloud Vertex AI Imagen 配置</h2>
                                <p class="text-sm text-gray-600">企业级AI图像生成服务</p>
                            </div>
                        </div>
                        <button onclick="closeVertexAIModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- 基础配置 -->
                    <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-cog mr-2 text-blue-600"></i>
                            基础配置
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">模型选择 *</label>
                                <select id="modalImagenModel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="imagen-4.0-generate-001">Imagen 4.0 Generate - 最高画质</option>
                                    <option value="imagen-4.0-fast-generate-001">Imagen 4.0 Fast - 快速生成</option>
                                    <option value="imagen-3.0-generate-002">Imagen 3.0 Generate - 稳定(20 RPM)</option>
                                    <option value="imagen-3.0-fast-generate-001">Imagen 3.0 Fast - 高速(200 RPM)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">GCP Project ID *</label>
                                <input type="text" id="modalGcpProjectId" placeholder="your-project-123" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">区域</label>
                                <select id="modalGcpLocation" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="us-central1">us-central1 (推荐)</option>
                                    <option value="europe-west2">europe-west2</option>
                                    <option value="asia-northeast3">asia-northeast3</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Access Token *</label>
                                <input type="password" id="modalGcpAccessToken" placeholder="ya29.c..." 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-white rounded border text-sm text-gray-600">
                            <p><strong>获取Access Token:</strong> 在终端运行 <code class="bg-gray-100 px-1 rounded">gcloud auth print-access-token</code></p>
                        </div>
                    </div>
                    
                    <!-- 图像参数 -->
                    <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-image mr-2 text-green-600"></i>
                            图像参数
                        </h3>
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">宽高比</label>
                                <select id="modalAspectRatio" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="1:1">1:1 (方形)</option>
                                    <option value="3:4">3:4 (广告)</option>
                                    <option value="4:3">4:3 (摄影)</option>
                                    <option value="16:9">16:9 (横向)</option>
                                    <option value="9:16">9:16 (纵向)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
                                <select id="modalSampleCount" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="1">1张</option>
                                    <option value="2">2张</option>
                                    <option value="3">3张</option>
                                    <option value="4">4张</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                                <select id="modalMimeType" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" onchange="toggleJpegQuality()">
                                    <option value="image/png">PNG</option>
                                    <option value="image/jpeg">JPEG</option>
                                    <option value="image/webp">WebP</option>
                                </select>
                            </div>
                            
                            <div id="modalJpegQualityDiv" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">JPEG质量</label>
                                <input type="number" id="modalCompressionQuality" min="1" max="100" value="85" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 安全与合规 -->
                    <div class="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-shield-alt mr-2 text-yellow-600"></i>
                            安全与合规设置
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">人物生成</label>
                                <select id="modalPersonGeneration" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="allow_adult">允许成年人</option>
                                    <option value="dont_allow">禁止人物</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">安全级别</label>
                                <select id="modalSafetySetting" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="block_medium_and_above">中等安全 (推荐)</option>
                                    <option value="block_low_and_above">最高安全</option>
                                    <option value="block_only_high">最低安全</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-4 flex flex-wrap items-center gap-6">
                            <label class="flex items-center">
                                <input type="checkbox" id="modalAddWatermark" checked class="mr-2">
                                <span class="text-sm text-gray-700">启用数字水印 (SynthID)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="modalEnhancePrompt" checked class="mr-2">
                                <span class="text-sm text-gray-700">提示词增强</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="modalIncludeRaiReason" class="mr-2">
                                <span class="text-sm text-gray-700">包含RAI原因</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- 高级设置 -->
                    <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center cursor-pointer" onclick="toggleAdvancedSettings()">
                            <i class="fas fa-cogs mr-2 text-gray-600"></i>
                            高级设置
                            <i class="fas fa-chevron-down ml-2 text-xs" id="advancedIcon"></i>
                        </h3>
                        
                        <div id="advancedSettings" class="hidden space-y-4">
                            <div class="flex items-center space-x-3">
                                <label class="flex items-center">
                                    <input type="checkbox" id="modalUseSeed" class="mr-2" onchange="toggleSeedInput()">
                                    <span class="text-sm text-gray-700">使用固定种子 (确定性输出)</span>
                                </label>
                                <input type="number" id="modalSeed" placeholder="1-2147483647" min="1" max="2147483647" 
                                    class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" disabled>
                            </div>
                            
                            <div class="text-xs text-gray-500">
                                <p><strong>注意:</strong> 使用种子时将自动禁用数字水印以确保确定性输出。</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-xl flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        配置将自动保存到本地存储
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="testVertexAIConnection()" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <i class="fas fa-plug mr-2"></i>测试连接
                        </button>
                        <button onclick="closeVertexAIModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button onclick="saveVertexAIConfig()" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ChatGPT图像生成配置弹窗 -->
        <div id="chatGPTModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b p-6 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-r from-green-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                                <i class="fas fa-robot text-white text-lg"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900">ChatGPT 图像生成配置</h2>
                                <p class="text-sm text-gray-600">GPT-Image-1 ｜ DALL·E-2 ｜ DALL·E-3</p>
                            </div>
                        </div>
                        <button onclick="closeChatGPTModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- 通用必填字段 -->
                    <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-key mr-2 text-green-600"></i>
                            基础配置
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key *</label>
                                <input type="password" id="chatgptApiKey" placeholder="sk-..." 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">模型选择 *</label>
                                <select id="chatgptModel" onchange="updateChatGPTParameters()" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="gpt-image-1">gpt-image-1 - 最新多模态图像生成</option>
                                    <option value="dall-e-3">dall-e-3 - 高质量图像生成</option>
                                    <option value="dall-e-2">dall-e-2 - 经典稳定模型</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">提示词 *</label>
                                <textarea id="chatgptPrompt" placeholder="输入图像生成的描述..." rows="3"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 推荐参数 -->
                    <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-sliders-h mr-2 text-blue-600"></i>
                            参数配置
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Size -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
                                <select id="chatgptSize" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <!-- Options will be populated by updateChatGPTParameters() -->
                                </select>
                            </div>
                            
                            <!-- Quality -->
                            <div id="chatgptQualityContainer">
                                <label class="block text-sm font-medium text-gray-700 mb-2">质量</label>
                                <select id="chatgptQuality" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <!-- Options will be populated by updateChatGPTParameters() -->
                                </select>
                            </div>
                            
                            <!-- Format -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                                <select id="chatgptFormat" onchange="updateFormatDependentOptions()" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <!-- Options will be populated by updateChatGPTParameters() -->
                                </select>
                            </div>
                            
                            <!-- N (生成数量) -->
                            <div id="chatgptNContainer">
                                <label class="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
                                <select id="chatgptN" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="1">1张</option>
                                    <option value="2">2张</option>
                                    <option value="3">3张</option>
                                    <option value="4">4张</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Background (仅gpt-image-1) -->
                        <div id="chatgptBackgroundContainer" class="mt-4 hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">背景设置</label>
                            <div class="flex space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="chatgptBackground" value="opaque" checked class="mr-2">
                                    <span class="text-sm">不透明</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="chatgptBackground" value="transparent" class="mr-2">
                                    <span class="text-sm">透明背景</span>
                                </label>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">透明背景仅在png/webp格式且medium/high质量时效果最佳</p>
                        </div>
                        
                        <!-- Compression (仅gpt-image-1的jpeg/webp) -->
                        <div id="chatgptCompressionContainer" class="mt-4 hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">压缩级别 (0-100)</label>
                            <input type="range" id="chatgptCompression" min="0" max="100" value="85" 
                                class="w-full" oninput="updateCompressionValue()">
                            <div class="flex justify-between text-xs text-gray-500">
                                <span>最高压缩</span>
                                <span id="compressionValue">85</span>
                                <span>最低压缩</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-xl flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        配置将自动保存到本地存储
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="closeChatGPTModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button onclick="saveChatGPTConfig()" class="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Nano Banana 配置弹窗 -->
        <div id="nanoBananaModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b p-6 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-r from-yellow-500 to-orange-600 w-10 h-10 rounded-lg flex items-center justify-center">
                                <i class="fas fa-magic text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">Nano Banana 配置</h3>
                                <p class="text-sm text-gray-600">Gemini 2.5 Flash Image Preview</p>
                            </div>
                        </div>
                        <button onclick="closeNanoBananaModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- Error Message Area -->
                    <div id="nanoBananaError" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg"></div>

                    <!-- API Key 输入 -->
                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-key mr-2 text-yellow-500"></i>
                            Gemini API Key *
                        </label>
                        <input 
                            type="password" 
                            id="nanoBananaApiKey"
                            placeholder="输入您的 Gemini API Key"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        />
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-info-circle mr-1"></i>
                            需要有效的 Gemini API Key 才能使用图像生成功能
                        </p>
                    </div>

                    <!-- 第一排：基础风格选择 -->
                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-palette mr-2 text-yellow-500"></i>
                            基础风格 <span class="text-gray-400">(可选)</span>
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button type="button" onclick="selectNanoBananaStyle('base', '')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center active">
                                不选择
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'photorealistic')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                写实摄影
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'sticker')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                贴纸 / 图标
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'logo')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                Logo / 含文字
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'product')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                商品图（白底）
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'illustration')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                留白背景插图
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'comic')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                漫画分格
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'flatlay')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                俯拍平铺
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('base', 'ui')" 
                                    class="nano-banana-base-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                UI / 图解插图
                            </button>
                        </div>
                        <p class="text-xs text-gray-500">
                            选择图片的基础风格类型
                        </p>
                    </div>

                    <!-- 第二排：主题风格选择 -->
                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-adjust mr-2 text-yellow-500"></i>
                            主题风格 <span class="text-gray-400">(可选)</span>
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', '')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center active">
                                不选择
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'professional')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                可信专业
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'warm')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                温暖亲和
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'tech')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                科技未来
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'energetic')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                活力年轻
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'minimal')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                极简高级
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'natural')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                自然清新
                            </button>
                            <button type="button" onclick="selectNanoBananaStyle('enhancement', 'dramatic')" 
                                    class="nano-banana-enhancement-style px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
                                戏剧对比
                            </button>
                        </div>
                        <p class="text-xs text-gray-500">
                            选择图片的整体氛围和情绪
                        </p>
                    </div>

                    <!-- 测试连接 -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-flask text-yellow-600"></i>
                                <span class="text-sm font-medium text-yellow-800">测试 API 连接</span>
                            </div>
                            <button onclick="testNanoBananaConnection()" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                                <i class="fas fa-play mr-2"></i>测试连接
                            </button>
                        </div>
                        <div id="nanoBananaTestResult" class="mt-3 text-sm hidden"></div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-xl">
                    <div class="flex justify-end space-x-3">
                        <button onclick="closeNanoBananaModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button onclick="saveNanoBananaConfig()" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cloudflare Workers AI 配置弹窗 -->
        <div id="cloudflareWorkersAIModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b p-6 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-r from-orange-500 to-red-600 w-10 h-10 rounded-lg flex items-center justify-center">
                                <i class="fab fa-cloudflare text-white text-lg"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900">Cloudflare Workers AI 配置</h2>
                                <p class="text-sm text-gray-600">边缘计算 AI 图像生成服务</p>
                            </div>
                        </div>
                        <button onclick="closeCloudflareWorkersAIModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- 基础配置 -->
                    <div class="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-cog mr-2 text-orange-600"></i>
                            基础配置
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">API Key *</label>
                                <input type="password" id="cloudflareWorkersAIApiKey" 
                                    placeholder="输入你的 Cloudflare API Token" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                <p class="text-xs text-gray-500 mt-1">
                                    在 <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" class="text-orange-600 hover:underline">Cloudflare Dashboard → API Tokens</a> 创建 API Token
                                </p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Account ID *</label>
                                <input type="text" id="cloudflareWorkersAIAccountId" 
                                    placeholder="输入你的 Cloudflare Account ID" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                <p class="text-xs text-gray-500 mt-1">
                                    在 <a href="https://dash.cloudflare.com/" target="_blank" class="text-orange-600 hover:underline">Cloudflare Dashboard</a> 右侧栏找到 Account ID
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 模型配置 -->
                    <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-brain mr-2 text-gray-600"></i>
                            模型配置
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Stable Diffusion 模型</label>
                                <select id="cloudflareWorkersAIModel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                    <option value="@cf/bytedance/stable-diffusion-xl-lightning">SDXL Lightning - 闪电速度生成 (推荐)</option>
                                    <option value="@cf/stabilityai/stable-diffusion-xl-base-1.0">SDXL Base 1.0 - 高质量图像</option>
                                    <option value="@cf/runwayml/stable-diffusion-v1-5-inpainting">SD 1.5 Inpainting - 图像修复</option>
                                    <option value="@cf/black-forest-labs/flux-1-schnell">Flux Schnell - 快速生成，轻量参数</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-1">
                                    Lightning模型速度最快，Base 1.0质量最高，Inpainting支持图像修复，Flux Schnell为新一代快速模型
                                </p>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">推理步数 (num_steps)</label>
                                    <input type="number" id="cloudflareWorkersAISteps" 
                                        min="1" max="20" value="20" 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        1-20步，越高质量越好但耗时越长
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">引导强度 (guidance)</label>
                                    <input type="number" id="cloudflareWorkersAIGuidance" 
                                        min="1" max="20" step="0.5" value="7.5" 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        控制生成图像与提示词的贴合度，默认7.5
                                    </p>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">图像宽度 (width)</label>
                                    <select id="cloudflareWorkersAIWidth" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="512">512px</option>
                                        <option value="768">768px</option>
                                        <option value="1024" selected>1024px (推荐)</option>
                                        <option value="1280">1280px</option>
                                        <option value="1536">1536px</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">图像高度 (height)</label>
                                    <select id="cloudflareWorkersAIHeight" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="512">512px</option>
                                        <option value="768">768px</option>
                                        <option value="1024" selected>1024px (推荐)</option>
                                        <option value="1280">1280px</option>
                                        <option value="1536">1536px</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- 高级参数 -->
                            <div class="border-t pt-4">
                                <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                                    <i class="fas fa-sliders-h mr-2 text-orange-600"></i>
                                    高级参数 (可选)
                                </h4>
                                
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">负面提示词 (negative_prompt)</label>
                                        <textarea id="cloudflareWorkersAINegativePrompt" 
                                            placeholder="描述不希望在图像中出现的元素，例如：low quality, blurry, distorted"
                                            rows="2" 
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
                                        <p class="text-xs text-gray-500 mt-1">
                                            描述生成图像中应避免的元素
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">随机种子 (seed)</label>
                                        <input type="number" id="cloudflareWorkersAISeed" 
                                            placeholder="留空使用随机种子，输入数字可复现相同结果" 
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                        <p class="text-xs text-gray-500 mt-1">
                                            用于生成可复现结果，留空则随机生成
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 服务说明 -->
                    <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                            <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                            服务特点
                        </h3>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• <strong>边缘计算</strong>：全球边缘节点，低延迟图像生成</li>
                            <li>• <strong>高性价比</strong>：按使用量计费，无需预付费</li>
                            <li>• <strong>Stable Diffusion</strong>：支持多种最新的开源图像生成模型</li>
                            <li>• <strong>安全可靠</strong>：Cloudflare 企业级基础设施保障</li>
                        </ul>
                    </div>

                    <!-- 错误信息 -->
                    <div id="cloudflareWorkersAIError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    
                    <!-- 测试结果 -->
                    <div id="cloudflareWorkersAITestResult" class="hidden"></div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        配置将自动保存到本地存储
                    </div>
                    <!-- Debug Info -->
                    <div class="text-xs text-gray-500 mt-2">
                        调试信息：点击按钮后请查看控制台日志和下方提示区域
                    </div>
                    <div class="flex space-x-3 mt-3">
                        <button id="cfTestBtn" onclick="console.log('测试连接被点击'); testCloudflareWorkersAIConnection()" class="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                            <i class="fas fa-plug mr-2"></i>测试连接
                        </button>
                        <button onclick="closeCloudflareWorkersAIModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button id="cfSaveBtn" onclick="console.log('保存配置被点击'); saveCloudflareWorkersAIConfig()" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 🔧 新增：自定义图像OpenAI协议配置模态框 -->
        <div id="customImageOpenAIModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white p-6 border-b rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-cog mr-3 text-blue-600"></i>
                            自定义图像OpenAI协议配置
                        </h2>
                        <button onclick="closeCustomImageOpenAIModal()" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="p-6 space-y-6">
                    <!-- API配置 -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                            <input type="password" id="customImageOpenAIApiKey" 
                                placeholder="输入您的API Key" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <p class="text-xs text-gray-500 mt-1">API Key将加密存储在本地</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
                            <input type="url" id="customImageOpenAIBaseUrl" 
                                placeholder="https://api.openai.com/v1" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <p class="text-xs text-gray-500 mt-1">OpenAI兼容API的Base URL</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">默认模型名称</label>
                            <input type="text" id="customImageOpenAIModel" 
                                placeholder="dall-e-3" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <p class="text-xs text-gray-500 mt-1">可通过"获取模型"按钮自动获取可用模型列表</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                            <select id="customImageOpenAIOutputFormat" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="url">URL链接</option>
                                <option value="base64">Base64编码</option>
                            </select>
                        </div>
                    </div>

                    <!-- 服务说明 -->
                    <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                            <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                            支持的服务
                        </h3>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• <strong>OpenRouter</strong>: https://openrouter.ai/api/v1</li>
                            <li>• <strong>Together AI</strong>: https://api.together.xyz/v1</li>
                            <li>• <strong>Fireworks AI</strong>: https://api.fireworks.ai/inference/v1</li>
                            <li>• <strong>其他OpenAI兼容服务</strong>: 支持标准OpenAI API格式</li>
                        </ul>
                    </div>

                    <!-- 错误信息 -->
                    <div id="customImageOpenAIError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    
                    <!-- 测试结果 -->
                    <div id="customImageOpenAITestResult" class="hidden"></div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        配置将自动保存到本地存储
                    </div>
                    <div class="flex space-x-3 mt-3">
                        <button onclick="testCustomImageOpenAIConnection()" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <i class="fas fa-plug mr-2"></i>测试连接
                        </button>
                        <button onclick="closeCustomImageOpenAIModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button onclick="saveCustomImageOpenAIConfig()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 🔧 新增：免费服务(Unsplash & Pollinations)配置模态框 -->
        <div id="freeServiceModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white p-6 border-b rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <h2 id="freeServiceTitle" class="text-xl font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-gift mr-3 text-green-600"></i>
                            免费服务配置
                        </h2>
                        <button onclick="closeFreeServiceModal()" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="p-6 space-y-6">
                    <!-- 服务描述 -->
                    <div id="freeServiceDescription">
                        <!-- 动态内容由JavaScript填充 -->
                    </div>

                    <!-- API Key配置 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">API Key (可选)</label>
                        <input type="password" id="freeServiceApiKey" 
                            placeholder="留空使用免费限制，填写可获得更好服务" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <p class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-shield-alt mr-1"></i>
                            API Key将加密存储在本地，不会上传到服务器
                        </p>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        配置将自动保存到本地存储
                    </div>
                    <div class="flex space-x-3 mt-3">
                        <button onclick="closeFreeServiceModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button onclick="saveFreeServiceConfig()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ByteDance Jimeng 4.0 配置弹窗 -->
        <div id="byteDanceJimengModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b p-6 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-r from-red-500 to-orange-600 w-10 h-10 rounded-lg flex items-center justify-center">
                                <i class="fab fa-tiktok text-white text-lg"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900">字节跳动 豆包 即梦4.0 配置</h2>
                                <p class="text-sm text-gray-600">火山方舟 ARK API - 智能图像生成服务</p>
                            </div>
                        </div>
                        <button onclick="closeByteDanceJimengModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- 基础配置 -->
                    <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-key mr-2 text-red-600"></i>
                            基础配置
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">ARK API Key *</label>
                                <input type="password" id="byteDanceArkApiKey" 
                                    placeholder="输入你的字节跳动 ARK API Key" 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                                <p class="text-xs text-gray-500 mt-1">
                                    在 <a href="https://console.volcengine.com/ark" target="_blank" class="text-red-600 hover:underline">火山方舟控制台</a> 创建 API Key
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 模型配置 -->
                    <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-500">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-brain mr-2 text-gray-600"></i>
                            模型配置
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">即梦模型</label>
                                <select id="byteDanceModel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                                    <option value="doubao-seedream-4-0-250828">即梦4.0 - 文生图/图生图/组图生成 (推荐)</option>
                                    <option value="doubao-seedream-3-0-t2i-250415">即梦3.0 文生图 - 文字转图像专用</option>
                                    <option value="doubao-seededit-3-0-i2i-250628">即梦3.0 图生图 - 图像编辑专用</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-1">
                                    即梦4.0支持最新功能，3.0系列针对特定任务优化
                                </p>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">图片尺寸</label>
                                <select id="byteDanceSize" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                                    <option value="2K">2K (推荐高质量)</option>
                                    <option value="1024x1024">1024x1024 (方形)</option>
                                    <option value="2048x2048">2048x2048 (高分辨率方形)</option>
                                    <option value="adaptive">adaptive (自适应尺寸)</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-1">
                                    2K为智能分辨率，adaptive根据内容自动调整
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 高级参数 -->
                    <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-gray-800 flex items-center">
                                <i class="fas fa-sliders-h mr-2 text-blue-600"></i>
                                高级参数
                            </h3>
                            <label class="flex items-center cursor-pointer" onclick="toggleByteDanceAdvanced()">
                                <input type="checkbox" id="showByteDanceAdvanced" class="mr-2">
                                <span class="text-sm font-medium text-gray-700">显示高级设置</span>
                                <i class="fas fa-chevron-down ml-2 text-xs text-gray-500" id="byteDanceAdvancedIcon"></i>
                            </label>
                        </div>
                        
                        <div id="byteDanceAdvancedParams" class="hidden space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">组图生成模式 (即梦4.0专用)</label>
                                    <select id="byteDanceSequentialMode" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                        <option value="disabled">单张模式</option>
                                        <option value="auto">自动组图模式</option>
                                    </select>
                                    <p class="text-xs text-gray-500 mt-1">
                                        auto模式可生成多张相关图片
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">最大组图数量</label>
                                    <input type="number" id="byteDanceMaxImages" 
                                        min="1" max="15" value="3" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        组图模式下最多生成的图片数量
                                    </p>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">引导强度 (即梦3.0专用)</label>
                                    <input type="number" id="byteDanceGuidanceScale" 
                                        min="1" max="10" step="0.5" value="2.5" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        控制生成图像与提示词的一致程度
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">随机种子</label>
                                    <input type="number" id="byteDanceSeed" 
                                        placeholder="留空使用随机种子" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        用于生成可复现结果
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">响应格式</label>
                                <select id="byteDanceResponseFormat" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="url">URL链接 (推荐)</option>
                                    <option value="b64_json">Base64编码</option>
                                </select>
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="byteDanceWatermark" checked class="mr-2">
                                <label class="text-sm text-gray-700">添加"AI生成"水印</label>
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="byteDanceStreamMode" class="mr-2">
                                <label class="text-sm text-gray-700">启用流式输出 (即梦4.0专用)</label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 服务说明 -->
                    <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
                            <i class="fas fa-info-circle mr-2 text-green-600"></i>
                            服务特点
                        </h3>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• <strong>即梦4.0</strong>：支持文生图、图生图、组图生成等多种模式</li>
                            <li>• <strong>高质量生成</strong>：专为中文优化，理解更准确</li>
                            <li>• <strong>流式输出</strong>：支持实时查看生成进度</li>
                            <li>• <strong>智能分辨率</strong>：2K模式自动选择最佳尺寸</li>
                            <li>• <strong>组图功能</strong>：可一次性生成多张相关图片</li>
                        </ul>
                    </div>

                    <!-- 错误信息 -->
                    <div id="byteDanceJimengError" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
                    
                    <!-- 测试结果 -->
                    <div id="byteDanceJimengTestResult" class="hidden"></div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        配置将自动保存到本地存储，API Key安全加密存储
                    </div>
                    <div class="flex space-x-3 mt-3">
                        <button onclick="testByteDanceConnection()" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                            <i class="fas fa-plug mr-2"></i>测试连接
                        </button>
                        <button onclick="closeByteDanceJimengModal()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            取消
                        </button>
                        <button onclick="saveByteDanceConfig()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>保存配置
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </body>
    </html>
  `)
})

// API Routes
app.get('/api/models/:provider', async (c) => {
  const provider = c.req.param('provider')
  const apiKey = c.req.header('X-API-Key')
  const customBaseUrl = c.req.header('X-Custom-Base-URL')
  
  try {
    const models = await fetchAvailableModels(provider, apiKey || '', customBaseUrl || '')
    return c.json({ success: true, models })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400)
  }
})

// Cloudflare Workers AI 测试连接 API
app.post('/api/test/cloudflare-workers-ai', async (c) => {
  try {
    const { apiKey, accountId, model, prompt, num_steps } = await c.req.json()
    
    console.log('[API] Cloudflare Workers AI 测试连接请求:', {
      hasApiKey: !!apiKey,
      hasAccountId: !!accountId,
      model,
      prompt
    })
    
    if (!apiKey || !accountId) {
      return c.json({ 
        success: false, 
        error: '缺少必要的API Key或Account ID' 
      }, 400)
    }
    
    const testUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`
    
    console.log('[API] 发送测试请求到:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt || 'A simple test image',
        num_steps: num_steps || 20
      })
    })
    
    console.log('[API] Cloudflare API 响应状态:', response.status)
    console.log('[API] 响应头 Content-Type:', response.headers.get('content-type'))
    
    if (response.ok) {
      // Cloudflare Workers AI 返回二进制图片数据，不是JSON
      const contentType = response.headers.get('content-type') || ''
      
      if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
        // 成功返回图片数据
        console.log('[API] 成功接收到图片数据，内容类型:', contentType)
        
        return c.json({ 
          success: true, 
          message: 'Cloudflare Workers AI 连接成功！API正常工作并返回了图片数据。',
          data: {
            model,
            status: 'connected',
            content_type: contentType,
            response_time: Date.now()
          }
        })
      } else {
        // 尝试解析为JSON（可能是错误响应）
        try {
          const data = await response.json()
          console.log('[API] 收到JSON响应:', data)
          
          return c.json({ 
            success: true, 
            message: 'Cloudflare Workers AI 连接成功',
            data: {
              model,
              status: 'connected',
              response: data,
              response_time: Date.now()
            }
          })
        } catch (jsonError) {
          // 既不是图片也不是JSON，读取为文本
          const textData = await response.text()
          console.log('[API] 收到文本响应:', textData.substring(0, 100))
          
          return c.json({ 
            success: true, 
            message: 'Cloudflare Workers AI 连接成功',
            data: {
              model,
              status: 'connected',
              response_type: 'text',
              response_time: Date.now()
            }
          })
        }
      }
    } else {
      // 错误响应处理
      let errorMessage = `HTTP ${response.status}`
      let errorDetails = ''
      
      try {
        const contentType = response.headers.get('content-type') || ''
        
        if (contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('[API] JSON错误响应:', errorData)
          
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0].message || errorMessage
            errorDetails = JSON.stringify(errorData.errors)
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } else {
          const errorText = await response.text()
          console.error('[API] 文本错误响应:', errorText)
          errorDetails = errorText.substring(0, 200)
          
          if (errorText) {
            errorMessage = errorText
          }
        }
      } catch (parseError) {
        console.error('[API] 解析错误响应失败:', parseError)
        errorMessage = `HTTP ${response.status} - 无法解析错误信息`
      }
      
      return c.json({ 
        success: false, 
        error: `Cloudflare API 错误: ${errorMessage}`,
        details: errorDetails,
        status: response.status
      }, 400)
    }
  } catch (error) {
    console.error('[API] Cloudflare Workers AI 测试异常:', error)
    
    return c.json({ 
      success: false, 
      error: `测试连接失败: ${error.message}`
    }, 500)
  }
})

// Fetch available models from providers
async function fetchAvailableModels(provider: string, apiKey: string, customBaseUrl: string = ''): Promise<string[]> {
  // 2025年最新完整模型列表 - 包含新增模型
  const defaultModels = {
    // 文本模型
    'qwen3': ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen2.5-72b-instruct', 'qwen2.5-32b-instruct', 'qwen-long'],
    'qwen3-new': ['qwen3-70b-instruct', 'qwen3-32b-instruct', 'qwen3-14b-instruct', 'qwen3-7b-instruct'],
    'claude': ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
    'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    'gemini': ['gemini-2.5-pro', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    'custom-openai': ['自定义模型'],
    // 图片模型
    'qwen-vl': ['qwen-vl-max', 'qwen-vl-plus', 'qwen2-vl-72b-instruct', 'qwen-vl-chat'],
    'qwen-image': ['qwen-image-plus', 'qwen-image'],
    'wanx-v1': ['wanx-v1'],
    'dalle3': ['dall-e-3'],
    'gemini-imagen': ['gemini-imagen-3.0', 'gemini-imagen-2.0', 'imagen-3.0-fast', 'imagen-3.0-generate', 'imagen-2.0-generate'],
    'nano-banana': ['gemini-2.5-flash-image-preview'],
    'imagen-4': ['imagen-4.0-generate-001', 'imagen-4.0-fast-generate-001'],
    'vertex-ai-imagen': ['imagen-4.0-generate-001', 'imagen-4.0-fast-generate-001', 'imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001'],
    'openai-compatible': ['自定义图像模型'],
    'cloudflare-workers-ai': ['@cf/bytedance/stable-diffusion-xl-lightning', '@cf/stabilityai/stable-diffusion-xl-base-1.0', '@cf/runwayml/stable-diffusion-v1-5-inpainting', '@cf/black-forest-labs/flux-1-schnell'],
    'unsplash': ['unsplash-api'],
    'pollinations': ['pollinations-free']
  }

  // 免费服务直接返回默认值
  if (['pollinations', 'unsplash'].includes(provider)) {
    return defaultModels[provider] || []
  }

  // Cloudflare Workers AI 使用默认模型列表（需要API key但有免费额度）
  if (provider === 'cloudflare-workers-ai') {
    return defaultModels[provider] || []
  }

  // 如果没有API Key，返回默认模型
  if (!apiKey) {
    return defaultModels[provider] || []
  }

  // 尝试从API获取真实模型列表
  try {
    let baseURL: string
    let headers: Record<string, string>
    let needsApiCall = true

    switch (provider) {
      case 'qwen3':
        baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models'
        headers = { 
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        }
        break
      case 'qwen3-new':
        // QWEN3新版本，使用相同的API端点
        baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models'
        headers = { 
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        }
        break
      case 'openai':
        baseURL = 'https://api.openai.com/v1/models'
        headers = { 
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        }
        break
      case 'claude':
        // Claude没有公开的模型列表API，直接返回默认值
        needsApiCall = false
        break
      case 'gemini':
        // Gemini可以尝试获取模型列表 - 修复API兼容性问题
        baseURL = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey
        headers = { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; AI-HTML-Generator)'
        }
        break
      case 'qwen-image':
        // QWEN图像生成 - 尝试获取模型列表
        baseURL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/models'
        headers = { 
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        }
        needsApiCall = false // 暂时使用默认值，因为没有公开的模型列表API
        break
      case 'wanx-v1':
        // WanX-V1 - 暂时使用默认值
        needsApiCall = false
        break
      case 'nano-banana':
        // Nano Banana - 使用Gemini API架构，但暂时使用默认值
        needsApiCall = false
        break
      case 'imagen-4':
        // Imagen 4 - 暂时使用默认值
        needsApiCall = false
        break
      case 'custom-openai':
        // 🔧 修复: 使用自定义 base URL 获取模型列表
        if (customBaseUrl) {
          baseURL = customBaseUrl.endsWith('/models') ? customBaseUrl : customBaseUrl + '/models'
          headers = { 
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          }
          needsApiCall = true
          console.log('🔧 Custom OpenAI: Fetching models from:', baseURL)
        } else {
          needsApiCall = false
        }
        break
      case 'openai-compatible':
        // 🔧 新增: 自定义图像模型支持 (与 custom-openai 类似逻辑)
        if (customBaseUrl) {
          baseURL = customBaseUrl.endsWith('/models') ? customBaseUrl : customBaseUrl + '/models'
          headers = { 
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          }
          needsApiCall = true
          console.log('🔧 Custom Image OpenAI: Fetching models from:', baseURL)
        } else {
          needsApiCall = false
        }
        break
      case 'qwen-vl':
      case 'dalle3':
      case 'gemini-imagen':
        // 这些服务暂时返回默认值
        needsApiCall = false
        break
      default:
        needsApiCall = false
        break
    }

    if (!needsApiCall) {
      return defaultModels[provider] || []
    }

    console.log('Fetching models from ' + provider + ' with URL: ' + baseURL)
    
    const response = await fetch(baseURL, { 
      headers,
      method: 'GET'
    })
    
    if (!response.ok) {
      console.warn('API call failed for ' + provider + ': ' + response.status + ' ' + response.statusText)
      return defaultModels[provider] || []
    }

    const data = await response.json()
    console.log('API response for ' + provider + ':', data)
    
    // 解析不同提供商的响应格式
    let models: string[] = []
    
    if (provider === 'openai' && data.data) {
      models = data.data
        .filter((model: any) => 
          model.id && (
            model.id.includes('gpt') || 
            model.id.includes('text-davinci') ||
            model.id.includes('text-curie')
          )
        )
        .map((model: any) => model.id)
        .sort()
    } else if (provider === 'qwen3' && data.data) {
      models = data.data
        .filter((model: any) => model.id && model.id.includes('qwen'))
        .map((model: any) => model.id)
        .sort()
    } else if (provider === 'gemini' && data.models) {
      models = data.models
        .filter((model: any) => 
          model.name && (
            model.name.includes('gemini') ||
            model.name.includes('models/gemini')
          ) && 
          // 过滤掉不支持的模型类型
          !model.name.includes('embedding') &&
          !model.name.includes('vision') &&
          model.supportedGenerationMethods && 
          model.supportedGenerationMethods.includes('generateContent')
        )
        .map((model: any) => {
          // 提取模型名称用于前端显示，后端会自动补全 models/ 前缀
          const name = model.name.replace('models/', '')
          return name
        })
        .sort()
    } else if (provider === 'custom-openai' && data.data) {
      // 🔧 修复: 处理 OpenRouter 等自定义 OpenAI 兼容 API 的响应格式
      models = data.data
        .filter((model: any) => model.id && model.id.trim() !== '')
        .map((model: any) => model.id)
        .sort()
      
      console.log('🔧 Custom OpenAI: Parsed', models.length, 'models from API response')
    } else if (provider === 'openai-compatible' && data.data) {
      // 🔧 新增: 处理自定义图像模型 OpenAI 兼容 API 的响应格式
      models = data.data
        .filter((model: any) => model.id && model.id.trim() !== '')
        .map((model: any) => model.id)
        .sort()
      
      console.log('🔧 Custom Image OpenAI: Parsed', models.length, 'models from API response')
    }
    
    // 如果获取到了模型，返回获取的模型，否则返回默认值
    if (models.length > 0) {
      console.log('Successfully fetched ' + models.length + ' models for ' + provider + ':', models)
      return models
    } else {
      console.log('No models found in API response for ' + provider + ', using defaults')
      return defaultModels[provider] || []
    }
    
  } catch (error) {
    console.error('Error fetching models for ' + provider + ':', error)
    return defaultModels[provider] || []
  }
}

// 🍌 Nano Banana (Gemini 2.5 Flash Image) 测试端点
app.post('/api/test/nano-banana', async (c) => {
  try {
    const { apiKey, prompt } = await c.req.json()
    
    console.log('[API] Nano Banana 测试连接请求:', {
      hasApiKey: !!apiKey,
      prompt: prompt?.substring(0, 50) + '...'
    })
    
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: '缺少必要的 Gemini API Key' 
      }, 400)
    }
    
    const testUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'
    
    console.log('[API] 发送测试请求到 Nano Banana API')
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt || 'A simple test image of a small banana'
          }]
        }],
        generationConfig: {
          responseModalities: ["Image"]
        }
      })
    })
    
    console.log('[API] Nano Banana API 响应状态:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      
      // 检查是否成功生成了图片
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const part = data.candidates[0].content.parts[0]
        if (part.inlineData && part.inlineData.data) {
          console.log('[API] 成功生成 Nano Banana 图片')
          
          return c.json({ 
            success: true, 
            message: 'Nano Banana 连接成功！API正常工作并返回了图片数据。',
            data: {
              hasImageData: true,
              mimeType: part.inlineData.mimeType || 'image/png',
              dataSize: part.inlineData.data.length
            }
          })
        }
      }
      
      return c.json({ 
        success: false, 
        error: 'API响应格式异常，未找到图片数据' 
      }, 500)
    } else {
      const errorText = await response.text()
      console.error('[API] Nano Banana API 错误:', response.status, errorText)
      
      return c.json({ 
        success: false, 
        error: `API请求失败 (${response.status}): ${errorText}` 
      }, response.status)
    }
    
  } catch (error) {
    console.error('[API] Nano Banana 测试连接异常:', error)
    return c.json({ 
      success: false, 
      error: `连接异常: ${error.message}` 
    }, 500)
  }
})

// 🍌 Nano Banana 图片生成端点
// 🔧 构建增强提示词 - 支持用户前端输入的样式参数
function buildEnhancedPromptForNanoBanana(basePrompt: string, baseStyle?: string, styleEnhancement?: string): string {
  let enhancedPrompt = basePrompt;
  
  // 添加基础样式
  if (baseStyle && baseStyle.trim()) {
    enhancedPrompt += `, ${baseStyle.trim()}`;
  }
  
  // 添加样式增强
  if (styleEnhancement && styleEnhancement.trim()) {
    enhancedPrompt += `, ${styleEnhancement.trim()}`;
  }
  
  console.log('🎨 [Nano Banana] Enhanced prompt:', {
    original: basePrompt,
    baseStyle,
    styleEnhancement,
    final: enhancedPrompt
  });
  
  return enhancedPrompt;
}

app.post('/api/generate/nano-banana', async (c) => {
  try {
    const { apiKey, prompt, outputFormat, basePromptStyle, styleEnhancement, aspectRatio } = await c.req.json()
    
    console.log('[API] Nano Banana 图片生成请求:', {
      hasApiKey: !!apiKey,
      prompt: prompt?.substring(0, 50) + '...',
      outputFormat,
      basePromptStyle,
      styleEnhancement,
      aspectRatio
    })
    
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: '缺少必要的 Gemini API Key' 
      }, 400)
    }
    
    if (!prompt) {
      return c.json({ 
        success: false, 
        error: '缺少必要的提示词' 
      }, 400)
    }
    
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'
    
    console.log('[API] 调用 Nano Banana API 生成图片')
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: buildEnhancedPromptForNanoBanana(prompt, basePromptStyle, styleEnhancement)
          }]
        }],
        generationConfig: {
          responseModalities: ["Image"] // 只返回图片，不返回文本
        }
      })
    })
    
    console.log('[API] Nano Banana API 响应状态:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      
      // 解析响应数据
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const part = data.candidates[0].content.parts[0]
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png'
          const base64Data = part.inlineData.data
          
          console.log('[API] 成功生成 Nano Banana 图片, 大小:', base64Data.length)
          
          // 根据用户选择的输出格式返回
          let imageUrl
          if (outputFormat === 'url') {
            // TODO: 实现上传到 R2 或外部存储服务，返回 URL
            // 目前先返回 base64 格式
            console.log('🔄 URL format requested but not yet implemented, returning base64')
            imageUrl = `data:${mimeType};base64,${base64Data}`
          } else {
            // 默认返回 base64 格式
            imageUrl = `data:${mimeType};base64,${base64Data}`
          }
          
          return c.json({ 
            success: true, 
            imageUrl: imageUrl,
            mimeType: mimeType,
            format: outputFormat || 'base64'
          })
        }
      }
      
      return c.json({ 
        success: false, 
        error: 'API响应格式异常，未找到图片数据' 
      }, 500)
    } else {
      const errorText = await response.text()
      console.error('[API] Nano Banana API 错误:', response.status, errorText)
      
      let errorMessage = `API请求失败 (${response.status})`
      switch (response.status) {
        case 401:
          errorMessage = 'Invalid API key. Please check your Gemini API key.'
          break
        case 403:
          errorMessage = 'Access forbidden. Please check your API key permissions.'
          break
        case 429:
          errorMessage = 'Rate limit exceeded. Please wait and try again.'
          break
        case 400:
          errorMessage = 'Invalid request. Please check your input.'
          break
        default:
          errorMessage += `: ${errorText}`
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage 
      }, response.status)
    }
    
  } catch (error) {
    console.error('[API] Nano Banana 图片生成异常:', error)
    return c.json({ 
      success: false, 
      error: `生成异常: ${error.message}` 
    }, 500)
  }
})

// 🚀 异步生成API - 立即返回HTML框架，图片后台处理
app.post('/api/generate', async (c) => {
  const startTime = Date.now()
  // Generate UUID compatible with Cloudflare Workers/Pages
  const jobId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  
  try {
    console.log(`🚀 [${jobId}] Starting async generation request`)
    const requestData = await c.req.json()
    
    // 🔒 强化验证请求数据 - 确保用户配置完整性
    const validationErrors = []
    
    if (!requestData.userPrompt || typeof requestData.userPrompt !== 'string') {
      validationErrors.push('Missing or invalid userPrompt')
    }
    
    if (!requestData.pageConfig || typeof requestData.pageConfig !== 'object') {
      validationErrors.push('Missing or invalid pageConfig')
    }
    
    if (!requestData.unifiedConfig || typeof requestData.unifiedConfig !== 'object') {
      validationErrors.push('Missing or invalid unifiedConfig')
    }
    
    // 验证文本配置
    if (requestData.unifiedConfig?.text) {
      const textConfig = requestData.unifiedConfig.text
      if (!textConfig.provider) {
        validationErrors.push('Missing text provider')
      }
      if (textConfig.provider !== 'test' && !textConfig.apiKey) {
        validationErrors.push('Missing text API key for non-test provider')
      }
    } else {
      validationErrors.push('Missing text configuration')
    }
    
    // 验证图片配置
    if (requestData.unifiedConfig?.image) {
      const imageConfig = requestData.unifiedConfig.image
      if (!imageConfig.provider) {
        validationErrors.push('Missing image provider')
      }
    } else {
      validationErrors.push('Missing image configuration')
    }
    
    if (validationErrors.length > 0) {
      return c.json({ 
        success: false, 
        error: 'Validation failed: ' + validationErrors.join(', '),
        step: 'validation',
        jobId
      }, 400)
    }
    
    console.log(`📋 [${jobId}] ✅ Validation passed. Processing with providers:`, {
      text: requestData.unifiedConfig.text?.provider,
      image: requestData.unifiedConfig.image?.provider,
      testMode: requestData.unifiedConfig.testMode
    })
    
    // 🏗️ 第一阶段：快速生成HTML结构 (保持所有配置不变)
    console.log(`⚡ [${jobId}] Generating HTML structure only (fast)`)
    const htmlStructure = await generateHTMLStructureOnly(requestData)
    
    // 💾 存储完整任务到D1数据库 (保持所有用户配置)
    await c.env.DB.prepare(`
      INSERT INTO async_jobs (id, status, request_data, html_structure, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(
      jobId,
      'pending',
      JSON.stringify(requestData), // 🔒 完整保存用户配置
      htmlStructure
    ).run()
    
    // 📝 在KV中设置初始状态
    await c.env.JOBS.put(jobId, JSON.stringify({
      status: 'pending',
      htmlStructure,
      images: [],
      createdAt: new Date().toISOString()
    }))
    
    // 🔄 启动后台图片处理 (异步，不阻塞响应)
    // Note: Using Promise without waitUntil for Pages Functions compatibility
    processImagesAsync(c.env, jobId, requestData, htmlStructure).catch(error => {
      console.error(`❌ [${jobId}] Background processing failed:`, error)
    })
    
    const duration = Date.now() - startTime
    console.log(`✅ [${jobId}] HTML structure generated in ${duration}ms, images processing in background`)
    
    // 🚀 立即返回HTML框架 (2-3秒响应)
    return c.json({ 
      success: true,
      jobId: jobId,
      status: 'processing',
      html: htmlStructure, // 带图片占位符的HTML
      message: 'HTML structure generated, images processing in background',
      duration
    }, 202) // HTTP 202 Accepted
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ [${jobId}] Generation error after ${duration}ms:`, {
      error: error.message,
      stack: error.stack,
      step: error.step || 'unknown'
    })
    
    // 根据错误类型返回不同的状态码
    let statusCode = 500
    let errorMessage = error.message || 'Generation failed'
    
    if (errorMessage.includes('API key')) {
      statusCode = 401
      errorMessage = 'API key configuration error. Please check your API keys.'
    } else if (errorMessage.includes('timeout')) {
      statusCode = 504
      errorMessage = 'Request timeout. Please try again.'
    } else if (errorMessage.includes('rate limit')) {
      statusCode = 429
      errorMessage = 'Rate limit exceeded. Please try again later.'
    }
    
    return c.json({ 
      success: false, 
      error: errorMessage,
      step: error.step || 'unknown',
      jobId,
      duration
    }, statusCode)
  }
})

// 混合API密钥管理：优先使用用户提供的密钥，回退到环境变量
function enrichModelConfigWithAPIKeys(modelConfig: any, env: any): any {
  const enriched = { ...modelConfig }
  
  // 优先使用用户提供的API密钥，如果没有则使用环境变量（开发者预设）
  
  // 文本模型API密钥
  if (!enriched.textApiKey && !['test'].includes(enriched.textModelProvider)) {
    switch (enriched.textModelProvider) {
      case 'qwen3':
      case 'qwen3-new':
        enriched.textApiKey = env.QWEN_API_KEY || env.GOOGLE_API_KEY
        break
      case 'claude':
        enriched.textApiKey = env.CLAUDE_API_KEY
        break
      case 'openai':
        enriched.textApiKey = env.OPENAI_API_KEY
        break
      case 'gemini':
        enriched.textApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY
        break
      case 'custom-openai':
        enriched.textApiKey = env.CUSTOM_OPENAI_API_KEY
        break
    }
  }
  
  // 图片模型API密钥
  if (!enriched.imageApiKey && !['unsplash', 'pollinations', 'test'].includes(enriched.imageModelProvider)) {
    switch (enriched.imageModelProvider) {
      case 'qwen-vl':
        enriched.imageApiKey = env.QWEN_VL_API_KEY || env.GOOGLE_API_KEY
        break
      case 'dalle3':
        enriched.imageApiKey = env.DALLE_API_KEY || env.OPENAI_API_KEY
        break
      case 'gemini-imagen':
        enriched.imageApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY
        break
      case 'openai-compatible':
        enriched.imageApiKey = env.CUSTOM_OPENAI_API_KEY || env.OPENAI_API_KEY
        break
      case 'chatgpt':
      case 'nano-banana':
        enriched.imageApiKey = env.OPENAI_API_KEY
        break
      case 'cloudflare-workers-ai':
        enriched.imageApiKey = env.CLOUDFLARE_API_TOKEN
        break
    }
  }
  
  // 验证必要的API密钥是否存在
  if (!enriched.textApiKey && !['test'].includes(enriched.textModelProvider)) {
    throw new Error(`Missing API key for text model provider: ${enriched.textModelProvider}. Please provide API key or configure environment variable.`)
  }
  
  if (!enriched.imageApiKey && !['unsplash', 'pollinations', 'test'].includes(enriched.imageModelProvider)) {
    throw new Error(`Missing API key for image model provider: ${enriched.imageModelProvider}. Please provide API key or configure environment variable.`)
  }
  
  return enriched
}

// 🔍 查询异步任务状态API
app.get('/api/jobs/:jobId', async (c) => {
  const jobId = c.req.param('jobId')
  
  try {
    // 从D1数据库获取任务详情
    const dbResult = await c.env.DB.prepare(`
      SELECT * FROM async_jobs WHERE id = ?
    `).bind(jobId).first()
    
    if (!dbResult) {
      return c.json({
        success: false,
        error: 'Job not found'
      }, 404)
    }
    
    // 从KV获取当前状态 (更实时)
    const kvStatus = await c.env.JOBS.get(jobId)
    const currentStatus = kvStatus ? JSON.parse(kvStatus) : null
    
    // 组合返回完整任务信息
    return c.json({
      success: true,
      jobId: jobId,
      status: dbResult.status,
      htmlStructure: dbResult.html_structure,
      finalHtml: currentStatus?.htmlStructure || dbResult.html_structure,
      images: currentStatus?.images || [],
      error: dbResult.error_message,
      createdAt: dbResult.created_at,
      updatedAt: dbResult.updated_at,
      completedAt: dbResult.completed_at
    })
    
  } catch (error) {
    console.error(`❌ Error fetching job ${jobId}:`, error.message)
    return c.json({
      success: false,
      error: 'Failed to fetch job status'
    }, 500)
  }
})

// 🔍 轮询友好的详细状态API - 包含完整三阶段进度 + 轮询触发处理
app.get('/api/jobs/:jobId/status', async (c) => {
  const jobId = c.req.param('jobId')
  
  try {
    // 增加安全检查
    if (!c.env || !c.env.JOBS) {
      console.error(`❌ [${jobId}] Environment not properly initialized`)
      return c.json({ success: false, error: 'Service temporarily unavailable' }, 503)
    }
    
    const kvStatus = await c.env.JOBS.get(jobId)
    if (!kvStatus) {
      return c.json({ success: false, error: 'Job not found' }, 404)
    }
    
    const status = JSON.parse(kvStatus)
    
    // 🚀 SMART TRIGGER: 智能自动触发 (防止重复执行)
    // 检查pending状态并确保不重复处理
    if (status.status === 'pending' && !status.processing) {
      console.log(`🔄 [${jobId}] SMART-TRIGGER: Detected pending job, starting processing immediately`)
      
      // 标记为正在处理，防止重复触发
      const processingStatus = { ...status, processing: true }
      await c.env.JOBS.put(jobId, JSON.stringify(processingStatus))
      
      try {
        // 从D1获取完整任务数据
        const dbResult = await c.env.DB.prepare(`
          SELECT * FROM async_jobs WHERE id = ?
        `).bind(jobId).first()
        
        if (dbResult && dbResult.request_data) {
          const requestData = JSON.parse(dbResult.request_data)
          
          // 增加安全检查
          if (!requestData.unifiedConfig || !requestData.unifiedConfig.image) {
            console.error(`❌ [${jobId}] Invalid request data structure`)
            return c.json({ success: false, error: 'Invalid job configuration' }, 400)
          }
          
          // 🚀 立即处理图片 (在状态查询时同步完成)
          const baseUrl = new URL(c.req.url).origin
          const updatedHtml = await processImagesSync(c.env, jobId, requestData, status.htmlStructure, baseUrl)
          
          // 更新为完成状态
          const completedStatus = {
            ...status,
            status: 'completed',
            currentStep: 3,
            progress: 100,
            htmlStructure: updatedHtml,
            steps: [
              { step: 1, name: '生成HTML结构', status: 'completed', progress: 33 },
              { step: 2, name: '正在生成图片', status: 'completed', progress: 66 },
              { step: 3, name: '优化HTML结构', status: 'completed', progress: 100 }
            ],
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }
          
          // 更新存储
          await c.env.JOBS.put(jobId, JSON.stringify(completedStatus))
          await c.env.DB.prepare(`
            UPDATE async_jobs SET 
            status = 'completed',
            html_structure = ?,
            completed_at = datetime('now'),
            updated_at = datetime('now')
            WHERE id = ?
          `).bind(updatedHtml, jobId).run()
          
          console.log(`✅ [${jobId}] AUTO-TRIGGER: Processing completed successfully`)
          
          // 直接返回完成状态
          return c.json({
            success: true,
            jobId,
            status: 'completed',
            currentStep: 3,
            steps: completedStatus.steps,
            progress: 100,
            htmlReady: true,
            finalHtml: updatedHtml,
            error: null,
            updatedAt: completedStatus.updatedAt
          })
        }
      } catch (processingError) {
        console.error(`❌ [${jobId}] SMART-TRIGGER failed:`, processingError.message)
        
        // 清除处理标记，重置为pending状态
        const resetStatus = { ...status, processing: false, error: processingError.message }
        await c.env.JOBS.put(jobId, JSON.stringify(resetStatus))
        // 失败时返回原状态，不影响正常轮询
      }
    }
    
    // 返回详细的三阶段进度信息
    return c.json({
      success: true,
      jobId,
      status: status.status,
      currentStep: status.currentStep || 1,
      steps: status.steps || [
        { step: 1, name: '生成HTML结构', status: 'completed', progress: 33 },
        { step: 2, name: '正在生成图片', status: 'pending', progress: 0 },
        { step: 3, name: '优化HTML结构', status: 'pending', progress: 0 }
      ],
      progress: status.progress || 33,
      htmlReady: !!status.htmlStructure,
      finalHtml: status.htmlStructure,
      error: status.error,
      updatedAt: status.updatedAt
    })
    
  } catch (error) {
    return c.json({ success: false, error: 'Status check failed' }, 500)
  }
})

// 🚀 手动触发图片处理API - 绕过Cloudflare Pages Functions后台处理限制
app.post('/api/jobs/:jobId/process', async (c) => {
  const jobId = c.req.param('jobId')
  
  try {
    console.log(`🔄 [${jobId}] Manual trigger: Starting image processing`)
    
    // 从KV获取当前状态
    const kvStatus = await c.env.JOBS.get(jobId)
    if (!kvStatus) {
      return c.json({ success: false, error: 'Job not found' }, 404)
    }
    
    const status = JSON.parse(kvStatus)
    
    // 检查是否已经完成
    if (status.status === 'completed') {
      return c.json({
        success: true,
        message: 'Job already completed',
        jobId,
        status: status.status,
        progress: status.progress,
        finalHtml: status.htmlStructure
      })
    }
    
    // 检查是否可以处理
    if (!status.htmlStructure) {
      return c.json({ success: false, error: 'HTML structure not ready' }, 400)
    }
    
    // 从D1获取完整任务数据
    const dbResult = await c.env.DB.prepare(`
      SELECT * FROM async_jobs WHERE id = ?
    `).bind(jobId).first()
    
    if (!dbResult || !dbResult.request_data) {
      return c.json({ success: false, error: 'Request data not found' }, 404)
    }
    
    const requestData = JSON.parse(dbResult.request_data)
    console.log(`📋 [${jobId}] Processing with providers:`, {
      text: requestData.unifiedConfig?.text?.provider,
      image: requestData.unifiedConfig?.image?.provider
    })
    
    // 立即启动图片处理
    const baseUrl = new URL(c.req.url).origin
    const updatedHtml = await processImagesSync(c.env, jobId, requestData, status.htmlStructure, baseUrl)
    
    // 更新完成状态
    const completedStatus = {
      ...status,
      status: 'completed',
      currentStep: 3,
      progress: 100,
      htmlStructure: updatedHtml,
      steps: [
        { step: 1, name: '生成HTML结构', status: 'completed', progress: 33 },
        { step: 2, name: '正在生成图片', status: 'completed', progress: 66 },
        { step: 3, name: '优化HTML结构', status: 'completed', progress: 100 }
      ],
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
    
    // 更新KV和D1状态
    await c.env.JOBS.put(jobId, JSON.stringify(completedStatus))
    await c.env.DB.prepare(`
      UPDATE async_jobs SET 
      status = 'completed',
      html_structure = ?,
      completed_at = datetime('now'),
      updated_at = datetime('now')
      WHERE id = ?
    `).bind(updatedHtml, jobId).run()
    
    console.log(`✅ [${jobId}] Image processing completed manually`)
    
    return c.json({
      success: true,
      message: 'Image processing completed',
      jobId,
      status: completedStatus.status,
      currentStep: completedStatus.currentStep,
      steps: completedStatus.steps,
      progress: completedStatus.progress,
      finalHtml: completedStatus.htmlStructure,
      updatedAt: completedStatus.updatedAt
    })
    
  } catch (error) {
    console.error(`❌ [${jobId}] Manual processing failed:`, error.message)
    return c.json({ 
      success: false, 
      error: 'Processing failed',
      details: error.message 
    }, 500)
  }
})

// Three-stage HTML generation with progress tracking
async function generateHTMLWithProgress(requestData: any): Promise<{ html: string; steps: any[] }> {
  const { userPrompt, advancedPrompt, pageConfig, unifiedConfig, outputLanguage = 'english' } = requestData
  const steps = []
  
  try {
    // 第一阶段：HTML结构生成
    console.log('🚀 Step 1/3: Starting HTML structure generation...')
    steps.push({ step: 1, name: '生成HTML结构', status: 'processing', progress: 10 })
    
    let html: string
    
    // Check if we're using test mode
    if (unifiedConfig.text.provider === 'test') {
      html = generateTestHTML(pageConfig)
      console.log('✅ Step 1/3: Using test HTML template')
      steps.push({ step: 1, name: '生成HTML结构', status: 'completed', progress: 33 })
    } else {
      // 使用专业提示词或构建增强提示词 (确保采纳用户自定义提示词)
      let enhancedPrompt
      if (advancedPrompt && advancedPrompt.trim().length > 0) {
        // 用户输入了专业提示词，直接使用并加强英文输出要求
        enhancedPrompt = `**CRITICAL: Generate ALL content in ENGLISH ONLY**\n\nUser's professional prompt: ${advancedPrompt}\n\n**MANDATORY ENGLISH OUTPUT REQUIREMENTS:**\n- Page title, headings, content: ALL in English\n- No Chinese characters in generated HTML\n- Alt text for images: English descriptions\n- Meta tags and SEO content: English only\n\n**Technical requirements still apply:**\n- Complete HTML5 structure with Tailwind CSS\n- Responsive design and SEO optimization\n- Use {{IMAGE_PLACEHOLDER_1}}, {{IMAGE_PLACEHOLDER_2}}, etc. for images`
        console.log('📝 Using user\'s advanced prompt with English enforcement')
      } else {
        // 使用默认的增强提示词
        enhancedPrompt = buildEnhancedPrompt(userPrompt, pageConfig, outputLanguage)
        console.log('📝 Using built-in enhanced prompt')
      }
      
      console.log('📝 Calling LLM model:', unifiedConfig.text.provider, unifiedConfig.text.model)
      
      // Call LLM model - 确保完整生成，不被图片处理打断
      const htmlResponse = await callLLMModelDirect(enhancedPrompt, unifiedConfig.text)
      console.log('📝 LLM Response length:', htmlResponse.length, 'characters')
      
      // Extract and process HTML
      html = extractHTML(htmlResponse)
      console.log('✅ Step 1/3: HTML structure generation completed')
      steps.push({ step: 1, name: '生成HTML结构', status: 'completed', progress: 33 })
    }
    
    // 验证HTML完整性
    if (!html || html.length < 100) {
      throw new Error('Generated HTML is too short or empty. Length: ' + (html?.length || 0))
    }
    
    // 第二阶段：图片生成与替换
    console.log('🖼️ Step 2/3: Starting image generation...')
    steps.push({ step: 2, name: '正在生成图片', status: 'processing', progress: 40 })
    
    const placeholders = html.match(/\{\{IMAGE_PLACEHOLDER_\d+\}\}/g) || []
    console.log('🖼️ Found', placeholders.length, 'image placeholders to process')
    
    if (placeholders.length > 0) {
      html = await processImagesInHTML(html, unifiedConfig.image)
      console.log('✅ Step 2/3: Image generation completed')
    } else {
      console.log('ℹ️ Step 2/3: No images to process, skipping')
    }
    steps.push({ step: 2, name: '正在生成图片', status: 'completed', progress: 66 })
    
    // 第三阶段：HTML优化与验证
    console.log('🔧 Step 3/3: Starting HTML optimization...')
    steps.push({ step: 3, name: '优化HTML结构', status: 'processing', progress: 80 })
    
    // Final HTML validation and fixes
    html = validateAndFixHTML(html)
    
    // 检查是否需要转换图片为base64格式
    if (requestData.convertImagesToBase64) {
      console.log('🖼️ Converting images to base64 format...')
      steps.push({ step: 4, name: '转换图片为base64格式', status: 'processing', progress: 90 })
      html = await convertImagesToBase64(html)
      steps.push({ step: 4, name: '转换图片为base64格式', status: 'completed', progress: 100 })
    }
    
    console.log('✅ Step 3/3: HTML optimization completed')
    steps.push({ step: 3, name: '优化HTML结构', status: 'completed', progress: 100 })
    
    console.log('🎉 All steps completed successfully!')
    return { html, steps }
    
  } catch (error) {
    const currentStep = steps.length + 1
    console.error(`❌ Generation failed at step ${currentStep}:`, {
      error: error.message,
      stack: error.stack,
      step: currentStep,
      modelConfig: modelConfig?.textModelProvider + '/' + modelConfig?.imageModelProvider
    })
    
    // 添加失败步骤到记录中
    const stepNames = ['验证输入', '生成HTML结构', '生成图片', '优化HTML结构', '转换图片格式']
    const stepName = stepNames[currentStep - 1] || '未知步骤'
    steps.push({ 
      step: currentStep, 
      name: stepName, 
      status: 'failed', 
      progress: Math.min(currentStep * 25, 100),
      error: error.message 
    })
    
    // 丰富错误信息
    const enrichedError = new Error(error.message || 'Generation failed')
    enrichedError.step = currentStep
    enrichedError.stepName = stepName
    enrichedError.steps = steps
    enrichedError.originalStack = error.stack
    
    throw enrichedError
  }
}

// 🚀 快速HTML结构生成 - 不处理图片，只生成框架
async function generateHTMLStructureOnly(requestData: any): Promise<string> {
  const { userPrompt, advancedPrompt, pageConfig, unifiedConfig, outputLanguage = 'english' } = requestData
  
  console.log('⚡ Generating HTML structure only (no images)')
  
  // 只执行HTML生成，跳过图片处理
  let html: string
  
  // Check if we're using test mode
  if (unifiedConfig.text.provider === 'test') {
    html = generateTestHTML(pageConfig)
    console.log('✅ Using test HTML template')
  } else {
    // 使用专业提示词或构建增强提示词 (确保采纳用户自定义提示词)
    let enhancedPrompt
    if (advancedPrompt && advancedPrompt.trim().length > 0) {
      // 用户输入了专业提示词，直接使用并加强英文输出要求
      enhancedPrompt = `**CRITICAL: Generate ALL content in ENGLISH ONLY**\n\nUser's professional prompt: ${advancedPrompt}\n\n**MANDATORY ENGLISH OUTPUT REQUIREMENTS:**\n- Page title, headings, content: ALL in English\n- No Chinese characters in generated HTML\n- Alt text for images: English descriptions\n- Meta tags and SEO content: English only\n\n**Technical requirements still apply:**\n- Complete HTML5 structure with Tailwind CSS\n- Responsive design and SEO optimization\n- Use {{IMAGE_PLACEHOLDER_1}}, {{IMAGE_PLACEHOLDER_2}}, etc. for images`
      console.log('📝 Using user\'s advanced prompt with English enforcement')
    } else {
      // 构建增强提示词
      enhancedPrompt = buildEnhancedPrompt(userPrompt, pageConfig, outputLanguage)
      console.log('🔧 Built enhanced prompt from user input')
    }
    
    // 调用LLM模型 (保持原有配置传递)
    console.log('🤖 Calling LLM model:', unifiedConfig.text.provider, unifiedConfig.text.model)
    const htmlResponse = await callLLMModelDirect(enhancedPrompt, unifiedConfig.text)
    
    // Extract and process HTML
    html = extractHTML(htmlResponse)
    console.log('✅ HTML structure generation completed')
  }
  
  // 验证HTML完整性
  if (!html || html.length < 100) {
    throw new Error('Generated HTML is too short or empty. Length: ' + (html?.length || 0))
  }
  
  // 最终优化但不处理图片
  html = validateAndFixHTML(html)
  
  console.log('🎉 HTML structure ready with image placeholders')
  return html
}

// 🔄 同步图片处理 - 轮询触发式，适配Cloudflare Pages Functions限制
async function processImagesSync(env: any, jobId: string, requestData: any, htmlStructure: string, baseUrl?: string): Promise<string> {
  console.log(`🖼️ [${jobId}] Starting sync image processing (polling triggered)`)
  
  try {
    // 找出所有图片占位符
    const placeholders = htmlStructure.match(/\{\{IMAGE_PLACEHOLDER_\d+\}\}/g) || []
    console.log(`🖼️ [${jobId}] Found ${placeholders.length} image placeholders to process`)
    
    if (placeholders.length === 0) {
      console.log(`🖼️ [${jobId}] No images to process, returning original HTML`)
      return htmlStructure
    }
    
    let processedHTML = htmlStructure
    
    // 🚀 优化的多图片处理 - 移除图片数量限制
    const maxImages = placeholders.length // 处理所有图片占位符，不再限制数量
    const processingPromises = [] // 并行处理提高速度
    
    console.log(`🖼️ [${jobId}] Processing ${maxImages} images (${placeholders.length} total found)`)
    
    for (let i = 0; i < maxImages; i++) {
      const placeholder = placeholders[i]
      const imageNumber = i + 1
      
      // 创建单个图片处理Promise
      const imageProcessingPromise = (async () => {
        try {
          // 提取alt文本作为图片描述
          const altMatch = htmlStructure.match(new RegExp(`${placeholder.replace(/[{}]/g, '\\$&')}.*?alt="([^"]*)"`, 'i'))
          const altText = altMatch ? altMatch[1] : `Image ${imageNumber}`
          
          console.log(`🖼️ [${jobId}] Processing image ${imageNumber}/${maxImages}: "${altText}"`)
          
          // 🎯 智能图片生成策略
          let imageUrl: string
          if (requestData.unifiedConfig?.testMode || requestData.unifiedConfig?.image?.provider === 'test') {
            // 测试模式 - 使用高质量占位图片
            imageUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(`${imageNumber}. ${altText.substring(0, 15)}`)}`
          } else {
            // 生产模式 - 实际API调用，带重试机制
            try {
              // 增加超时保护，适配Cloudflare免费版
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Image generation timeout')), 45000) // 45秒超时 - 给AI生成充足时间
              })
              
              imageUrl = await Promise.race([
                generateSingleImage(altText, requestData.unifiedConfig.image, undefined, env, jobId, i, baseUrl),
                timeoutPromise
              ]) as string
              
            } catch (apiError) {
              console.warn(`⚠️ [${jobId}] API generation failed for image ${imageNumber}: ${apiError.message}, trying Unsplash fallback`)
              
              // 第一层兜底：Unsplash 高质量图片
              try {
                imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(altText.substring(0, 30))}`
                console.log(`🔄 [${jobId}] Using Unsplash fallback for image ${imageNumber}`)
              } catch (unsplashError) {
                console.warn(`⚠️ [${jobId}] Unsplash fallback failed for image ${imageNumber}, trying Pollinations`)
                
                // 第二层兜底：Pollinations AI生成
                const description = encodeURIComponent(altText)
                const seed = Math.floor(Math.random() * 1000000)
                imageUrl = `https://image.pollinations.ai/prompt/${description}?width=800&height=600&seed=${seed}`
                console.log(`🔄 [${jobId}] Using Pollinations AI fallback for image ${imageNumber}`)
              }
            }
          }
          
          console.log(`✅ [${jobId}] Image ${imageNumber} completed: ${imageUrl.substring(0, 50)}...`)
          return { placeholder, imageUrl, success: true }
          
        } catch (error) {
          console.error(`❌ [${jobId}] Image ${imageNumber} failed:`, error.message)
          const fallbackUrl = `https://via.placeholder.com/800x600/EF4444/FFFFFF?text=${encodeURIComponent(`Error ${imageNumber}`)}`
          return { placeholder, imageUrl: fallbackUrl, success: false }
        }
      })()
      
      processingPromises.push(imageProcessingPromise)
    }
    
    // 🚀 等待所有图片处理完成 (并行处理，显著提升速度)
    const results = await Promise.all(processingPromises)
    
    // 应用所有图片替换
    for (const result of results) {
      processedHTML = processedHTML.replace(result.placeholder, result.imageUrl)
    }
    
    const successCount = results.filter(r => r.success).length
    console.log(`✅ [${jobId}] Image processing completed: ${successCount}/${maxImages} successful`)
    
    console.log(`✅ [${jobId}] Image processing completed, ${placeholders.length} images processed`)
    return processedHTML
    
  } catch (error) {
    console.error(`❌ [${jobId}] Image processing failed:`, error.message)
    return htmlStructure // 返回原始HTML作为降级方案
  }
}

// 🔄 后台异步图片处理 - 完整保持三阶段工作流和进度追踪 (保留用于参考)
async function processImagesAsync(env: any, jobId: string, requestData: any, htmlStructure: string): Promise<void> {
  console.log(`🖼️ [${jobId}] Starting async image processing with full progress tracking`)
  
  try {
    // 🔄 阶段2开始: 图片生成与替换 (40-66%)
    await updateJobStatus(env, jobId, 'processing')
    await updateJobProgress(env, jobId, 'processing', 2, '正在生成图片', 40, htmlStructure)
    
    // 找出所有图片占位符
    const placeholders = htmlStructure.match(/\{\{IMAGE_PLACEHOLDER_\d+\}\}/g) || []
    console.log(`🖼️ [${jobId}] Found ${placeholders.length} image placeholders to process`)
    
    if (placeholders.length === 0) {
      // 跳过图片处理，直接进入阶段3
      console.log(`🖼️ [${jobId}] No images to process, jumping to stage 3`)
      await processStage3(env, jobId, requestData, htmlStructure)
      return
    }
    
    // 🔒 使用增强的图片处理逻辑，包含进度更新
    let processedHTML = htmlStructure
    const totalImages = placeholders.length
    
    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i]
      const imageNumber = i + 1
      const progressPercent = Math.floor(40 + (i / totalImages) * 26) // 40-66%区间
      
      console.log(`🖼️ [${jobId}] Processing image ${imageNumber}/${totalImages}: ${placeholder}`)
      
      // 更新当前图片处理进度
      await updateJobProgress(env, jobId, 'processing', 2, `生成图片 ${imageNumber}/${totalImages}`, progressPercent, processedHTML)
      
      // 添加3秒延迟防止API限制 (保持原有逻辑)
      if (i > 0) {
        console.log(`🕰️ [${jobId}] Waiting 3 seconds before next image generation...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
      
      try {
        // 获取图片的alt文本和配置
        const altText = getImageAltText(processedHTML, placeholder)
        const aspectRatio = getImageAspectRatio(processedHTML, placeholder)
        
        // 使用原有的图片生成逻辑
        const imageUrl = await generateSingleImage(altText, requestData.unifiedConfig.image, aspectRatio, env, jobId, i)
        
        // 替换占位符
        processedHTML = processedHTML.replace(placeholder, imageUrl)
        
        console.log(`✅ [${jobId}] Image ${imageNumber} generated successfully`)
        
      } catch (imageError) {
        console.warn(`⚠️ [${jobId}] Image ${imageNumber} failed, using fallback:`, imageError.message)
        // 使用降级URL
        const fallbackUrl = `https://via.placeholder.com/400x300?text=Image+${imageNumber}`
        processedHTML = processedHTML.replace(placeholder, fallbackUrl)
      }
    }
    
    console.log(`✅ [${jobId}] Stage 2 completed: All images processed`)
    
    // 🔄 进入阶段3: HTML优化与验证
    await processStage3(env, jobId, requestData, processedHTML)
    
  } catch (error) {
    console.error(`❌ [${jobId}] Image processing failed:`, error.message)
    
    // 更新失败状态，但保留HTML框架
    await updateJobStatus(env, jobId, 'failed', error.message)
    await updateJobProgress(env, jobId, 'failed', 2, '图片处理失败', 66, htmlStructure, error.message)
  }
}

// 🔄 阶段3: HTML优化与验证 (80-100%)
async function processStage3(env: any, jobId: string, requestData: any, processedHTML: string): Promise<void> {
  console.log(`🔧 [${jobId}] Starting Stage 3: HTML optimization and validation`)
  
  try {
    // 更新阶段3开始
    await updateJobProgress(env, jobId, 'processing', 3, '优化HTML结构', 80, processedHTML)
    
    // HTML结构验证和修复 (保持原有逻辑)
    let finalHTML = validateAndFixHTML(processedHTML)
    await updateJobProgress(env, jobId, 'processing', 3, 'HTML验证完成', 90, finalHTML)
    
    // 可选的base64转换 (保持原有功能)
    if (requestData.convertImagesToBase64) {
      console.log(`🖼️ [${jobId}] Converting images to base64 format`)
      await updateJobProgress(env, jobId, 'processing', 3, '转换图片为base64格式', 95, finalHTML)
      finalHTML = await convertImagesToBase64(finalHTML)
    }
    
    // ✅ 完成所有处理
    await updateJobStatus(env, jobId, 'completed')
    await updateJobProgress(env, jobId, 'completed', 3, '生成完成', 100, finalHTML)
    
    console.log(`🎉 [${jobId}] All stages completed successfully`)
    
  } catch (error) {
    console.error(`❌ [${jobId}] Stage 3 failed:`, error.message)
    await updateJobStatus(env, jobId, 'failed', error.message)
    await updateJobProgress(env, jobId, 'failed', 3, 'HTML优化失败', 90, processedHTML, error.message)
  }
}

// 🔧 增强的进度更新函数 - 包含详细步骤信息
async function updateJobProgress(env: any, jobId: string, status: string, currentStep: number, stepName: string, progress: number, htmlContent: string, errorMessage?: string): Promise<void> {
  const steps = [
    { step: 1, name: '生成HTML结构', status: 'completed', progress: 33 },
    { step: 2, name: '正在生成图片', status: currentStep >= 2 ? status : 'pending', progress: currentStep >= 2 ? progress : 0 },
    { step: 3, name: '优化HTML结构', status: currentStep >= 3 ? status : 'pending', progress: currentStep >= 3 ? progress : 0 }
  ]
  
  // 设置当前步骤状态
  if (currentStep <= 3) {
    steps[currentStep - 1] = { step: currentStep, name: stepName, status: status, progress: progress }
  }
  
  // 更新KV存储
  await env.JOBS.put(jobId, JSON.stringify({
    status: status,
    currentStep: currentStep,
    steps: steps,
    htmlStructure: htmlContent,
    progress: progress,
    error: errorMessage,
    updatedAt: new Date().toISOString(),
    ...(status === 'completed' && { completedAt: new Date().toISOString() })
  }))
}

// 🎯 生成单个图片 - 保持原有的所有图片生成逻辑
async function generateSingleImage(altText: string, imageConfig: any, aspectRatio?: string, env?: any, jobId?: string, imageIndex?: number, baseUrl?: string): Promise<string> {
  const maxRetries = 2
  let retryCount = 0
  
  while (retryCount <= maxRetries) {
    try {
      let imageUrl: string
      
      // 使用原有的图片生成分发逻辑
      if (imageConfig.provider === 'dalle3') {
        imageUrl = await generateImageWithDALLE3(altText, imageConfig)
      } else if (imageConfig.provider === 'qwen-vl') {
        imageUrl = await generateImageWithQWENVL(altText, imageConfig)  
      } else if (imageConfig.provider === 'vertex-ai-imagen') {
        imageUrl = await generateImageWithVertexAI(altText, imageConfig)
      } else if (imageConfig.provider === 'chatgpt') {
        imageUrl = await generateImageWithChatGPT(altText, imageConfig)
      } else if (imageConfig.provider === 'nano-banana') {
        imageUrl = await generateImageWithNanoBanana(altText, imageConfig)
      } else if (imageConfig.provider === 'cloudflare-workers-ai') {
        imageUrl = await generateImageWithCloudflareWorkersAI(altText, imageConfig)
      } else if (imageConfig.provider === 'bytedance-jimeng') {
        imageUrl = await generateImageWithByteDanceJimeng(altText, imageConfig)
      } else if (imageConfig.provider === 'workai') {
        // 🆕 WorkAI提供者支持（临时使用降级选项，待实现）
        console.log('⚠️ WorkAI provider not implemented yet, using fallback')
        const query = encodeURIComponent(altText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50))
        imageUrl = `https://source.unsplash.com/800x600/?${query}`
      } else if (imageConfig.provider === 'unsplash') {
        // 使用Unsplash作为降级选项
        const query = encodeURIComponent(altText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50))
        imageUrl = `https://source.unsplash.com/800x600/?${query}`
      } else if (imageConfig.provider === 'pollinations') {
        // 使用Pollinations AI免费生成图片
        const description = encodeURIComponent(altText)
        const seed = Math.floor(Math.random() * 1000000)
        imageUrl = `https://image.pollinations.ai/prompt/${description}?width=800&height=600&seed=${seed}`
      } else {
        // 最终降级选项
        imageUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(altText.substring(0, 20))}`
      }
      
      // 🆕 WordPress兼容性转换（不影响现有逻辑）
      if (env && jobId && imageIndex !== undefined && needsWordPressConversion(imageUrl)) {
        console.log(`🔄 [WordPress] Converting image ${imageIndex + 1} to WordPress-compatible URL`)
        imageUrl = await convertToWordPressUrl(imageUrl, altText, jobId, imageIndex, env, baseUrl)
        console.log(`✅ [WordPress] Image ${imageIndex + 1} converted successfully`)
      }
      
      return imageUrl
      
    } catch (error) {
      retryCount++
      console.warn(`⚠️ Image generation attempt ${retryCount} failed:`, error.message)
      
      if (retryCount <= maxRetries) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      } else {
        // 多层兜底机制：Unsplash -> Pollinations -> Placeholder
        console.warn(`⚠️ All retries failed, using fallback sequence for: ${altText}`)
        
        try {
          // 第一层兜底：Unsplash
          const query = encodeURIComponent(altText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50))
          console.log(`🔄 Using Unsplash fallback`)
          let fallbackUrl = `https://source.unsplash.com/800x600/?${query}`
          
          // 对兜底URL也应用WordPress转换
          if (env && jobId && imageIndex !== undefined) {
            fallbackUrl = await convertToWordPressUrl(fallbackUrl, altText, jobId, imageIndex, env)
          }
          
          return fallbackUrl
        } catch (unsplashError) {
          try {
            // 第二层兜底：Pollinations
            const description = encodeURIComponent(altText)
            const seed = Math.floor(Math.random() * 1000000)
            console.log(`🔄 Using Pollinations AI fallback`)
            let fallbackUrl = `https://image.pollinations.ai/prompt/${description}?width=800&height=600&seed=${seed}`
            
            // 对兜底URL也应用WordPress转换
            if (env && jobId && imageIndex !== undefined) {
              fallbackUrl = await convertToWordPressUrl(fallbackUrl, altText, jobId, imageIndex, env)
            }
            
            return fallbackUrl
          } catch (pollinationsError) {
            // 最终兜底：占位符
            console.log(`🔄 Using placeholder fallback`)
            return `https://via.placeholder.com/800x600?text=Image+Generation+Failed`
          }
        }
      }
    }
  }
}

// 🔧 辅助函数：更新任务状态
async function updateJobStatus(env: any, jobId: string, status: string, errorMessage?: string): Promise<void> {
  await env.DB.prepare(`
    UPDATE async_jobs 
    SET status = ?, error_message = ?, updated_at = datetime('now'), completed_at = CASE WHEN ? IN ('completed', 'failed') THEN datetime('now') ELSE completed_at END
    WHERE id = ?
  `).bind(status, errorMessage || null, status, jobId).run()
}

// 🆕 WordPress兼容性转换辅助函数
/**
 * 生成语义化的图片文件名
 */
function generateImageFilename(jobId: string, imageIndex: number, altText: string): string {
  // 从alt文本生成语义化文件名
  const cleanAltText = altText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-')        // 空格转连字符
    .substring(0, 50)            // 限制长度
    .replace(/^-+|-+$/g, '')     // 移除开头和结尾的连字符
  
  // 如果清理后的文本为空，使用默认名称
  const safeName = cleanAltText || 'image'
  
  return `temp/${jobId}/${imageIndex}-${safeName}-${Date.now()}.jpg`
}

/**
 * 检查图片URL是否需要WordPress兼容性转换
 */
function needsWordPressConversion(imageUrl: string): boolean {
  // 🔧 修复：检查imageUrl是否为null、undefined或空字符串
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }
  
  return imageUrl.startsWith('data:image/') || 
         imageUrl.startsWith('blob:') ||
         imageUrl.includes('temp/') ||
         imageUrl.includes('oaidalleapiprodscus') // DALL-E临时URL
}

/**
 * Base64转Buffer
 */
function base64ToBuffer(base64Data: string): ArrayBuffer {
  // 🔧 修复：检查base64Data是否为null、undefined或空字符串
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('Invalid base64Data: must be a non-empty string')
  }
  
  // 提取base64数据部分（去除data:image/...;base64,前缀）
  const base64String = base64Data.split(',')[1] || base64Data
  
  if (!base64String) {
    throw new Error('Invalid base64Data: could not extract base64 content')
  }
  
  try {
    // 解码base64
    const binaryString = atob(base64String)
    const bytes = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return bytes.buffer
  } catch (error) {
    throw new Error(`Failed to decode base64Data: ${error.message}`)
  }
}

/**
 * 上传Base64图片到R2临时存储
 */
async function uploadBase64ToTempR2(env: any, base64Data: string, altText: string, jobId: string, imageIndex: number, baseUrl?: string): Promise<string> {
  try {
    const buffer = base64ToBuffer(base64Data)
    const filename = generateImageFilename(jobId, imageIndex, altText)
    
    console.log(`📤 [WordPress] Uploading image to R2: ${filename}`)
    
    // 上传到R2，6小时过期
    await env.R2.put(filename, buffer, {
      httpMetadata: { 
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=21600' // 6小时缓存
      },
      customMetadata: { 
        expiresAt: (Date.now() + 6 * 60 * 60 * 1000).toString(), // 6小时后过期
        altText: altText.substring(0, 100), // 保存alt文本用于调试
        jobId: jobId || 'unknown',
        imageIndex: imageIndex.toString(),
        uploadedAt: new Date().toISOString()
      }
    })
    
    // 构建公网访问URL - 使用应用代理绕过R2公开访问问题  
    const appBaseUrl = baseUrl || env.PAGES_URL || 'https://ai-html-generator-v9.pages.dev'
    const pathParts = filename.split('/')
    const jobIdPart = pathParts[1] // temp/JOB_ID/file.jpg -> JOB_ID
    const filenamePart = pathParts[2] // temp/JOB_ID/file.jpg -> file.jpg
    const publicUrl = `${appBaseUrl}/api/proxy/image/${jobIdPart}/${filenamePart}`
    
    console.log(`✅ [WordPress] Image uploaded successfully: ${publicUrl}`)
    return publicUrl
    
  } catch (error) {
    console.error(`❌ [WordPress] Failed to upload image to R2:`, error)
    // 降级到占位符
    return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent('Image Upload Failed')}`
  }
}

/**
 * 下载远程图片并重新上传到R2临时存储
 */
async function downloadAndUploadToTempR2(imageUrl: string, altText: string, jobId: string, imageIndex: number, env: any, baseUrl?: string): Promise<string> {
  try {
    console.log(`🔄 [WordPress] Downloading and re-uploading: ${imageUrl.substring(0, 100)}...`)
    
    // 下载远程图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'AI-HTML-Generator/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const filename = generateImageFilename(jobId, imageIndex, altText)
    
    // 上传到R2
    await env.R2.put(filename, arrayBuffer, {
      httpMetadata: { 
        contentType: response.headers.get('content-type') || 'image/jpeg',
        cacheControl: 'public, max-age=21600' // 6小时缓存
      },
      customMetadata: { 
        expiresAt: (Date.now() + 6 * 60 * 60 * 1000).toString(), // 6小时后过期
        altText: altText.substring(0, 100),
        jobId: jobId || 'unknown',
        imageIndex: imageIndex.toString(),
        originalUrl: imageUrl.substring(0, 200),
        uploadedAt: new Date().toISOString()
      }
    })
    
    // 构建公网访问URL - 使用应用代理
    const appBaseUrl = baseUrl || env.PAGES_URL || 'https://ai-html-generator-v9.pages.dev'
    const pathParts = filename.split('/')
    const jobIdPart = pathParts[1] // temp/JOB_ID/file.jpg -> JOB_ID  
    const filenamePart = pathParts[2] // temp/JOB_ID/file.jpg -> file.jpg
    const publicUrl = `${appBaseUrl}/api/proxy/image/${jobIdPart}/${filenamePart}`
    console.log(`✅ [WordPress] Image re-uploaded successfully: ${publicUrl}`)
    return publicUrl
    
  } catch (error) {
    console.error(`❌ [WordPress] Failed to download and re-upload image:`, error)
    // 降级：如果原URL是HTTP，直接返回；否则返回占位符
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent('Image Processing Failed')}`
  }
}

/**
 * WordPress兼容性转换主函数
 */
async function convertToWordPressUrl(imageUrl: string, altText: string, jobId: string, imageIndex: number, env: any, baseUrl?: string): Promise<string> {
  // 🔧 修复：检查imageUrl是否为null、undefined或空字符串
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.warn('⚠️ [WordPress] Invalid imageUrl provided, returning placeholder')
    return `https://via.placeholder.com/800x600?text=${encodeURIComponent('Image Not Available')}`
  }
  
  // 环境变量控制功能开关
  const WORDPRESS_COMPATIBILITY_ENABLED = env.WORDPRESS_COMPATIBILITY !== 'false'
  
  if (!WORDPRESS_COMPATIBILITY_ENABLED) {
    return imageUrl
  }
  
  if (imageUrl.startsWith('data:image/')) {
    // Base64 → R2临时存储
    return await uploadBase64ToTempR2(env, imageUrl, altText, jobId, imageIndex, baseUrl)
  }
  
  if (imageUrl.startsWith('blob:') || shouldMirrorUrl(imageUrl)) {
    // 不稳定URL → 下载并重新上传
    return await downloadAndUploadToTempR2(imageUrl, altText, jobId, imageIndex, env, baseUrl)
  }
  
  // 稳定的HTTP URL直接返回
  return imageUrl
}

/**
 * 判断URL是否应该被镜像到R2
 */
function shouldMirrorUrl(imageUrl: string): boolean {
  // 🔧 修复：检查imageUrl是否为null、undefined或空字符串
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }
  
  // DALL-E等服务的临时URL应该被镜像
  return imageUrl.includes('oaidalleapiprodscus') ||
         imageUrl.includes('temp/') ||
         imageUrl.includes('tempurl') ||
         imageUrl.startsWith('blob:')
}

// Backwards compatibility
async function generateHTMLDirect(requestData: any): Promise<string> {
  const result = await generateHTMLWithProgress(requestData)
  return result.html
}

// Test HTML template for image processing testing
function generateTestHTML(pageConfig: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageConfig.title || 'Test Page'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto p-8">
        <header class="text-center mb-12">
            <img src="{{IMAGE_PLACEHOLDER_1}}" alt="Company logo with modern design" class="mx-auto mb-4 w-32 h-32 rounded-lg">
            <h1 class="text-4xl font-bold text-gray-800">${pageConfig.title || 'About Our Company'}</h1>
        </header>
        
        <section class="grid md:grid-cols-2 gap-8 mb-12">
            <div>
                <h2 class="text-2xl font-semibold mb-4">Our Mission</h2>
                <p class="text-gray-600 leading-relaxed">We are dedicated to providing exceptional services and creating value for our customers through innovation and excellence.</p>
            </div>
            <div>
                <img src="{{IMAGE_PLACEHOLDER_2}}" alt="Professional team working together in modern office" class="w-full h-64 object-cover rounded-lg">
            </div>
        </section>
        
        <section class="text-center mb-12">
            <h2 class="text-2xl font-semibold mb-8">Our Values</h2>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-lg shadow">
                    <img src="{{IMAGE_PLACEHOLDER_3}}" alt="Innovation icon representing creativity and forward thinking" class="mx-auto mb-4 w-16 h-16 rounded">
                    <h3 class="font-semibold mb-2">Innovation</h3>
                    <p class="text-sm text-gray-600">Constantly pushing boundaries</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <img src="{{IMAGE_PLACEHOLDER_4}}" alt="Quality badge symbolizing excellence and reliability" class="mx-auto mb-4 w-16 h-16 rounded">
                    <h3 class="font-semibold mb-2">Quality</h3>
                    <p class="text-sm text-gray-600">Excellence in everything we do</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <img src="{{IMAGE_PLACEHOLDER_5}}" alt="Customer service representative helping clients with dedication" class="mx-auto mb-4 w-16 h-16 rounded">
                    <h3 class="font-semibold mb-2">Service</h3>
                    <p class="text-sm text-gray-600">Dedicated to customer success</p>
                </div>
            </div>
        </section>
    </div>
</body>
</html>`
}

function buildEnhancedPrompt(userPrompt: string, pageConfig: any, outputLanguage: string): string {
  return `You are a professional web developer. Generate a complete, modern, responsive HTML page based on the user requirements.

User Requirements (Chinese input, but generate English content): "${userPrompt}"

**📝 CRITICAL ENGLISH-ONLY OUTPUT REQUIREMENTS:**
⚠️ **MANDATORY: Generate ALL content in ENGLISH ONLY**
⚠️ **NO Chinese characters allowed in any part of the HTML**
⚠️ **Examples:**
   - Page title: "Professional Business Solutions" (NOT "专业商业解决方案")
   - Headings: "Our Services" (NOT "我们的服务")
   - Buttons: "Contact Us" (NOT "联系我们")
   - Alt text: "Professional team meeting" (NOT "专业团队会议")

**ENGLISH CONTENT MUST INCLUDE:**
- Page title and meta descriptions
- All headings and text content  
- Button labels and navigation items
- Alt text for images
- Any placeholder text

Page Configuration:
- Title: ${pageConfig.title}
- Type: ${pageConfig.pageType}
- Theme Color: ${pageConfig.themeColor}

Technical Requirements:
1. Complete HTML5 structure with DOCTYPE
2. Responsive design using Tailwind CSS ONLY (no custom CSS)
3. Mobile-first approach: sm: md: lg: xl: breakpoints
4. Complete SEO optimization:
   - <title>, <meta description>, <meta keywords>
   - Open Graph tags (og:title, og:description, og:image, og:url)
   - Twitter Card tags
   - Proper HTML5 semantic tags (header, nav, main, section, article, footer)

5. Intelligent Schema.org structured data (JSON-LD format in <head>):
   - Analyze content and add relevant schemas
   - FAQPage for Q&A content
   - Product/Service for business offerings
   - Organization for contact info
   - HowTo for step-by-step guides
   - Article for blog content

6. Image placeholders: Use {{IMAGE_PLACEHOLDER_1}}, {{IMAGE_PLACEHOLDER_2}}, etc.
7. All images must have descriptive English alt attributes
8. Professional, modern design with proper spacing and typography
9. Include Tailwind CSS from CDN: <script src="https://cdn.tailwindcss.com"></script>

Content Guidelines:
- Create realistic, professional English content (no Lorem ipsum)
- Use proper English grammar and vocabulary
- Include relevant sections based on page type
- Add interactive elements where appropriate
- Ensure content matches the theme color

Generate complete HTML code:`
}

async function callLLMModelDirect(prompt: string, textConfig: any): Promise<string> {
  const { provider, model, apiKey, baseUrl, customModelName } = textConfig
  
  // 优先尝试使用SDK（如果可用且已配置）
  if (typeof window !== 'undefined' && window.sdkStatus) {
    try {
      console.log('🚀 Attempting to use SDK for text generation...')
      
      // 检查SDK是否可用于当前提供商
      let sdkProvider = null
      if (provider === 'openai' && window.sdkStatus.openai) {
        sdkProvider = 'openai'
      } else if (provider === 'claude' && window.sdkStatus.anthropic) {
        sdkProvider = 'anthropic'
      } else if (provider === 'gemini' && window.sdkStatus.google) {
        sdkProvider = 'google'
      }
      
      if (sdkProvider) {
        console.log(`📡 Using ${sdkProvider} SDK for generation`)
        const result = await fetch('/api/sdk/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            prompt, 
            provider: sdkProvider,
            model: model 
          })
        })
        
        const response = await result.json()
        if (response.success) {
          console.log('✅ SDK generation successful')
          return response.data.content
        } else {
          console.warn('⚠️ SDK generation failed, falling back to direct API:', response.error)
        }
      }
    } catch (error) {
      console.warn('⚠️ SDK generation error, falling back to direct API:', error)
    }
  }
  
  // 降级到直接API调用
  console.log('📡 Using direct API call for text generation')
  
  let baseURL: string
  let headers: Record<string, string>
  let requestBody: any
  
  // Configure API based on provider
  switch (provider) {
    case 'qwen3':
      baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      headers = {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.7
      }
      console.log('QWEN3 API call:', { baseURL, model })
      break
      
    case 'qwen3-new':
      // QWEN3新版本 - 使用OpenAI协议
      baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      headers = {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.7,
        stream: false
      }
      console.log('QWEN3-NEW API call:', { baseURL, model })
      break
      
    case 'claude':
      baseURL = 'https://api.anthropic.com/v1/messages'
      headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: model,
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }]
      }
      console.log('Claude API call:', { baseURL, model })
      break
      
    case 'openai':
      baseURL = 'https://api.openai.com/v1/chat/completions'
      headers = {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.7
      }
      console.log('OpenAI API call:', { baseURL, model })
      break
      
    case 'gemini':
      // Gemini API implementation - 确保模型名称格式正确
      if (!model || typeof model !== 'string') {
        throw new Error('Gemini model name is required but not provided')
      }
      const geminiModelName = model.startsWith('models/') ? model : ('models/' + model)
      baseURL = 'https://generativelanguage.googleapis.com/v1beta/' + geminiModelName + ':generateContent?key=' + apiKey
      headers = {
        'Content-Type': 'application/json'
      }
      requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 8192,  // 增加最大输出长度，防止截断
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          candidateCount: 1,
          stopSequences: []  // 不设置停止序列，避免意外截断
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }
      console.log('Gemini API call:', { baseURL, requestBody })
      break
      
    case 'custom-openai':
      baseURL = baseUrl + '/chat/completions'
      headers = {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: customModelName || model,  // 优先使用自定义模型名，回退到选择的模型
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.7
      }
      console.log('Custom OpenAI API call:', { baseURL, model: customModelName || model })
      break
      
    case 'nano-banana':
      // Nano Banana API - 兼容OpenAI格式
      baseURL = baseUrl || 'https://api.nanobananaio.com/v1/chat/completions'
      headers = {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
      requestBody = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.7
      }
      console.log('Nano Banana API call:', { baseURL, model })
      break
      
    default:
      throw new Error('Unsupported text model provider: ' + provider)
  }
  
  try {
    const response = await fetch(baseURL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API call failed:', { status: response.status, statusText: response.statusText, body: errorText })
      throw new Error('API call failed: ' + response.status + ' ' + response.statusText + ' - ' + errorText)
    }
    
    const data = await response.json()
    
    // Extract response based on provider with error checking
    console.log('API Response data:', data)
    
    switch (provider) {
      case 'claude':
        if (data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text
        }
        throw new Error('Invalid Claude API response format')
      case 'gemini':
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          return data.candidates[0].content.parts[0].text
        }
        throw new Error('Invalid Gemini API response format')
      default:
        // OpenAI, QWEN3, Custom OpenAI format
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          return data.choices[0].message.content
        }
        throw new Error('Invalid API response format')
    }
  } catch (error) {
    console.error('LLM API call failed:', {
      provider: provider,
      model: model,
      error: error.message,
      stack: error.stack
    })
    
    // 提供更友好的错误信息
    let userMessage = error.message
    if (error.message?.includes('401')) {
      userMessage = `API密钥无效或已过期 (${provider})`
    } else if (error.message?.includes('429')) {
      userMessage = `API调用频率超限，请稍后重试 (${provider})`
    } else if (error.message?.includes('timeout')) {
      userMessage = `API调用超时，请重试 (${provider})`
    } else if (error.message?.includes('network')) {
      userMessage = `网络连接失败，请检查网络 (${provider})`
    }
    
    const enhancedError = new Error(userMessage)
    enhancedError.originalError = error
    enhancedError.provider = provider
    enhancedError.model = model
    throw enhancedError
  }
}

function extractHTML(response: string): string {
  // Extract HTML code blocks
  const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/) || 
                   response.match(/```\n([\s\S]*?)\n```/) ||
                   response.match(/<html[\s\S]*?<\/html>/i)
  
  if (htmlMatch) {
    return htmlMatch[1] || htmlMatch[0]
  }
  
  // If no code block found, try to extract complete HTML
  const docMatch = response.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i)
  if (docMatch) {
    return docMatch[0]
  }
  
  // Last attempt to extract any HTML
  return response.trim()
}

async function processImagesInHTML(html: string, imageConfig: any): Promise<string> {
  // Find all image placeholders
  const placeholders = html.match(/\{\{IMAGE_PLACEHOLDER_\d+\}\}/g) || []
  
  if (placeholders.length === 0) {
    console.log('No image placeholders found in HTML')
    return html
  }
  
  console.log('Found ' + placeholders.length + ' image placeholders:', placeholders)
  
  // Process each image individually with rate limiting for better results
  let processedHTML = html
  
  for (let i = 0; i < placeholders.length; i++) {
    const placeholder = placeholders[i]
    const imageNumber = i + 1
    const aspectRatio = getImageAspectRatio(html, placeholder)
    const altText = getImageAltText(html, placeholder)
    
    console.log('Processing image ' + imageNumber + ':', { placeholder, aspectRatio, altText })
    
    // 添加图片间延迟，防止API限制
    if (i > 0) {
      console.log('🕰️ Waiting 3 seconds before next image generation to avoid rate limits...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    let imageUrl: string
    let retryCount = 0
    const maxRetries = 2
    
    // 重试机制
    while (retryCount <= maxRetries) {
      try {
      // Generate image based on provider
      if (imageConfig.v2Provider) {
        // ✨ V2 API Enhanced Image Generation
        console.log('🚀 Using V2 API for image generation:', imageConfig.v2Provider)
        imageUrl = await generateImageWithV2API(altText, imageConfig)
      } else if (imageConfig.provider === 'dalle3') {
        // DALL-E 3 API call
        imageUrl = await generateImageWithDALLE3(altText, imageConfig)
      } else if (imageConfig.provider === 'qwen-vl') {
        // QWEN-VL API call
        imageUrl = await generateImageWithQWENVL(altText, imageConfig)
      } else if (imageConfig.provider === 'qwen-image') {
        // QWEN图片生成 API call
        imageUrl = await generateImageWithQWENImage(altText, imageConfig)
      } else if (imageConfig.provider === 'wanx-v1') {
        // WanX-V1 API call
        imageUrl = await generateImageWithWanX(altText, imageConfig)
      } else if (imageConfig.provider === 'vertex-ai-imagen') {
        // Vertex AI Imagen API call
        imageUrl = await generateImageWithVertexAI(altText, imageConfig)
      } else if (imageConfig.provider === 'chatgpt') {
        // ChatGPT API call
        imageUrl = await generateImageWithChatGPT(altText, imageConfig)
      } else if (imageConfig.provider === 'gemini-imagen') {
        // Gemini Imagen API call
        imageUrl = await generateImageWithGeminiImagen(altText, imageConfig)
      } else if (imageConfig.provider === 'nano-banana') {
        // Nano Banana (Gemini 2.5 Flash Image) API call
        imageUrl = await generateImageWithNanoBanana(altText, imageConfig)
      } else if (imageConfig.provider === 'imagen-4') {
        // Imagen 4 API call
        imageUrl = await generateImageWithImagen4(altText, imageConfig)
      } else if (imageConfig.provider === 'openai-compatible') {
        // Custom OpenAI compatible API
        imageUrl = await generateImageWithCustomAPI(altText, imageConfig)
      } else if (imageConfig.provider === 'cloudflare-workers-ai') {
        // Cloudflare Workers AI API call
        imageUrl = await generateImageWithCloudflareWorkersAI(altText, imageConfig)
      } else if (imageConfig.provider === 'unsplash') {
        // Use Unsplash for free high-quality images
        const keywords = extractKeywordsFromAlt(altText)
        const dimensions = getImageDimensions(aspectRatio)
        imageUrl = 'https://source.unsplash.com/' + dimensions.width + 'x' + dimensions.height + '/?' + encodeURIComponent(keywords.join(','))
      } else if (imageConfig.provider === 'pollinations') {
        // Use Pollinations AI for free generated images with rate limiting
        const description = encodeURIComponent(altText || ('Professional website image ' + imageNumber))
        const dimensions = getImageDimensions(aspectRatio)
        imageUrl = 'https://image.pollinations.ai/prompt/' + description + '?width=' + dimensions.width + '&height=' + dimensions.height + '&seed=' + Math.floor(Math.random() * 1000000)
        
        // Pollinations需要额外5秒延迟防止频率限制 (1请求/5秒)
        if (placeholders.length > 1) {
          console.log('🚫 Pollinations rate limit: waiting additional 5 seconds...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      } else if (imageConfig.provider === 'workai') {
        // 🆕 WorkAI提供者支持（临时使用降级选项，待实现）
        console.log('⚠️ WorkAI provider not implemented yet in processImagesInHTML, using fallback')
        const query = encodeURIComponent(altText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50))
        imageUrl = `https://source.unsplash.com/800x600/?${query}`
      } else {
        // Fallback to placeholder service
        const dimensions = getImageDimensions(aspectRatio)
        imageUrl = 'https://via.placeholder.com/' + dimensions.width + 'x' + dimensions.height + '/3B82F6/FFFFFF?text=' + encodeURIComponent(altText || 'Image ' + imageNumber)
      }
      
        console.log('Generated image URL for placeholder ' + placeholder + ':', imageUrl)
        break // 成功生成，退出重试循环
        
      } catch (error) {
        retryCount++
        console.error(`Failed to generate image for placeholder ${placeholder} (attempt ${retryCount}/${maxRetries + 1}):`, error)
        
        if (retryCount <= maxRetries) {
          console.log(`🔁 Retrying image generation in 2 seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          // 多层兜底机制：Unsplash -> Pollinations -> Placeholder
          console.log('⚠️ All retries failed, using fallback sequence for:', altText)
          
          try {
            // 第一层兜底：Unsplash
            const query = altText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50)
            const dimensions = getImageDimensions(aspectRatio)
            console.log(`🔄 Using Unsplash fallback`)
            imageUrl = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${encodeURIComponent(query)}`
          } catch (unsplashError) {
            try {
              // 第二层兜底：Pollinations
              const description = encodeURIComponent(altText)
              const dimensions = getImageDimensions(aspectRatio)
              const seed = Math.floor(Math.random() * 1000000)
              console.log(`🔄 Using Pollinations AI fallback`)
              imageUrl = `https://image.pollinations.ai/prompt/${description}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}`
            } catch (pollinationsError) {
              // 最终兜底：占位符
              console.log(`🔄 Using placeholder fallback`)
              const dimensions = getImageDimensions(aspectRatio)
              imageUrl = `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/FF6B6B/FFFFFF?text=Image+Generation+Failed`
            }
          }
        }
      }
    }
    
    // Replace the placeholder with the actual image URL
    processedHTML = processedHTML.replace(placeholder, imageUrl)
  }
  
  console.log('Image processing completed')
  return processedHTML
}

function getImageAspectRatio(html: string, placeholder: string): string {
  // 修复：使用正确的换行符分割
  const lines = html.split('\n')
  const placeholderLine = lines.find(line => line.includes(placeholder))
  
  console.log('Analyzing aspect ratio for placeholder:', placeholder, 'line:', placeholderLine)
  
  if (!placeholderLine) return '16:9'
  
  // Analyze classes to determine aspect ratio
  if (placeholderLine.includes('aspect-square') || placeholderLine.includes('w-32 h-32') || placeholderLine.includes('rounded-full')) {
    return '1:1'
  } else if (placeholderLine.includes('aspect-video')) {
    return '16:9'
  } else if (placeholderLine.includes('aspect-[4/3]')) {
    return '4:3'
  }
  
  return '16:9' // default
}

function getImageAltText(html: string, placeholder: string): string {
  // 修复：使用正确的换行符分割
  const lines = html.split('\n')
  const placeholderLine = lines.find(line => line.includes(placeholder))
  
  console.log('Extracting alt text for placeholder:', placeholder, 'line:', placeholderLine)
  
  if (!placeholderLine) return 'Professional website image'
  
  // 更强大的alt文本提取
  const altMatch = placeholderLine.match(/alt=["']([^"']+)["']/) || 
                  placeholderLine.match(/alt=([^\s>]+)/)
  
  const altText = altMatch ? altMatch[1] : 'Professional website image'
  console.log('Extracted alt text:', altText)
  
  return altText
}

function extractKeywordsFromAlt(alt: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']
  return alt.toLowerCase()
    .split(/[\s,!?.-]+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3)
}

function getImageDimensions(aspectRatio: string): { width: number; height: number } {
  const ratios = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1200, height: 675 },
    '4:3': { width: 1000, height: 750 },
    '3:4': { width: 750, height: 1000 }
  }
  
  return ratios[aspectRatio] || ratios['16:9']
}

// DALL-E 3 图片生成
async function generateImageWithDALLE3(altText: string, imageConfig: any): Promise<string> {
  const { apiKey } = imageConfig
  
  if (!apiKey) {
    throw new Error('DALL-E 3 requires API key')
  }
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: altText + ', high quality, professional, clean design',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error('DALL-E 3 API call failed: ' + response.status + ' - ' + errorText)
  }
  
  const data = await response.json()
  if (data.data && data.data[0] && data.data[0].url) {
    return data.data[0].url
  }
  
  throw new Error('Invalid DALL-E 3 response format')
}

// ChatGPT 图片生成 (gpt-image-1, dall-e-2, dall-e-3)
async function generateImageWithChatGPT(altText: string, imageConfig: any): Promise<string> {
  // 使用统一配置中的 chatGPT 配置
  const config = imageConfig.chatGPT || {}
  
  const apiKey = imageConfig.apiKey || config.apiKey
  if (!apiKey) {
    throw new Error('ChatGPT requires API key. Please configure it in the ChatGPT modal.')
  }
  
  const model = imageConfig.model || config.model || 'gpt-image-1'
  const size = config.size || 'auto'
  const quality = config.quality || 'auto' 
  const format = config.format || 'png'
  const n = parseInt(config.n) || 1
  const background = config.background || 'opaque'
  const compression = config.compression ? parseInt(config.compression) : null
  
  // 构建请求参数
  const requestBody = {
    model: model,
    prompt: altText + ', high quality, professional, clean design',
    n: model === 'dall-e-3' ? 1 : n, // dall-e-3 固定为1
  }
  
  // 根据模型添加对应参数
  if (model === 'gpt-image-1') {
    // gpt-image-1 参数
    requestBody.size = size
    requestBody.quality = quality
    requestBody.format = format
    requestBody.response_format = 'b64_json' // gpt-image-1 默认返回base64
    
    if (background === 'transparent' && (format === 'png' || format === 'webp')) {
      requestBody.background = 'transparent'
    }
    
    if ((format === 'jpeg' || format === 'webp') && compression !== null) {
      requestBody.output_compression = compression
    }
    
  } else if (model === 'dall-e-2') {
    // dall-e-2 参数
    requestBody.size = size === 'auto' ? '1024x1024' : size
    requestBody.response_format = config.format === 'b64_json' ? 'b64_json' : 'url'
    
  } else if (model === 'dall-e-3') {
    // dall-e-3 参数  
    requestBody.size = size === 'auto' ? '1024x1024' : size
    requestBody.quality = quality === 'auto' ? 'standard' : quality
    requestBody.response_format = config.format === 'b64_json' ? 'b64_json' : 'url'
  }
  
  console.log('ChatGPT API request:', { model, requestBody })
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('ChatGPT API error:', response.status, errorText)
    throw new Error(`ChatGPT API call failed: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  console.log('ChatGPT API response:', data)
  
  // 处理响应
  if (data.data && data.data[0]) {
    const imageData = data.data[0]
    
    if (imageData.b64_json) {
      // 返回base64格式 (主要用于gpt-image-1)
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                     format === 'webp' ? 'image/webp' : 'image/png'
      return `data:${mimeType};base64,${imageData.b64_json}`
    } else if (imageData.url) {
      // 返回URL格式 (主要用于dall-e-2, dall-e-3)
      return imageData.url
    }
  }
  
  throw new Error('Invalid ChatGPT response format')
}

// QWEN-VL 图片生成
async function generateImageWithQWENVL(altText: string, imageConfig: any): Promise<string> {
  const { apiKey, model } = imageConfig
  
  if (!apiKey) {
    throw new Error('QWEN-VL requires API key')
  }
  
  // QWEN-VL 文生图API调用 - 修夏模型名称
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'qwen-vl-plus',  // 修复：使用正确的QWEN-VL模型名
      input: {
        prompt: altText + ', high quality, professional, clean design'
      },
      parameters: {
        style: 'photography',  // 修夏：移除角括号
        size: '1024*1024',
        n: 1
      }
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error('QWEN-VL API call failed: ' + response.status + ' - ' + errorText)
  }
  
  const data = await response.json()
  if (data.output && data.output.results && data.output.results[0] && data.output.results[0].url) {
    return data.output.results[0].url
  }
  
  throw new Error('Invalid QWEN-VL response format')
}

// Vertex AI Imagen 图片生成 (官方API) - 使用弹窗配置
async function generateImageWithVertexAI(altText: string, imageConfig: any): Promise<string> {
  console.log('🎨 Generating image with Vertex AI Imagen...', altText.substring(0, 50));
  
  // 使用统一配置中的 vertexAI 配置
  const vertexConfig = imageConfig.vertexAI || {};
  
  if (!vertexConfig.projectId || !vertexConfig.accessToken) {
    throw new Error('Vertex AI 配置不完整。请点击图像模型选择"Vertex AI Imagen"重新配置。');
  }
  
  // 构建请求数据 - 使用弹窗保存的配置
  const requestData = {
    model: vertexConfig.model || 'imagen-4.0-generate-001',
    prompt: altText,
    projectId: vertexConfig.projectId,
    location: vertexConfig.location || 'us-central1',
    accessToken: vertexConfig.accessToken,
    sampleCount: vertexConfig.sampleCount || 1,
    aspectRatio: vertexConfig.aspectRatio || '1:1',
    addWatermark: vertexConfig.seed ? false : (vertexConfig.addWatermark !== false), // 使用seed时必须禁用水印
    enhancePrompt: vertexConfig.enhancePrompt !== false,
    includeRaiReason: vertexConfig.includeRaiReason || false,
    includeSafetyAttributes: vertexConfig.includeSafetyAttributes || false,
    mimeType: vertexConfig.mimeType || 'image/png',
    personGeneration: vertexConfig.personGeneration || 'allow_adult',
    safetySetting: vertexConfig.safetySetting || 'block_medium_and_above'
  };
  
  // 添加可选参数
  if (vertexConfig.mimeType === 'image/jpeg' && vertexConfig.compressionQuality) {
    requestData.compressionQuality = parseInt(vertexConfig.compressionQuality);
  }
  
  if (vertexConfig.seed) {
    requestData.seed = vertexConfig.seed;
  }
  
  console.log('Vertex AI request params:', {
    model: requestData.model,
    prompt: requestData.prompt.substring(0, 100),
    projectId: requestData.projectId,
    location: requestData.location,
    sampleCount: requestData.sampleCount,
    aspectRatio: requestData.aspectRatio
  });
  
  try {
    // 调用后端API
    const response = await fetch('/api/image-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI API error:', errorText);
      throw new Error('HTTP ' + response.status + ': ' + response.statusText + ' - ' + errorText);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Vertex AI generation failed');
    }
    
    if (!result.data || !result.data.images || result.data.images.length === 0) {
      throw new Error('No images returned from Vertex AI');
    }
    
    // 获取第一张图片
    const image = result.data.images[0];
    
    // 如果有增强后的提示词，显示给用户
    if (result.data.enhancedPrompt) {
      console.log('📝 Enhanced prompt:', result.data.enhancedPrompt);
    }
    
    // 返回dataUrl（data:image/...;base64,...）或转换base64
    if (image.dataUrl) {
      return image.dataUrl;
    } else if (image.bytesBase64) {
      return 'data:' + (image.mimeType || 'image/png') + ';base64,' + image.bytesBase64;
    } else {
      throw new Error('Invalid image format in Vertex AI response');
    }
    
  } catch (error) {
    console.error('Vertex AI Imagen generation error:', error);
    throw new Error('Vertex AI generation failed: ' + (error.message || 'Unknown error'));
  }
}

// Gemini Imagen 图片生成
async function generateImageWithGeminiImagen(altText: string, imageConfig: any): Promise<string> {
  const { apiKey, model } = imageConfig
  
  if (!apiKey) {
    throw new Error('Gemini Imagen requires API key')
  }
  
  // 使用 Gemini 的图片生成API（如果有的话）
  // 注意：Gemini 可能没有直接的图片生成API，这里提供框架
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + (model || 'imagen-3') + ':generateImage?key=' + apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: {
        text: altText + ', high quality, professional, clean design'
      },
      imageGenerationConfig: {
        aspectRatio: '1:1',
        negativePrompt: 'low quality, blurry, distorted'
      }
    })
  })
  
  if (!response.ok) {
    // 获取错误响应内容
    const errorText = await response.text()
    const errorMsg = `Gemini Imagen API调用失败 - HTTP ${response.status}: ${response.statusText}\n响应内容: ${errorText.substring(0, 200)}...`
    console.warn(errorMsg)
    console.warn('🔄 使用免费Pollinations服务兤底')
    
    const description = encodeURIComponent(altText)
    return 'https://image.pollinations.ai/prompt/' + description + '?width=800&height=800&seed=' + Math.floor(Math.random() * 1000000)
  }
  
  const data = await response.json()
  // 处理Gemini Imagen响应格式
  if (data.candidates && data.candidates[0] && data.candidates[0].imageUrl) {
    return data.candidates[0].imageUrl
  }
  
  throw new Error('Invalid Gemini Imagen response format')
}

// Nano Banana (Gemini 2.5 Flash Image) 图片生成 - 使用新的配置系统
async function generateImageWithNanoBanana(altText: string, imageConfig: any): Promise<string> {
  console.log('🍌 [Nano Banana] Starting image generation for:', altText.substring(0, 50));
  console.log('🔍 [Nano Banana] Environment info:', {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
    origin: typeof window !== 'undefined' ? window.location.origin : 'server-side',
    timestamp: new Date().toISOString()
  });
  
  // 使用统一配置中的 nanoBanana 配置
  let nanoBananaConfig: NanoBananaConfig;
  
  // 🔧 修复：改进配置获取逻辑，支持多种配置结构
  console.log('🔍 [Nano Banana] Debug imageConfig structure:', {
    hasNanoBanana: !!imageConfig.nanoBanana,
    hasApiKey: !!imageConfig.apiKey,
    hasProvider: imageConfig.provider,
    configKeys: Object.keys(imageConfig),
    fullConfig: imageConfig
  });
  
  if (imageConfig.nanoBanana) {
    // 使用统一配置中的完整配置
    nanoBananaConfig = {
      apiKey: imageConfig.nanoBanana.apiKey || imageConfig.apiKey,
      basePromptStyle: imageConfig.nanoBanana.basePromptStyle || '',
      styleEnhancement: imageConfig.nanoBanana.styleEnhancement || '',
      outputFormat: imageConfig.outputFormat || imageConfig.nanoBanana.outputFormat || 'base64' // 🔧 修复：添加输出格式支持
    };
  } else {
    // 降级到基本配置（使用 apiKey）
    // 尝试从多个可能的位置获取API key
    const apiKey = imageConfig.apiKey || imageConfig.key || imageConfig.token;
    if (!apiKey) {
      console.error('❌ [Nano Banana] No API key found in imageConfig:', imageConfig);
      throw new Error('Nano Banana requires API key. Please configure it in the modal or check your configuration.');
    }
    nanoBananaConfig = {
      apiKey: apiKey,
      basePromptStyle: '',
      styleEnhancement: '',
      outputFormat: imageConfig.outputFormat || 'base64' // 🔧 修复：添加输出格式支持
    };
  }
  
  // 验证配置
  const validation = NanoBananaService.validateConfig(nanoBananaConfig);
  if (!validation.valid) {
    throw new Error(`Nano Banana configuration error: ${validation.error}`);
  }
  
  // 调用服务生成图片
  try {
    console.log('🚀 [Nano Banana] Calling NanoBananaService.generateImage...');
    const result = await NanoBananaService.generateImage(altText, nanoBananaConfig);
    console.log('✅ [Nano Banana] Successfully generated image, URL length:', result?.length || 0);
    return result;
  } catch (error) {
    console.error('❌ [Nano Banana] Service call failed:', {
      error: error.message,
      stack: error.stack,
      config: {
        hasApiKey: !!nanoBananaConfig.apiKey,
        apiKeyLength: nanoBananaConfig.apiKey?.length || 0,
        outputFormat: nanoBananaConfig.outputFormat
      }
    });
    throw error;
  }
}

// Cloudflare Workers AI 图片生成
async function generateImageWithCloudflareWorkersAI(altText: string, imageConfig: any): Promise<string> {
  console.log('☁️ [Cloudflare Workers AI] Starting image generation for:', altText.substring(0, 50));
  
  // 获取配置
  let cloudflareConfig;
  
  if (imageConfig.cloudflareWorkersAI) {
    // 使用统一配置中的完整配置
    cloudflareConfig = {
      apiKey: imageConfig.apiKey || imageConfig.cloudflareWorkersAI.apiKey,
      accountId: imageConfig.cloudflareWorkersAI.accountId,
      model: imageConfig.cloudflareWorkersAI.model || '@cf/bytedance/stable-diffusion-xl-lightning',
      steps: imageConfig.cloudflareWorkersAI.steps || 20,
      guidance: imageConfig.cloudflareWorkersAI.guidance || 7.5,
      width: imageConfig.cloudflareWorkersAI.width || 1024,
      height: imageConfig.cloudflareWorkersAI.height || 1024,
      negativePrompt: imageConfig.cloudflareWorkersAI.negativePrompt || '',
      seed: imageConfig.cloudflareWorkersAI.seed || null
    };
  } else {
    // 降级到基本配置
    if (!imageConfig.apiKey) {
      throw new Error('Cloudflare Workers AI requires API key. Please configure it in the modal.');
    }
    cloudflareConfig = {
      apiKey: imageConfig.apiKey,
      accountId: imageConfig.accountId || 'your-account-id',
      model: imageConfig.model || '@cf/bytedance/stable-diffusion-xl-lightning',
      steps: imageConfig.steps || 20,
      guidance: imageConfig.guidance || 7.5,
      width: imageConfig.width || 1024,
      height: imageConfig.height || 1024,
      negativePrompt: imageConfig.negativePrompt || '',
      seed: imageConfig.seed || null
    };
  }

  // 验证必需配置
  if (!cloudflareConfig.apiKey) {
    console.error('❌ [Cloudflare Workers AI] Missing API key');
    throw new Error('Cloudflare Workers AI API key is required');
  }
  
  if (!cloudflareConfig.accountId || cloudflareConfig.accountId === 'your-account-id') {
    console.error('❌ [Cloudflare Workers AI] Missing or invalid Account ID');
    throw new Error('Cloudflare Account ID is required');
  }
  
  console.log('🔧 [Cloudflare Workers AI] Configuration validated:', {
    hasApiKey: !!cloudflareConfig.apiKey,
    hasAccountId: !!cloudflareConfig.accountId,
    model: cloudflareConfig.model,
    steps: cloudflareConfig.steps,
    guidance: cloudflareConfig.guidance,
    width: cloudflareConfig.width,
    height: cloudflareConfig.height,
    hasNegativePrompt: !!cloudflareConfig.negativePrompt,
    hasSeed: cloudflareConfig.seed !== null
  });

  // 构建API请求
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareConfig.accountId}/ai/run/${cloudflareConfig.model}`;
  
  // 检查是否是 flux-1-schnell 模型
  const isFluxSchnell = cloudflareConfig.model === '@cf/black-forest-labs/flux-1-schnell';
  
  let requestBody;
  
  if (isFluxSchnell) {
    // flux-1-schnell 智能参数转换
    console.log('🔄 [Cloudflare Workers AI] Using flux-1-schnell smart parameter conversion');
    
    // 基础提示词
    let enhancedPrompt = altText;
    
    // 根据 guidance 值添加强度提示
    if (cloudflareConfig.guidance > 10) {
      enhancedPrompt += ', extremely detailed, ultra-precise, highly accurate';
    } else if (cloudflareConfig.guidance > 7.5) {
      enhancedPrompt += ', highly detailed, precise, well-defined';
    } else if (cloudflareConfig.guidance < 5) {
      enhancedPrompt += ', creative interpretation, artistic freedom';
    }
    
    // 根据尺寸添加质量提示
    const isHighRes = cloudflareConfig.width >= 1024 || cloudflareConfig.height >= 1024;
    const isUltraHighRes = cloudflareConfig.width >= 1280 || cloudflareConfig.height >= 1280;
    
    if (isUltraHighRes) {
      enhancedPrompt += ', ultra high resolution, 4K quality, extremely sharp';
    } else if (isHighRes) {
      enhancedPrompt += ', high resolution, sharp details, crisp image';
    }
    
    // 根据宽高比添加构图提示
    const aspectRatio = cloudflareConfig.width / cloudflareConfig.height;
    if (aspectRatio > 1.5) {
      enhancedPrompt += ', wide landscape composition, panoramic view';
    } else if (aspectRatio < 0.75) {
      enhancedPrompt += ', tall portrait composition, vertical framing';
    } else {
      enhancedPrompt += ', balanced square composition, centered framing';
    }
    
    // 处理负面提示词 - 转换为正面增强
    if (cloudflareConfig.negativePrompt) {
      const negativeTerms = cloudflareConfig.negativePrompt.toLowerCase();
      if (negativeTerms.includes('blur') || negativeTerms.includes('low quality')) {
        enhancedPrompt += ', crystal clear, high quality, sharp focus';
      }
      if (negativeTerms.includes('distort') || negativeTerms.includes('deform')) {
        enhancedPrompt += ', perfect proportions, accurate anatomy, clean lines';
      }
      if (negativeTerms.includes('dark') || negativeTerms.includes('shadow')) {
        enhancedPrompt += ', well-lit, bright lighting, clear visibility';
      }
    }
    
    // 添加通用质量增强
    enhancedPrompt += ', professional quality, detailed rendering';
    
    // flux-1-schnell 请求体 - 只支持 prompt 和 steps
    requestBody = {
      prompt: enhancedPrompt,
      steps: Math.min(cloudflareConfig.steps, 8) // flux-1-schnell 最大支持8步
    };
    
    console.log('✨ [Cloudflare Workers AI] Enhanced prompt for flux-1-schnell:', enhancedPrompt);
    console.log('🔧 [Cloudflare Workers AI] Limited steps to:', Math.min(cloudflareConfig.steps, 8));
    
  } else {
    // 其他模型使用完整参数
    console.log('🔧 [Cloudflare Workers AI] Using full parameter set for standard models');
    
    requestBody = {
      prompt: altText + ', high quality, professional, detailed',
      num_steps: cloudflareConfig.steps,
      guidance: cloudflareConfig.guidance,
      width: cloudflareConfig.width,
      height: cloudflareConfig.height
    };
    
    // 添加负面提示词（如果有）
    if (cloudflareConfig.negativePrompt) {
      requestBody.negative_prompt = cloudflareConfig.negativePrompt;
    }
    
    // 添加种子（如果有）
    if (cloudflareConfig.seed !== null && cloudflareConfig.seed !== undefined) {
      requestBody.seed = cloudflareConfig.seed;
    }
  }

  // 发起API调用
  console.log('🚀 [Cloudflare Workers AI] Making API request to:', apiUrl);
  console.log('📝 [Cloudflare Workers AI] Request body:', requestBody);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cloudflareConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('📡 [Cloudflare Workers AI] Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Cloudflare Workers AI API call failed: ${response.status}`;
    
    console.error('❌ [Cloudflare Workers AI] API call failed:', {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 200)
    });
    
    switch (response.status) {
      case 401:
        errorMessage = 'Invalid API key. Please check your Cloudflare API token.';
        break;
      case 403:
        errorMessage = 'Access forbidden. Please check your API token permissions.';
        break;
      case 429:
        errorMessage = 'Rate limit exceeded. Please wait and try again.';
        break;
      case 400:
        errorMessage = 'Invalid request. Please check your Account ID and model configuration.';
        break;
      default:
        errorMessage += ` - ${errorText}`;
    }
    
    console.error('❌ [Cloudflare Workers AI] Final error message:', errorMessage);
    throw new Error(errorMessage);
  }

  // 根据模型处理不同的响应格式
  if (isFluxSchnell) {
    // flux-1-schnell 返回JSON格式，包含base64图像数据
    console.log('📄 [Cloudflare Workers AI] Processing JSON response for flux-1-schnell');
    
    const jsonResponse = await response.json();
    console.log('✅ [Cloudflare Workers AI] flux-1-schnell response structure:', Object.keys(jsonResponse));
    
    // flux-1-schnell 通常在 result.image 字段返回base64数据
    let base64Data;
    if (jsonResponse.result && jsonResponse.result.image) {
      base64Data = jsonResponse.result.image;
    } else if (jsonResponse.image) {
      base64Data = jsonResponse.image;
    } else if (typeof jsonResponse === 'string') {
      // 如果整个响应就是base64字符串
      base64Data = jsonResponse;
    } else {
      console.error('❌ [Cloudflare Workers AI] Unexpected flux-1-schnell response format:', jsonResponse);
      throw new Error('Unexpected response format from flux-1-schnell model');
    }
    
    // 确保base64数据格式正确
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64Data received from flux-1-schnell model');
    }
    
    if (base64Data.startsWith('data:image/')) {
      console.log('✅ [Cloudflare Workers AI] flux-1-schnell image generated successfully (data URL format)');
      return base64Data;
    } else {
      console.log('✅ [Cloudflare Workers AI] flux-1-schnell image generated successfully (base64 format)');
      return `data:image/png;base64,${base64Data}`;
    }
    
  } else {
    // 其他模型返回二进制PNG数据
    console.log('🔢 [Cloudflare Workers AI] Processing binary response for standard models');
    
    const arrayBuffer = await response.arrayBuffer();
    
    // 转换为base64格式
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    console.log('✅ [Cloudflare Workers AI] Standard model image generated successfully, size:', arrayBuffer.byteLength, 'bytes');
    
    return `data:image/png;base64,${base64Data}`;
  }
}

// Imagen 4 图片生成
async function generateImageWithImagen4(altText: string, imageConfig: any): Promise<string> {
  const { apiKey, model } = imageConfig
  
  if (!imageApiKey) {
    throw new Error('Imagen 4 requires API key')
  }
  
  // 使用Vertex AI格式的Imagen 4 API
  const modelName = model || 'imagen-4.0-generate-001'
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateImage', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: {
        text: altText + ', photorealistic, high quality, professional photography'
      },
      imageGenerationConfig: {
        aspectRatio: '1:1',
        negativePrompt: 'low quality, blurry, distorted, watermark',
        guidance: 7.0,
        numberOfImages: 1
      }
    })
  })
  
  if (!response.ok) {
    // 获取错误响应内容
    const errorText = await response.text()
    const errorMsg = `Imagen 4 API调用失败 - HTTP ${response.status}: ${response.statusText}\n响应内容: ${errorText.substring(0, 200)}...`
    console.warn(errorMsg)
    console.warn('🔄 使用免费Pollinations服务兤底')
    
    const description = encodeURIComponent(altText)
    return 'https://image.pollinations.ai/prompt/' + description + '?width=1024&height=1024&seed=' + Math.floor(Math.random() * 1000000)
  }
  
  const data = await response.json()
  if (data.images && data.images[0] && data.images[0].imageUri) {
    return data.images[0].imageUri
  }
  
  throw new Error('Invalid Imagen 4 response format')
}

// QWEN 图片生成
async function generateImageWithQWENImage(altText: string, imageConfig: any): Promise<string> {
  const { apiKey, model } = imageConfig
  
  if (!apiKey) {
    throw new Error('QWEN Image requires API key')
  }
  
  const modelName = model || 'qwen-image-plus'
  
  const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + imageApiKey
    },
    body: JSON.stringify({
      model: modelName,
      input: {
        messages: [{
          role: 'user',
          content: [{
            text: altText + ', high quality, professional, detailed artwork'
          }]
        }]
      },
      parameters: {
        negative_prompt: 'low quality, blurry, distorted',
        prompt_extend: true,
        watermark: false,
        size: '1328*1328'
      }
    })
  })
  
  if (!response.ok) {
    throw new Error('QWEN Image API call failed: ' + response.status + ' - ' + await response.text())
  }
  
  const data = await response.json()
  console.log('QWEN Image response:', data)
  
  // 处理QWEN响应格式
  if (data.output && data.output.choices && data.output.choices[0] && 
      data.output.choices[0].message && data.output.choices[0].message.content &&
      data.output.choices[0].message.content[0] && data.output.choices[0].message.content[0].image) {
    return data.output.choices[0].message.content[0].image
  }
  
  throw new Error('Invalid QWEN Image response format')
}

// WanX-V1 图片生成
async function generateImageWithWanX(altText: string, imageConfig: any): Promise<string> {
  const { apiKey } = imageConfig
  
  if (!apiKey) {
    throw new Error('WanX-V1 requires API key')
  }
  
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + imageApiKey
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt: altText + ', masterpiece, high quality, detailed, professional artwork'
      },
      parameters: {
        size: '1024*1024'
      }
    })
  })
  
  if (!response.ok) {
    throw new Error('WanX-V1 API call failed: ' + response.status + ' - ' + await response.text())
  }
  
  const data = await response.json()
  console.log('WanX-V1 response:', data)
  
  // 处理WanX响应格式
  if (data.output && data.output.results && data.output.results[0] && data.output.results[0].url) {
    return data.output.results[0].url
  }
  
  throw new Error('Invalid WanX-V1 response format')
}

// 自定义OpenAI兼容API图片生成
async function generateImageWithCustomAPI(altText: string, imageConfig: any): Promise<string> {
  const { apiKey, baseUrl, customModelName } = imageConfig
  
  if (!apiKey || !baseUrl) {
    throw new Error('Custom API requires API key and base URL')
  }
  
  const response = await fetch(baseUrl + '/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: customModelName || 'dall-e-3',
      prompt: altText + ', high quality, professional, clean design',
      n: 1,
      size: '1024x1024'
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error('Custom API call failed: ' + response.status + ' - ' + errorText)
  }
  
  const data = await response.json()
  if (data.data && data.data[0] && data.data[0].url) {
    return data.data[0].url
  }
  
  throw new Error('Invalid custom API response format')
}

// 字节跳动即梦4.0图片生成
async function generateImageWithByteDanceJimeng(altText: string, imageConfig: any): Promise<string> {
  const { 
    apiKey, 
    model, 
    size, 
    sequentialImageGeneration, 
    maxImages,
    guidanceScale, 
    seed, 
    responseFormat, 
    watermark, 
    stream 
  } = imageConfig
  
  if (!apiKey) {
    throw new Error('ByteDance ARK API key is required')
  }
  
  console.log('[ByteDance Jimeng] 开始生成图片:', { model, size, altText: altText.substring(0, 50) + '...' })
  
  // 准备请求参数
  const requestBody: any = {
    model: model || 'doubao-seedream-4-0-250828',
    prompt: altText,
    size: size || '2K',
    response_format: responseFormat || 'url',
    watermark: watermark !== false
  }
  
  // 即梦4.0特有参数
  if (model === 'doubao-seedream-4-0-250828') {
    requestBody.sequential_image_generation = sequentialImageGeneration || 'disabled'
    requestBody.stream = stream || false
    
    // 组图模式参数
    if (sequentialImageGeneration === 'auto' && maxImages && maxImages > 1) {
      requestBody.sequential_image_generation_options = {
        max_images: Math.min(maxImages, 15) // 限制最大数量
      }
    }
  }
  
  // 即梦3.0特有参数
  if (model === 'doubao-seedream-3-0-t2i-250415' || model === 'doubao-seededit-3-0-i2i-250628') {
    if (guidanceScale) {
      requestBody.guidance_scale = guidanceScale
    }
    if (seed) {
      requestBody.seed = parseInt(seed)
    }
  }
  
  console.log('[ByteDance Jimeng] 请求参数:', requestBody)
  
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ByteDance Jimeng] API调用失败:', response.status, errorText)
      throw new Error(`ByteDance API call failed: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('[ByteDance Jimeng] API响应:', result)
    
    if (result.data && result.data.length > 0) {
      // 返回第一张图片的URL
      const imageUrl = result.data[0].url
      console.log('[ByteDance Jimeng] 图片生成成功:', imageUrl)
      
      // 如果是组图模式，可以在这里处理多张图片
      if (result.data.length > 1) {
        console.log(`[ByteDance Jimeng] 组图生成成功，共 ${result.data.length} 张图片`)
        // 这里可以扩展支持多图片返回，目前返回第一张
      }
      
      return imageUrl
    }
    
    throw new Error('ByteDance API返回格式无效: 缺少图片数据')
    
  } catch (error) {
    console.error('[ByteDance Jimeng] 图片生成失败:', error)
    throw error
  }
}

// 图片URL转base64函数
async function convertImagesToBase64(html: string): Promise<string> {
  console.log('📷 Starting image to base64 conversion...')
  
  // 找到所有img标签的src属性
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
  const matches = [...html.matchAll(imgRegex)]
  
  if (matches.length === 0) {
    console.log('ℹ️ No images found to convert')
    return html
  }
  
  console.log(`🖼️ Found ${matches.length} images to convert`)
  let convertedHtml = html
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const fullImgTag = match[0]
    const imageUrl = match[1]
    
    // 检查imageUrl是否有效
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.log(`⏭️ Skipping invalid image URL ${i + 1}/${matches.length}`)
      continue
    }
    
    // 跳过已经是base64的图片
    if (imageUrl.startsWith('data:')) {
      console.log(`⏭️ Skipping already base64 image ${i + 1}/${matches.length}`)
      continue
    }
    
    console.log(`🔄 Converting image ${i + 1}/${matches.length}: ${imageUrl.substring(0, 60)}...`)
    
    try {
      const base64Image = await fetchImageAsBase64(imageUrl)
      const newImgTag = fullImgTag.replace(imageUrl, base64Image)
      convertedHtml = convertedHtml.replace(fullImgTag, newImgTag)
      console.log(`✅ Successfully converted image ${i + 1}/${matches.length}`)
    } catch (error) {
      console.warn(`⚠️ Failed to convert image ${i + 1}/${matches.length}:`, error.message)
      // 保持原始 URL，不中断整个转换过程
    }
  }
  
  console.log('✅ Image to base64 conversion completed')
  return convertedHtml
}

// 获取图片并转换为base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    // 使用fetch获取图片
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-HTML-Generator)',
        'Accept': 'image/*'
      },
      // 设置超时时间为15秒
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // 获取图片数据
    const arrayBuffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    // 检测图片类型
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`)
  }
}

function validateAndFixHTML(html: string): string {
  // Basic HTML validation and fixes
  if (!html.includes('<!DOCTYPE html>')) {
    html = '<!DOCTYPE html>\n' + html
  }
  
  if (!html.includes('<html')) {
    html = html.replace(/(.*<body[\s\S]*<\/body>.*)/i, '<html lang="en">$1</html>')
  }
  
  // Ensure complete head section
  if (!html.includes('<head>')) {
    const bodyIndex = html.indexOf('<body')
    if (bodyIndex > -1) {
      const headContent = '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Generated Page</title></head>'
      html = html.slice(0, bodyIndex) + headContent + html.slice(bodyIndex)
    }
  }
  
  // Ensure Tailwind CSS is included
  if (!html.includes('tailwindcss.com') && !html.includes('tailwind')) {
    const headEndIndex = html.indexOf('</head>')
    if (headEndIndex > -1) {
      const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>\n'
      html = html.slice(0, headEndIndex) + tailwindScript + html.slice(headEndIndex)
    }
  }
  
  return html
}

// Vertex AI Image Generation API Routes

// 生成图像 - 使用Google Cloud Vertex AI Imagen
app.post('/api/image-generate', async (c) => {
  try {
    const requestData = await c.req.json()
    
    // 验证必需参数
    if (!requestData.prompt) {
      return c.json({
        success: false,
        error: 'Prompt is required'
      } as APIResponse, 400)
    }

    if (!requestData.model) {
      return c.json({
        success: false,
        error: 'Model is required'
      } as APIResponse, 400)
    }

    // 从前端获取或使用默认配置
    const imageRequest = {
      model: requestData.model,
      prompt: requestData.prompt,
      projectId: requestData.projectId || 'your-gcp-project-id', // 可在此处配置默认项目ID
      location: requestData.location || 'us-central1',
      
      // 可选参数，使用前端传入的值或默认值
      sampleCount: requestData.sampleCount || 1,
      aspectRatio: requestData.aspectRatio || '1:1',
      addWatermark: requestData.addWatermark !== undefined ? requestData.addWatermark : true,
      enhancePrompt: requestData.enhancePrompt !== undefined ? requestData.enhancePrompt : true,
      includeRaiReason: requestData.includeRaiReason !== undefined ? requestData.includeRaiReason : false,
      includeSafetyAttributes: requestData.includeSafetyAttributes !== undefined ? requestData.includeSafetyAttributes : false,
      mimeType: requestData.mimeType || 'image/png',
      compressionQuality: requestData.compressionQuality,
      personGeneration: requestData.personGeneration || 'allow_adult',
      safetySetting: requestData.safetySetting || 'block_medium_and_above',
      seed: requestData.seed,
      storageUri: requestData.storageUri
    }

    // 这里需要配置Google Cloud访问令牌
    // 在实际部署中，应该通过环境变量或服务账号密钥获取
    const accessToken = requestData.accessToken
    if (!accessToken) {
      return c.json({
        success: false,
        error: 'Google Cloud access token is required. Please configure your authentication.'
      } as APIResponse, 401)
    }

    // 构建Vertex AI请求
    const vertexAIUrl = `https://${imageRequest.location}-aiplatform.googleapis.com/v1/projects/${imageRequest.projectId}/locations/${imageRequest.location}/publishers/google/models/${imageRequest.model}:predict`
    
    const requestBody = {
      instances: [
        {
          prompt: imageRequest.prompt
        }
      ],
      parameters: {
        sampleCount: imageRequest.sampleCount
      }
    }

    // 添加可选参数
    if (imageRequest.addWatermark !== undefined) {
      requestBody.parameters.addWatermark = imageRequest.addWatermark
    }
    if (imageRequest.aspectRatio) {
      requestBody.parameters.aspectRatio = imageRequest.aspectRatio
    }
    if (imageRequest.enhancePrompt !== undefined) {
      requestBody.parameters.enhancePrompt = imageRequest.enhancePrompt
    }
    if (imageRequest.includeRaiReason !== undefined) {
      requestBody.parameters.includeRaiReason = imageRequest.includeRaiReason
    }
    if (imageRequest.includeSafetyAttributes !== undefined) {
      requestBody.parameters.includeSafetyAttributes = imageRequest.includeSafetyAttributes
    }
    if (imageRequest.mimeType || imageRequest.compressionQuality) {
      requestBody.parameters.outputOptions = {}
      if (imageRequest.mimeType) {
        requestBody.parameters.outputOptions.mimeType = imageRequest.mimeType
      }
      if (imageRequest.compressionQuality) {
        requestBody.parameters.outputOptions.compressionQuality = imageRequest.compressionQuality
      }
    }
    if (imageRequest.personGeneration) {
      requestBody.parameters.personGeneration = imageRequest.personGeneration
    }
    if (imageRequest.safetySetting) {
      requestBody.parameters.safetySetting = imageRequest.safetySetting
    }
    if (imageRequest.seed) {
      requestBody.parameters.seed = imageRequest.seed
    }
    if (imageRequest.storageUri) {
      requestBody.parameters.storageUri = imageRequest.storageUri
    }

    console.log('Vertex AI Imagen Request:', {
      url: vertexAIUrl,
      model: imageRequest.model,
      prompt: imageRequest.prompt.substring(0, 100) + '...',
      parameters: requestBody.parameters
    })

    // 重试机制配置
    const maxRetries = 3
    const retryDelays = [1000, 2000, 4000] // 1秒, 2秒, 4秒
    let lastError = null

    // 调用Vertex AI API with retry logic
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🔄 Vertex AI API call attempt ${attempt + 1}/${maxRetries}`)
        
        const response = await fetch(vertexAIUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) {
          // Success - break out of retry loop
          const responseData = await response.json()
          console.log('✅ Vertex AI Response received with', responseData.predictions?.length, 'predictions')

          // 处理响应
          const images = []
          let enhancedPrompt = ''

          if (responseData.predictions && Array.isArray(responseData.predictions)) {
            for (const prediction of responseData.predictions) {
              if (prediction.bytesBase64Encoded) {
                const mimeType = prediction.mimeType || imageRequest.mimeType || 'image/png'
                images.push({
                  mimeType,
                  dataUrl: `data:${mimeType};base64,${prediction.bytesBase64Encoded}`,
                  bytesBase64: prediction.bytesBase64Encoded
                })
              }
              
              // 获取增强后的提示词
              if (prediction.prompt && !enhancedPrompt) {
                enhancedPrompt = prediction.prompt
              }
            }
          }

          return c.json({
            success: true,
            data: {
              model: imageRequest.model,
              images,
              enhancedPrompt: enhancedPrompt || undefined,
              originalPrompt: imageRequest.prompt
            }
          } as APIResponse)
        }

        // Handle non-2xx responses
        const errorText = await response.text()
        console.error(`❌ Vertex AI Error (attempt ${attempt + 1}):`, errorText)
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error && errorJson.error.message) {
            errorMessage = errorJson.error.message
          }
        } catch (e) {
          // 保持原始错误消息
        }

        lastError = new Error(errorMessage)

        // Check if we should retry
        if (response.status === 429) {
          // Rate limiting - always retry with exponential backoff
          console.log(`⏳ Rate limited, retrying in ${retryDelays[attempt]}ms...`)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]))
            continue
          }
        } else if (response.status >= 500) {
          // Server errors - retry
          console.log(`🔄 Server error ${response.status}, retrying in ${retryDelays[attempt]}ms...`)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]))
            continue
          }
        } else {
          // Client errors (4xx except 429) - don't retry
          break
        }

      } catch (networkError) {
        console.error(`🌐 Network error (attempt ${attempt + 1}):`, networkError)
        lastError = networkError
        
        // Network errors - retry
        if (attempt < maxRetries - 1) {
          console.log(`🔄 Network error, retrying in ${retryDelays[attempt]}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]))
          continue
        }
      }
    }

    // If we get here, all retries failed
    const finalError = lastError || new Error('All retry attempts failed')
    return c.json({
      success: false,
      error: `Vertex AI generation failed after ${maxRetries} attempts: ${finalError.message}`
    } as APIResponse, 500)

  } catch (error) {
    console.error('Image generation error:', error)
    return c.json({
      success: false,
      error: `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// 获取Vertex AI Imagen模型信息
app.get('/api/imagen-models', (c) => {
  try {
    const models = {
      'imagen-4.0-generate-001': {
        name: 'Imagen 4.0 Generate',
        description: '追求画质、合规(数字水印、安全设置、提示重写)，多语种提示',
        maxSampleCount: 4,
        rpmLimit: null,
        supportedAspectRatios: ['1:1', '3:4', '4:3', '16:9', '9:16'],
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
        features: {
          watermark: true,
          promptEnhancement: false,
          multiLanguage: false,
          safetyFiltering: true
        }
      }
    }

    return c.json({
      success: true,
      data: models
    } as APIResponse)

  } catch (error) {
    console.error('Get Imagen models error:', error)
    return c.json({
      success: false,
      error: `Failed to get models: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// SDK API Routes

// 初始化SDK客户端
app.post('/api/sdk/init', async (c) => {
  try {
    const { apiKeys } = await c.req.json()
    
    // 验证API密钥格式
    if (!apiKeys || typeof apiKeys !== 'object') {
      return c.json({ success: false, error: 'Invalid API keys format' } as APIResponse)
    }
    
    // 初始化SDK客户端
    sdkService.initializeClients(apiKeys)
    
    // 获取可用的SDK状态
    const availableSDKs = sdkService.getAvailableSDKs()
    
    return c.json({
      success: true,
      data: {
        initialized: availableSDKs,
        message: `Successfully initialized ${availableSDKs.length} SDK clients`
      }
    } as APIResponse)
    
  } catch (error) {
    console.error('SDK initialization error:', error)
    return c.json({
      success: false,
      error: `SDK initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// 获取SDK状态
app.get('/api/sdk/status', (c) => {
  try {
    const availableSDKs = sdkService.getAvailableSDKs()
    
    const status: SDKStatus = {
      openai: availableSDKs.includes('OpenAI'),
      anthropic: availableSDKs.includes('Anthropic'),
      google: availableSDKs.includes('Google AI')
    }
    
    return c.json({
      success: true,
      data: status
    } as APIResponse<SDKStatus>)
    
  } catch (error) {
    console.error('SDK status error:', error)
    return c.json({
      success: false,
      error: `Failed to get SDK status: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// 使用SDK生成内容
app.post('/api/sdk/generate', async (c) => {
  try {
    const { prompt, provider, model } = await c.req.json()
    
    if (!prompt) {
      return c.json({
        success: false,
        error: 'Prompt is required'
      } as APIResponse, 400)
    }
    
    // 使用最佳可用的SDK生成内容
    const result = await sdkService.generateWithBestAvailable(prompt, provider)
    
    return c.json({
      success: true,
      data: result
    } as APIResponse)
    
  } catch (error) {
    console.error('SDK generation error:', error)
    return c.json({
      success: false,
      error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// 测试模型可用性
app.post('/api/sdk/test', async (c) => {
  try {
    const { models } = await c.req.json()
    
    if (!models || !Array.isArray(models)) {
      return c.json({
        success: false,
        error: 'Models array is required'
      } as APIResponse, 400)
    }
    
    const results: ModelTestResult[] = []
    
    for (const modelId of models) {
      const startTime = Date.now()
      
      try {
        const testPrompt = "Test response: Hello, this is a simple test."
        let result: any
        
        // 根据模型ID测试对应的SDK
        if (modelId.includes('gpt') || modelId.includes('openai')) {
          result = await sdkService.generateWithOpenAI(testPrompt, modelId)
        } else if (modelId.includes('claude') || modelId.includes('anthropic')) {
          result = await sdkService.generateWithAnthropic(testPrompt, modelId)
        } else if (modelId.includes('gemini') || modelId.includes('google')) {
          result = await sdkService.generateWithGoogle(testPrompt, modelId)
        } else {
          throw new Error('Unsupported model type')
        }
        
        const responseTime = Date.now() - startTime
        
        results.push({
          modelId,
          success: true,
          responseTime,
          sampleResponse: result?.substring(0, 100) + (result?.length > 100 ? '...' : '')
        })
        
      } catch (error) {
        results.push({
          modelId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return c.json({
      success: true,
      data: results
    } as APIResponse<ModelTestResult[]>)
    
  } catch (error) {
    console.error('Model testing error:', error)
    return c.json({
      success: false,
      error: `Model testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// 使用SDK生成图像
app.post('/api/sdk/generate-image', async (c) => {
  try {
    const { prompt, size, provider, model } = await c.req.json()
    
    if (!prompt) {
      return c.json({
        success: false,
        error: 'Prompt is required'
      } as APIResponse, 400)
    }
    
    let imageUrl: string
    let usedProvider: string
    let usedModel: string
    
    if (provider === 'google' || provider === 'gemini') {
      // 🚫 禁用 Google AI SDK 直连以避免 CORS 问题
      // Nano Banana 应该通过主要的图片生成路径使用后端代理
      console.warn('🚫 [SDK Fix] Google/Gemini provider disabled in SDK endpoint to prevent CORS issues');
      console.warn('💡 [SDK Fix] Please use the main image generation flow with Nano Banana backend proxy');
      
      throw new Error('Nano Banana (Google/Gemini) image generation via SDK is disabled to prevent CORS issues. Please use the main image generation flow with proper backend proxy configuration.');
    } else {
      // 默认使用OpenAI SDK生成图像
      imageUrl = await sdkService.generateImageWithOpenAI(prompt, size || '1024x1024')
      usedProvider = 'OpenAI'
      usedModel = 'dall-e-3'
    }
    
    return c.json({
      success: true,
      data: {
        imageUrl,
        provider: usedProvider,
        model: usedModel
      }
    } as APIResponse)
    
  } catch (error) {
    console.error('SDK image generation error:', error)
    return c.json({
      success: false,
      error: `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as APIResponse, 500)
  }
})

// Favicon route
app.get('/favicon.ico', (c) => {
  return c.redirect('https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4bb.png')
})

// ChatGPT 测试页面
app.get('/test-chatgpt', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>ChatGPT 集成测试</title>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            button { padding: 10px 20px; margin: 10px 0; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            #results { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            li { margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>ChatGPT 集成测试页面</h1>
        
        <button onclick="testChatGPTIntegration()">测试ChatGPT集成</button>
        <button onclick="testModalElements()">测试模态框元素</button>
        
        <div id="results">
            <h2>测试结果：</h2>
            <ul id="testResults"></ul>
        </div>

        <script>
            function addTestResult(message, success = true) {
                const ul = document.getElementById('testResults');
                const li = document.createElement('li');
                li.textContent = message;
                li.style.color = success ? 'green' : 'red';
                li.style.fontWeight = 'bold';
                ul.appendChild(li);
            }

            function testChatGPTIntegration() {
                addTestResult('开始测试 ChatGPT 集成功能...');
                
                // 测试1: 检查生成API端点
                axios.post('/api/generate', {
                    userPrompt: 'Test ChatGPT integration with a simple business card page',
                    pageConfig: {
                        title: 'ChatGPT测试页面',
                        pageType: 'business',
                        themeColor: '#3B82F6'
                    },
                    modelConfig: {
                        textModelProvider: 'test',
                        imageModelProvider: 'chatgpt',
                        imageModelName: 'gpt-image-1'
                    }
                })
                .then((response) => {
                    if (response.data.success) {
                        addTestResult('✓ ChatGPT集成API端点响应正常');
                        addTestResult('✓ 页面生成成功，包含ChatGPT路径');
                    } else {
                        addTestResult('✗ API端点返回错误: ' + response.data.error, false);
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.data) {
                        if (error.response.data.error && error.response.data.error.includes('requires API key')) {
                            addTestResult('✓ ChatGPT API key验证正常工作');
                        } else {
                            addTestResult('✗ API错误: ' + error.response.data.error, false);
                        }
                    } else {
                        addTestResult('✗ 网络错误: ' + error.message, false);
                    }
                })
                .finally(() => {
                    addTestResult('ChatGPT 集成测试完成');
                });
            }

            function testModalElements() {
                addTestResult('测试模态框元素存在性...');
                
                // 模拟访问主页面并检查元素
                axios.get('/')
                    .then((response) => {
                        const htmlContent = response.data;
                        
                        // 检查关键的ChatGPT相关代码
                        if (htmlContent.includes('chatGPTModal')) {
                            addTestResult('✓ chatGPTModal 模态框元素存在');
                        } else {
                            addTestResult('✗ chatGPTModal 模态框元素缺失', false);
                        }
                        
                        if (htmlContent.includes('showChatGPTConfigModal')) {
                            addTestResult('✓ showChatGPTConfigModal 函数存在');
                        } else {
                            addTestResult('✗ showChatGPTConfigModal 函数缺失', false);
                        }
                        
                        if (htmlContent.includes('generateImageWithChatGPT')) {
                            addTestResult('✓ generateImageWithChatGPT 函数存在');
                        } else {
                            addTestResult('✗ generateImageWithChatGPT 函数缺失', false);
                        }
                        
                        if (htmlContent.includes('ChatGPT (gpt-image-1, dall-e-2, dall-e-3)')) {
                            addTestResult('✓ ChatGPT 选项已添加到选择器');
                        } else {
                            addTestResult('✗ ChatGPT 选项未添加到选择器', false);
                        }
                        
                        addTestResult('模态框元素测试完成');
                    })
                    .catch((error) => {
                        addTestResult('✗ 无法获取主页面: ' + error.message, false);
                    });
            }
        </script>
    </body>
    </html>
  `);
})

// 兼容性状态API路由 - 修复错误调用
app.get('/api/status/:jobId', async (c) => {
  // 重定向到正确的路由
  const jobId = c.req.param('jobId')
  console.log(`🔄 Legacy status API called, redirecting to correct route for job: ${jobId}`)
  
  try {
    const kvStatus = await c.env.JOBS.get(jobId)
    if (!kvStatus) {
      return c.json({ success: false, error: 'Job not found' }, 404)
    }
    
    const status = JSON.parse(kvStatus)
    return c.json({
      success: true,
      jobId: jobId,
      status: status.status,
      progress: status.progress || 33,
      currentStep: status.currentStep || 1,
      steps: status.steps || [],
      htmlStructure: status.htmlStructure,
      message: status.status === 'completed' ? 'Job completed' : 'Processing...'
    })
    
  } catch (error) {
    console.error(`❌ Legacy status API error for ${jobId}:`, error.message)
    return c.json({ success: false, error: `Status check failed: ${error.message}` }, 500)
  }
})

// 404 handler - must be last
// Version API
app.get('/api/version', (c) => {
  return c.json({
    version: '2.0.0',
    name: 'AI HTML Generator',
    description: 'AI-powered HTML generation with Nano Banana and multi-provider support',
    features: ['Google AI SDK', 'Nano Banana', 'Pollinations', 'Unsplash', 'D1 Database', 'KV Storage'],
    lastUpdated: '2025-09-29'
  })
})

// Providers API
app.get('/api/providers', (c) => {
  return c.json({
    success: true,
    providers: {
      image: [
        {
          name: 'Nano Banana',
          id: 'nano_banana',
          description: 'Gemini 2.5 Flash Image Preview - Advanced AI image generation',
          model: 'gemini-2.5-flash-image-preview',
          status: 'available'
        },
        {
          name: 'Pollinations AI',
          id: 'pollinations',
          description: 'Free AI image generation service',
          status: 'available'
        },
        {
          name: 'Unsplash',
          id: 'unsplash',
          description: 'High-quality stock photos',
          status: 'available'
        }
      ],
      text: [
        {
          name: 'Google AI',
          id: 'google',
          description: 'Google Gemini models',
          models: ['gemini-pro', 'gemini-pro-vision'],
          status: 'available'
        }
      ]
    }
  })
})

// V2 Enhanced Providers API - 支持多提供商配置
app.get('/api/v2/providers', (c) => {
  return c.json({
    success: true,
    providers: {
      'alibaba-dashscope': {
        name: '阿里巴巴通义·百炼',
        description: 'DashScope平台提供的AI图像生成服务',
        models: getDashScopeModels(),
        regions: {
          'intl': {
            name: '新加坡地域',
            baseUrl: 'https://dashscope-intl.aliyuncs.com',
            description: '国际版，适用于海外用户'
          },
          'cn': {
            name: '北京地域', 
            baseUrl: 'https://dashscope.aliyuncs.com',
            description: '中国版，适用于国内用户'
          }
        },
        authType: 'Bearer',
        features: ['同步生成', '异步生成', 'OpenAI兼容模式', '多地域支持']
      },
      'bytedance-ark': {
        name: '字节跳动豆包',
        description: 'ByteDance Ark API 即梦图像生成',
        models: {
          'doubao-seedream-4-0-250828': {
            name: '即梦4.0',
            description: '最新的即梦4.0模型，支持流式输出和组图功能',
            features: ['2K分辨率', '流式输出', '组图功能', '多图输入']
          },
          'doubao-seedream-3-0-t2i': {
            name: '即梦3.0 文生图',
            description: '即梦3.0文本生成图像模型',
            features: ['文生图', '随机种子', '引导强度控制']
          },
          'doubao-seededit-3-0-i2i': {
            name: '即梦3.0 图生图',
            description: '即梦3.0图像生成图像模型',
            features: ['图生图', '图像编辑', '风格转换']
          }
        },
        authType: 'Bearer',
        features: ['流式输出', 'SSE支持', '多图输入', '高质量生成']
      },
      'stability-ai': {
        name: 'Stability AI',
        description: 'Stable Diffusion官方API服务',
        models: {
          'stable-image-ultra': {
            name: 'Stable Image Ultra',
            description: '最高质量的图像生成模型'
          },
          'stable-image-core': {
            name: 'Stable Image Core',
            description: '核心图像生成模型'
          },
          'sd3.5-large': {
            name: 'Stable Diffusion 3.5 Large',
            description: 'SD 3.5大型模型'
          }
        },
        authType: 'Bearer',
        features: ['高质量生成', '多种风格预设', '宽高比控制']
      },
      'hugging-face': {
        name: 'Hugging Face',
        description: 'Hugging Face推理API和自定义端点',
        models: {
          'black-forest-labs/FLUX.1-dev': {
            name: 'FLUX.1 Dev',
            description: 'Black Forest Labs的FLUX.1开发版模型'
          }
        },
        authType: 'Bearer',
        features: ['开源模型', '自定义端点', 'OpenAI兼容']
      },
      'cloudflare': {
        name: 'Cloudflare Workers AI',
        description: 'Cloudflare边缘AI计算平台',
        models: {
          '@cf/bytedance/stable-diffusion-xl-lightning': {
            name: 'SDXL Lightning',
            description: 'Cloudflare提供的SDXL Lightning模型'
          }
        },
        authType: 'Bearer',
        features: ['边缘计算', '低延迟', '无服务器']
      }
    }
  })
})

// ===============================================
// 🚀 V2 Enhanced Image Generation API Routes
// ===============================================

// V2 图片生成API - 支持多提供商统一接口
app.post('/api/v2/image-generate', async (c) => {
  try {
    const { provider, model, prompt, config } = await c.req.json()
    
    // 验证必需参数
    if (!provider || !prompt) {
      return c.json({ 
        success: false, 
        error: 'Missing required parameters: provider and prompt' 
      }, 400)
    }

    console.log(`🚀 [V2 API] Image generation request:`, { provider, model, prompt: prompt.substring(0, 100) + '...' })

    // 创建任务ID
    const taskId = `v2_${provider}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // 初始化任务状态
    await c.env.JOBS.put(taskId, JSON.stringify({
      status: 'processing',
      provider,
      model,
      prompt,
      config,
      progress: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    // 根据提供商分发处理
    let result
    switch (provider) {
      case 'alibaba-dashscope':
        result = await generateWithDashScope(prompt, { ...config, model, apiKey: config.apiKey }, c.env, taskId)
        break
      
      case 'bytedance-ark':
        result = await generateWithBytedance(prompt, { ...config, model, apiKey: config.apiKey }, c.env, taskId)
        break
      
      case 'stability-ai':
        result = await generateWithStability(prompt, { ...config, model, apiKey: config.apiKey }, c.env, taskId)
        break
      
      case 'hugging-face':
        result = await generateWithHuggingFace(prompt, { ...config, model, apiKey: config.apiKey }, c.env, taskId)
        break
      
      case 'cloudflare':
        result = await generateWithCloudflareWorkersAI(prompt, { ...config, model, apiKey: config.apiKey }, c.env, taskId)
        break
      
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    if (result.success && result.imageData) {
      // 上传图片到R2存储
      const filename = `v2-images/${taskId}/${Date.now()}.${result.format || 'png'}`
      await c.env.R2.put(filename, result.imageData, {
        customMetadata: {
          taskId,
          provider,
          model,
          width: result.width?.toString(),
          height: result.height?.toString(),
          generationTime: result.generationTime?.toString()
        }
      })

      const imageUrl = `${c.req.url.split('/api')[0]}/api/image-proxy/${encodeURIComponent(filename)}`

      // 更新任务状态为完成
      await c.env.JOBS.put(taskId, JSON.stringify({
        status: 'completed',
        provider,
        model,
        prompt,
        config,
        progress: 100,
        imageUrl,
        metadata: result.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }))

      return c.json({
        success: true,
        taskId,
        message: 'Image generation completed',
        imageUrl
      })
    } else {
      // 更新任务状态为失败
      await c.env.JOBS.put(taskId, JSON.stringify({
        status: 'failed',
        provider,
        model,
        prompt,
        config,
        progress: 0,
        error: result.error || 'Image generation failed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        failedAt: new Date().toISOString()
      }))

      return c.json({
        success: false,
        taskId,
        error: result.error || 'Image generation failed'
      }, 500)
    }

  } catch (error) {
    console.error('V2 API Error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// V2 任务状态查询API
app.get('/api/v2/image-generate/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId')
    
    const taskData = await c.env.JOBS.get(taskId)
    if (!taskData) {
      return c.json({ 
        success: false, 
        error: 'Task not found' 
      }, 404)
    }

    const task = JSON.parse(taskData)
    
    return c.json({
      success: true,
      taskId,
      status: task.status,
      progress: task.progress || 0,
      imageUrl: task.imageUrl,
      error: task.error,
      metadata: task.metadata,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      failedAt: task.failedAt
    })

  } catch (error) {
    console.error('V2 Status API Error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// V2 图片代理API - 用于访问R2存储中的图片
app.get('/api/image-proxy/:filename', async (c) => {
  try {
    const filename = decodeURIComponent(c.req.param('filename'))
    
    // 安全检查：确保文件路径在允许的目录内
    if (!filename.startsWith('v2-images/') && !filename.startsWith('temp/')) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const object = await c.env.R2.get(filename)
    
    if (!object) {
      return c.json({ error: 'Image not found' }, 404)
    }

    const contentType = object.customMetadata?.contentType || 'image/png'
    
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存1天
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    })

  } catch (error) {
    console.error('Image proxy error:', error)
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

// 🗑️ 清理过期临时图片的API (内部维护用)
app.post('/api/cleanup/expired-images', async (c) => {
  try {
    console.log('🗑️ Starting cleanup of expired temporary images...')
    
    if (!c.env.R2) {
      return c.json({ success: false, error: 'R2 storage not available' }, 500)
    }
    
    let deletedCount = 0
    let totalChecked = 0
    const errors: string[] = []
    
    // 列出temp目录下的所有文件
    const objects = await c.env.R2.list({ prefix: 'temp/' })
    
    for (const object of objects.objects) {
      totalChecked++
      
      try {
        // 获取文件的元数据
        const metadata = await c.env.R2.head(object.key)
        
        if (metadata?.customMetadata?.expiresAt) {
          const expiresAt = parseInt(metadata.customMetadata.expiresAt)
          
          // 检查是否过期
          if (Date.now() > expiresAt) {
            await c.env.R2.delete(object.key)
            deletedCount++
            console.log(`🗑️ Deleted expired image: ${object.key}`)
          }
        } else {
          // 没有过期时间的旧文件，如果超过24小时也删除
          const createdAt = object.uploaded
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000
          
          if (createdAt < new Date(dayAgo)) {
            await c.env.R2.delete(object.key)
            deletedCount++
            console.log(`🗑️ Deleted old image without expiry: ${object.key}`)
          }
        }
      } catch (error) {
        const errorMsg = `Failed to process ${object.key}: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }
    
    const result = {
      success: true,
      summary: {
        totalChecked,
        deletedCount,
        errorCount: errors.length,
        timestamp: new Date().toISOString()
      }
    }
    
    if (errors.length > 0) {
      result.errors = errors.slice(0, 10) // 最多返回10个错误
    }
    
    console.log(`✅ Cleanup completed: ${deletedCount}/${totalChecked} files deleted`)
    return c.json(result)
    
  } catch (error) {
    console.error('❌ Cleanup process failed:', error)
    return c.json({ 
      success: false, 
      error: 'Cleanup process failed: ' + error.message 
    }, 500)
  }
})

// 📊 获取临时存储统计信息的API
app.get('/api/stats/temp-storage', async (c) => {
  try {
    if (!c.env.R2) {
      return c.json({ success: false, error: 'R2 storage not available' }, 500)
    }
    
    let totalFiles = 0
    let totalSize = 0
    let expiredFiles = 0
    let activeFiles = 0
    
    const objects = await c.env.R2.list({ prefix: 'temp/' })
    
    for (const object of objects.objects) {
      totalFiles++
      totalSize += object.size
      
      try {
        const metadata = await c.env.R2.head(object.key)
        
        if (metadata?.customMetadata?.expiresAt) {
          const expiresAt = parseInt(metadata.customMetadata.expiresAt)
          
          if (Date.now() > expiresAt) {
            expiredFiles++
          } else {
            activeFiles++
          }
        } else {
          // 没有过期时间的视为过期
          expiredFiles++
        }
      } catch (error) {
        // 无法获取元数据的视为过期
        expiredFiles++
      }
    }
    
    return c.json({
      success: true,
      stats: {
        totalFiles,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        activeFiles,
        expiredFiles,
        lastUpdated: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to get temp storage stats:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to get stats: ' + error.message 
    }, 500)
  }
})

// 🔧 健康检查API
// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0' })
})

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from AI HTML Generator!', status: 'ok' })
})

// 🧪 WordPress兼容性测试API
app.post('/api/test/wordpress-convert', async (c) => {
  try {
    const { base64Data, altText } = await c.req.json()
    
    if (!base64Data || !altText) {
      return c.json({ success: false, error: 'Missing base64Data or altText' }, 400)
    }
    
    // 测试WordPress转换功能
    const jobId = 'test-wp-' + Date.now()
    const imageIndex = 1
    
    console.log(`🧪 Testing WordPress conversion for jobId: ${jobId}`)
    
    // 上传到R2临时存储
    const baseUrl = new URL(c.req.url).origin
    const tempUrl = await uploadBase64ToTempR2(c.env, base64Data, altText, jobId, imageIndex, baseUrl)
    
    return c.json({ 
      success: true, 
      tempUrl,
      message: 'WordPress compatibility test successful',
      expires: '6 hours from now'
    })
  } catch (error) {
    console.error('WordPress test error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 🧪 ByteDance Jimeng 4.0 连接测试API
app.post('/api/test/bytedance', async (c) => {
  try {
    const { apiKey, model } = await c.req.json()
    
    if (!apiKey) {
      return c.json({ success: false, error: 'Missing ARK API Key' }, 400)
    }
    
    console.log('[ByteDance Test] 测试连接开始...', { model })
    
    // 发送简单的测试请求到字节跳动ARK API
    const testResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'doubao-seedream-4-0-250828',
        prompt: '测试连接',
        size: '1024x1024',
        sequential_image_generation: 'disabled',
        stream: false,
        response_format: 'url',
        watermark: true
      })
    })
    
    const result = await testResponse.json()
    console.log('[ByteDance Test] API响应:', { status: testResponse.status, result })
    
    if (testResponse.ok && result.data) {
      return c.json({ 
        success: true, 
        message: 'ByteDance ARK API连接成功',
        model: result.model,
        created: result.created
      })
    } else {
      return c.json({ 
        success: false, 
        error: result.error?.message || `API返回错误: ${testResponse.status}`
      }, testResponse.status)
    }
    
  } catch (error) {
    console.error('[ByteDance Test] 连接测试失败:', error)
    return c.json({ 
      success: false, 
      error: error.message || '网络连接失败'
    }, 500)
  }
})

// 🔄 图片代理API（绕过R2公开访问问题）
app.get('/api/proxy/image/:jobId/:filename', async (c) => {
  try {
    const jobId = c.req.param('jobId')
    const filename = c.req.param('filename')
    
    if (!jobId || !filename) {
      return c.json({ error: 'Job ID and filename required' }, 400)
    }
    
    const imagePath = `temp/${jobId}/${filename}`
    
    // 从R2获取图片
    const object = await c.env.R2.get(imagePath)
    
    if (!object) {
      return c.json({ error: 'Image not found' }, 404)
    }
    
    // 检查过期时间
    if (object.customMetadata?.expiresAt) {
      const expiresAt = parseInt(object.customMetadata.expiresAt)
      if (Date.now() > expiresAt) {
        return c.json({ error: 'Image expired' }, 410)
      }
    }
    
    // 返回图片
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Image proxy error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================================
// 🚀 V2 API Routes - Enhanced Image Models Support
// ===============================================

// 图片提供商配置管理
app.get('/api/v2/image-providers', async (c) => {
  try {
    const providers = [
      {
        id: "alibaba-dashscope",
        name: "阿里通义万相",
        category: "commercial",
        models: ["wanx-v1", "alt_diffusion_v2"],
        capabilities: ["text2img", "style_transfer"],
        requiresApiKey: true,
        configSchema: {
          apiKey: { type: "string", required: true },
          model: { type: "string", default: "wanx-v1" },
          size: { type: "string", default: "1024*1024", enum: ["1024*1024", "720*1280", "1280*720"] },
          negative_prompt: { type: "string", required: false },
          n: { type: "integer", default: 1, min: 1, max: 4 },
          seed: { type: "integer", required: false }
        }
      },
      {
        id: "bytedance-ark",
        name: "字节跳动即梦4.0",
        category: "commercial",
        models: ["doubao-seedream-4-0", "doubao-seedream-3-0-t2i"],
        capabilities: ["text2img", "img2img", "sequential_generation"],
        requiresApiKey: true,
        configSchema: {
          apiKey: { type: "string", required: true },
          model: { type: "string", default: "doubao-seedream-4-0-250828" },
          size: { type: "string", default: "2K", enum: ["1K", "2K"] },
          sequential_image_generation: { type: "string", default: "disabled", enum: ["disabled", "auto"] },
          response_format: { type: "string", default: "url" },
          watermark: { type: "boolean", default: true }
        }
      },
      {
        id: "stability-ai",
        name: "Stability AI",
        category: "commercial",
        models: ["stable-image-ultra", "stable-image-core", "sd3.5-large"],
        capabilities: ["text2img", "high_quality"],
        requiresApiKey: true,
        configSchema: {
          apiKey: { type: "string", required: true },
          model: { type: "string", default: "stable-image-ultra" },
          output_format: { type: "string", default: "webp", enum: ["webp", "png", "jpeg"] },
          aspect_ratio: { type: "string", default: "1:1" },
          seed: { type: "integer", required: false }
        }
      },
      {
        id: "hugging-face",
        name: "Hugging Face",
        category: "opensource",
        models: ["black-forest-labs/FLUX.1-dev", "ByteDance/SDXL-Lightning"],
        capabilities: ["text2img", "opensource"],
        requiresApiKey: true,
        configSchema: {
          apiKey: { type: "string", required: true },
          model: { type: "string", default: "black-forest-labs/FLUX.1-dev" },
          baseUrl: { type: "string", required: false },
          guidance_scale: { type: "number", default: 7.5 },
          num_inference_steps: { type: "number", default: 50 },
          seed: { type: "integer", required: false }
        }
      },
      {
        id: "replicate",
        name: "Replicate",
        category: "opensource", 
        models: ["flux-schnell", "flux-dev", "flux-1.1-pro"],
        capabilities: ["text2img", "high_performance"],
        requiresApiKey: true,
        configSchema: {
          apiKey: { type: "string", required: true },
          model: { type: "string", default: "black-forest-labs/flux-schnell" },
          width: { type: "integer", default: 1024 },
          height: { type: "integer", default: 1024 },
          guidance_scale: { type: "number", required: false },
          num_inference_steps: { type: "integer", required: false },
          seed: { type: "integer", required: false }
        }
      }
    ]

    return c.json({ providers })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return c.json({ error: 'Failed to fetch providers' }, 500)
  }
})

// 获取特定提供商详情
app.get('/api/v2/image-providers/:providerId', async (c) => {
  try {
    const providerId = c.req.param('providerId')
    
    const providerDetails = {
      "alibaba-dashscope": {
        id: "alibaba-dashscope",
        name: "阿里通义万相",
        description: "阿里云DashScope平台提供的文本到图像生成服务",
        baseUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image_synthesis",
        authType: "bearer",
        models: [
          {
            id: "wanx-v1",
            name: "通义万相 V1",
            capabilities: ["text2img", "style_transfer"],
            maxSize: "1024*1024",
            supportedSizes: ["1024*1024", "720*1280", "1280*720"]
          }
        ],
        parameters: {
          prompt: { type: "string", required: true, maxLength: 500 },
          negative_prompt: { type: "string", required: false, maxLength: 300 },
          size: { type: "string", default: "1024*1024" },
          n: { type: "integer", default: 1, min: 1, max: 4 },
          seed: { type: "integer", required: false }
        }
      },
      "bytedance-ark": {
        id: "bytedance-ark",
        name: "字节跳动即梦4.0",
        description: "字节跳动火山方舟平台的Seedream 4.0图像生成服务",
        baseUrl: "https://ark.cn-beijing.volces.com/api/v3/images/generations",
        authType: "bearer",
        models: [
          {
            id: "doubao-seedream-4-0-250828",
            name: "豆包-即梦4.0",
            capabilities: ["text2img", "img2img", "sequential_generation"],
            maxSize: "2K",
            supportedSizes: ["1K", "2K"]
          }
        ],
        parameters: {
          prompt: { type: "string", required: true, maxLength: 1000 },
          size: { type: "string", default: "2K" },
          sequential_image_generation: { type: "string", default: "disabled" },
          response_format: { type: "string", default: "url" },
          watermark: { type: "boolean", default: true }
        }
      },
      "stability-ai": {
        id: "stability-ai",
        name: "Stability AI",
        description: "Stability AI提供的高质量图像生成服务，包括Ultra、Core和SD3.5模型",
        baseUrl: "https://api.stability.ai/v2beta/stable-image/generate",
        authType: "bearer",
        models: [
          {
            id: "stable-image-ultra",
            name: "Stable Image Ultra",
            capabilities: ["text2img", "photorealistic", "high_quality"],
            maxSize: "1536x1536",
            supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
          },
          {
            id: "stable-image-core",
            name: "Stable Image Core",
            capabilities: ["text2img", "fast", "affordable"],
            maxSize: "1024x1024", 
            supportedRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
          },
          {
            id: "sd3.5-large",
            name: "Stable Diffusion 3.5 Large",
            capabilities: ["text2img", "open_source", "high_quality"],
            maxSize: "1024x1024",
            supportedRatios: ["1:1", "16:9", "9:16"]
          }
        ],
        parameters: {
          prompt: { type: "string", required: true, maxLength: 1000 },
          output_format: { type: "string", default: "webp", enum: ["webp", "png", "jpeg"] },
          aspect_ratio: { type: "string", default: "1:1" },
          seed: { type: "integer", required: false, min: 0, max: 4294967294 },
          style_preset: { type: "string", required: false }
        }
      },
      "hugging-face": {
        id: "hugging-face",
        name: "Hugging Face",
        description: "Hugging Face开源模型推理服务，支持FLUX、SDXL等热门开源模型",
        baseUrl: "https://api-inference.huggingface.co/models",
        authType: "bearer",
        models: [
          {
            id: "black-forest-labs/FLUX.1-dev",
            name: "FLUX.1 Dev",
            capabilities: ["text2img", "opensource", "high_quality"],
            maxSize: "1024x1024",
            supportedSizes: ["512x512", "768x768", "1024x1024"]
          },
          {
            id: "ByteDance/SDXL-Lightning",
            name: "SDXL Lightning",
            capabilities: ["text2img", "fast", "opensource"],
            maxSize: "1024x1024",
            supportedSizes: ["512x512", "768x768", "1024x1024"]
          },
          {
            id: "ByteDance/Hyper-SD",
            name: "Hyper-SD",
            capabilities: ["text2img", "fast", "efficient"],
            maxSize: "1024x1024",
            supportedSizes: ["512x512", "768x768", "1024x1024"]
          }
        ],
        parameters: {
          prompt: { type: "string", required: true, maxLength: 1000 },
          model: { type: "string", required: true },
          baseUrl: { type: "string", required: false, description: "自定义Inference Endpoint URL" },
          guidance_scale: { type: "number", default: 7.5, min: 1, max: 20 },
          num_inference_steps: { type: "number", default: 50, min: 1, max: 100 },
          seed: { type: "integer", required: false }
        }
      },
      "replicate": {
        id: "replicate",
        name: "Replicate",
        description: "Replicate平台提供的高性能AI模型推理服务，支持FLUX等前沿模型",
        baseUrl: "https://api.replicate.com/v1/models",
        authType: "bearer",
        models: [
          {
            id: "black-forest-labs/flux-schnell",
            name: "FLUX Schnell",
            capabilities: ["text2img", "fast", "opensource"],
            maxSize: "1024x1024",
            supportedSizes: ["256x256", "512x512", "768x768", "1024x1024"]
          },
          {
            id: "black-forest-labs/flux-dev",
            name: "FLUX Dev", 
            capabilities: ["text2img", "high_quality", "opensource"],
            maxSize: "1024x1024",
            supportedSizes: ["256x256", "512x512", "768x768", "1024x1024"]
          },
          {
            id: "black-forest-labs/flux-1.1-pro",
            name: "FLUX 1.1 Pro",
            capabilities: ["text2img", "commercial", "prompt_upsampling"],
            maxSize: "1024x1024", 
            supportedSizes: ["256x256", "512x512", "768x768", "1024x1024"]
          }
        ],
        parameters: {
          prompt: { type: "string", required: true, maxLength: 1000 },
          model: { type: "string", required: true },
          width: { type: "integer", default: 1024, min: 256, max: 1024 },
          height: { type: "integer", default: 1024, min: 256, max: 1024 },
          guidance_scale: { type: "number", required: false, min: 1, max: 20 },
          num_inference_steps: { type: "integer", required: false, min: 1, max: 100 },
          seed: { type: "integer", required: false },
          prompt_upsampling: { type: "boolean", required: false, description: "仅FLUX 1.1 Pro支持" }
        }
      }
    }

    const provider = providerDetails[providerId as keyof typeof providerDetails]
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404)
    }

    return c.json(provider)
  } catch (error) {
    console.error('Error fetching provider details:', error)
    return c.json({ error: 'Failed to fetch provider details' }, 500)
  }
})

// 统一图片生成入口
app.post('/api/v2/image-generate', async (c) => {
  try {
    const { provider, model, prompt, config, metadata } = await c.req.json()

    // 参数验证
    if (!provider || !prompt) {
      return c.json({ 
        error: 'Missing required parameters: provider and prompt are required' 
      }, 400)
    }

    // 验证需要API Key的提供商
    const providersNeedingApiKey = ['alibaba-dashscope', 'bytedance-ark', 'stability-ai', 'hugging-face', 'replicate']
    if (providersNeedingApiKey.includes(provider) && !config?.apiKey) {
      return c.json({ 
        error: `API key is required for provider: ${provider}` 
      }, 400)
    }

    // 生成唯一任务ID
    const taskId = `img_task_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // 将任务状态存储到KV
    await c.env.JOBS.put(`v2_${taskId}`, JSON.stringify({
      taskId,
      status: 'processing',
      provider,
      model,
      prompt,
      metadata,
      createdAt: Date.now(),
      startedAt: Date.now()
    }), { expirationTtl: 3600 }) // 1小时后过期

    // 异步处理图片生成（不等待完成）
    c.executionCtx.waitUntil(
      processImageGeneration(c.env, taskId, provider, model, prompt, config, metadata)
    )

    return c.json({
      taskId,
      status: 'processing',
      provider,
      estimatedTime: 30,
      message: '图片生成任务已提交'
    })

  } catch (error) {
    console.error('Error submitting image generation task:', error)
    return c.json({ error: 'Failed to submit image generation task' }, 500)
  }
})

// 查询图片生成状态
app.get('/api/v2/image-generate/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId')
    
    if (!taskId) {
      return c.json({ error: 'Task ID is required' }, 400)
    }

    // 从KV获取任务状态
    const taskData = await c.env.JOBS.get(`v2_${taskId}`)
    
    if (!taskData) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const task = JSON.parse(taskData)
    
    return c.json(task)

  } catch (error) {
    console.error('Error fetching task status:', error)
    return c.json({ error: 'Failed to fetch task status' }, 500)
  }
})

// 配置管理路由（可选，用于会话级别配置）
app.post('/api/v2/config/session', async (c) => {
  try {
    const { provider, config, apiKeyHash } = await c.req.json()

    if (!provider || !config) {
      return c.json({ error: 'Provider and config are required' }, 400)
    }

    // 这里可以实现会话级别的配置缓存（加密存储）
    // 暂时返回成功状态
    return c.json({ 
      success: true, 
      message: 'Configuration saved for session',
      provider 
    })

  } catch (error) {
    console.error('Error saving session config:', error)
    return c.json({ error: 'Failed to save session config' }, 500)
  }
})

// ===============================================
// 🔧 Image Generation Processing Functions
// ===============================================

// 异步处理图片生成的主函数
async function processImageGeneration(
  env: CloudflareBindings,
  taskId: string, 
  provider: string,
  model: string,
  prompt: string,
  config: any,
  metadata: any
) {
  try {
    // 更新任务状态为处理中
    await updateTaskStatus(env, taskId, 'processing', { progress: 10 })

    let result
    
    // 🔧 确保配置对象包含模型信息
    const enhancedConfig = {
      ...config,
      model: model // 确保模型信息传递到生成函数
    }
    
    // 根据不同提供商调用相应的生成函数
    switch (provider) {
      case 'alibaba-dashscope':
        result = await generateWithAlibaba(prompt, enhancedConfig, env, taskId)
        break
      case 'bytedance-ark':
        result = await generateWithBytedance(prompt, enhancedConfig, env, taskId)
        break
      case 'stability-ai':
        result = await generateWithStability(prompt, enhancedConfig, env, taskId)
        break
      case 'hugging-face':
        result = await generateWithHuggingFace(prompt, enhancedConfig, env, taskId)
        break
      case 'replicate':
        result = await generateWithReplicate(prompt, enhancedConfig, env, taskId)
        break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    // 如果生成成功，存储图片到R2并更新任务状态
    if (result.success && result.imageData) {
      const imageUrl = await storeGeneratedImage(env, result.imageData, taskId)
      
      await updateTaskStatus(env, taskId, 'completed', {
        result: {
          imageUrl,
          proxyUrl: imageUrl, // 使用相对路径，由前端自动处理域名
          wordpressCompatibleUrl: imageUrl,
          metadata: {
            width: result.width || 1024,
            height: result.height || 1024,
            format: result.format || 'jpeg',
            seed: result.seed,
            generationTime: result.generationTime
          }
        }
      })
    } else {
      // 生成失败，更新错误状态
      await updateTaskStatus(env, taskId, 'failed', {
        error: result.error || 'Image generation failed'
      })
    }

  } catch (error) {
    console.error(`Image generation failed for task ${taskId}:`, error)
    await updateTaskStatus(env, taskId, 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 更新任务状态的辅助函数
async function updateTaskStatus(env: CloudflareBindings, taskId: string, status: string, additionalData: any = {}) {
  try {
    const existingData = await env.JOBS.get(`v2_${taskId}`)
    if (existingData) {
      const task = JSON.parse(existingData)
      const updatedTask = {
        ...task,
        status,
        updatedAt: Date.now(),
        ...additionalData
      }
      
      await env.JOBS.put(`v2_${taskId}`, JSON.stringify(updatedTask), { expirationTtl: 3600 })
    }
  } catch (error) {
    console.error(`Failed to update task status for ${taskId}:`, error)
  }
}

// 将生成的图片存储到R2的辅助函数
async function storeGeneratedImage(env: CloudflareBindings, imageBuffer: ArrayBuffer, taskId: string): Promise<string> {
  const imageId = `enhanced_${taskId}_${Date.now()}`
  const key = `temp-images/${imageId}.jpg`
  
  await env.R2.put(key, imageBuffer, {
    httpMetadata: { 
      contentType: 'image/jpeg',
    },
    customMetadata: {
      taskId,
      createdAt: Date.now().toString(),
      expiresAt: (Date.now() + 6 * 60 * 60 * 1000).toString() // 6小时后过期
    }
  })
  
  return `/api/image-proxy/${imageId}.jpg`
}

// ===============================================
// 🎨 Provider-specific Generation Functions (Placeholders)
// ===============================================

// 阿里巴巴DashScope生成函数
async function generateWithAlibaba(prompt: string, config: any, env: CloudflareBindings, taskId: string) {
  try {
    await updateTaskStatus(env, taskId, 'processing', { progress: 20, message: '正在连接阿里云DashScope...' })

    // 🚀 增强模型识别和API规范支持
    const model = config.model || "wanx-v1"
    const isQwenImage = model.includes('qwen-image')
    const isWanxModel = model.includes('wanx') || model.includes('wan2.') || model.includes('alt_diffusion')
    
    console.log(`🔍 模型类型检测: ${model}`, { isQwenImage, isWanxModel })
    
    // 📍 根据官方文档确定正确的API端点
    let requestBody, apiUrl, useAsync = false
    
    if (isQwenImage) {
      // 🎯 QWEN-Image API (通义千问文生图) - 支持同步和异步
      apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
      
      // 参数验证
      const size = config.size || "1328*1328"
      const validSizes = ["1664*928", "1472*1140", "1328*1328", "1140*1472", "928*1664"]
      if (!validSizes.includes(size)) {
        throw new Error(`无效的图像尺寸: ${size}。支持的尺寸: ${validSizes.join(', ')}`)
      }
      
      requestBody = {
        model: model,
        input: {
          messages: [{
            role: "user",
            content: [{ text: prompt }]
          }]
        },
        parameters: {
          size: size,
          n: 1, // QWEN-Image 当前仅支持生成1张图像
          negative_prompt: config.negative_prompt || "",
          prompt_extend: config.prompt_extend !== false, // 默认开启智能改写
          watermark: config.watermark || false
        }
      }
      
      // 添加随机种子 (范围 [0, 2147483647])
      if (config.seed !== undefined && config.seed !== null) {
        const seed = parseInt(config.seed)
        if (seed >= 0 && seed <= 2147483647) {
          requestBody.parameters.seed = seed
        }
      }
      
    } else if (isWanxModel) {
      // 🎯 通义万相 API (WanX) - 文生图专用
      apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image_synthesis'
      
      // 参数验证
      const size = config.size || "1024*1024"
      const validSizes = ["1024*1024", "720*1280", "1280*720"]
      if (!validSizes.includes(size)) {
        throw new Error(`通义万相无效尺寸: ${size}。支持的尺寸: ${validSizes.join(', ')}`)
      }
      
      // 生成数量验证 (范围 [1, 4])
      const n = Math.min(Math.max(parseInt(config.n) || 1, 1), 4)
      
      requestBody = {
        model: model,
        input: {
          prompt: prompt
        },
        parameters: {
          size: size,
          n: n
        }
      }
      
      // 可选参数
      if (config.negative_prompt?.trim()) {
        requestBody.input.negative_prompt = config.negative_prompt.trim()
      }
      
      if (config.seed !== undefined && config.seed !== null) {
        const seed = parseInt(config.seed)
        if (seed >= 0) {
          requestBody.parameters.seed = seed
        }
      }
      
      if (config.style?.trim()) {
        requestBody.parameters.style = config.style.trim()
      }
      
    } else {
      throw new Error(`不支持的模型: ${model}。请选择 qwen-image-* 或 wanx-* 模型`)
    }

    // 🧹 清理空值参数
    if (requestBody.parameters) {
      Object.keys(requestBody.parameters).forEach(key => {
        if (requestBody.parameters[key] === undefined || requestBody.parameters[key] === "" || requestBody.parameters[key] === null) {
          delete requestBody.parameters[key]
        }
      })
    }
    
    if (requestBody.input?.negative_prompt === "") {
      delete requestBody.input.negative_prompt
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 40, message: '正在提交生成任务...' })

    const startTime = Date.now()
    
    // 🔧 构建请求头 - 支持异步模式检测
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
    
    // 🔀 自动检测是否需要异步模式（大批量或复杂任务）
    const shouldUseAsync = isWanxModel && (requestBody.parameters?.n > 1 || prompt.length > 500)
    if (shouldUseAsync) {
      headers['X-DashScope-Async'] = 'enable'
      useAsync = true
    }
    
    console.log(`🚀 DashScope API调用:`, { 
      model, 
      apiUrl, 
      useAsync, 
      requestBody: JSON.stringify(requestBody, null, 2) 
    })
    
    // 🌐 提交图片生成任务
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DashScope API 错误:', { status: response.status, response: errorText })
      throw new Error(`阿里云DashScope API 错误 (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('📥 DashScope API 响应:', result)
    
    // 🔄 处理API响应 - 根据官方文档格式
    if (result.code) {
      throw new Error(`DashScope API 错误: ${result.code} - ${result.message || '未知错误'}`)
    }
    
    if (useAsync || (result.output?.task_id && result.output?.task_status)) {
      // 📋 异步任务模式 - 需要轮询结果
      const taskResultId = result.output.task_id
      console.log(`🔄 异步任务已创建: ${taskResultId}`)
      
      await updateTaskStatus(env, taskId, 'processing', { progress: 60, message: '任务已提交，等待处理...' })

      // 📊 轮询获取生成结果 - 根据官方文档建议
      return await handleDashScopeAsyncTask(taskResultId, config.apiKey, env, taskId, startTime, config.seed)
      
    } else if (result.output?.choices) {
      // 🎯 同步响应模式 (QWEN-Image)
      return await handleDashScopeSyncResponse(result, startTime, config.seed)
    } else {
      throw new Error(`未知的DashScope API响应格式: ${JSON.stringify(result)}`)
    }

  } catch (error) {
    console.error('阿里云DashScope生成失败:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
      generationTime: 0
    }
  }
}

// 🚀 阿里巴巴DashScope统一生成函数 - 支持多模型和地域
async function generateWithDashScope(prompt: string, config: any, env: CloudflareBindings, taskId: string) {
  try {
    await updateTaskStatus(env, taskId, 'processing', { progress: 20, message: '正在连接阿里巴巴DashScope...' })

    // 🌍 地域选择 - 支持新加坡和北京
    const region = config.region || 'intl' // 默认使用国际版
    const baseUrl = region === 'intl' ? 
      'https://dashscope-intl.aliyuncs.com' : 
      'https://dashscope.aliyuncs.com'

    // 🎯 模型选择和API端点确定
    const model = config.model || 'wanx-v1'
    let apiEndpoint: string
    let requestBody: any
    let isAsync = false

    // 根据模型选择合适的API端点和请求格式
    if (model.startsWith('qwen-image')) {
      // QWEN-Image系列：使用同步multimodal-generation端点
      apiEndpoint = `${baseUrl}/api/v1/services/aigc/multimodal-generation/generation`
      requestBody = buildQwenImageRequest(model, prompt, config)
    } else if (model.startsWith('wanx') || model.includes('diffusion')) {
      // WanX系列：根据配置选择同步或异步
      isAsync = config.async !== false // 默认使用异步
      if (isAsync) {
        apiEndpoint = `${baseUrl}/api/v1/services/aigc/text2image/image-synthesis`
      } else {
        apiEndpoint = `${baseUrl}/api/v1/services/aigc/multimodal-generation/generation`
      }
      requestBody = buildWanxRequest(model, prompt, config)
    } else {
      // OpenAI兼容模式
      apiEndpoint = `${baseUrl}/compatible-mode/v1/chat/completions`
      requestBody = buildOpenAICompatibleRequest(model, prompt, config)
      isAsync = false // OpenAI兼容模式使用同步或流式
    }

    console.log(`🚀 [DashScope] Using endpoint: ${apiEndpoint}`)
    console.log(`📋 [DashScope] Request model: ${model}, async: ${isAsync}`)

    await updateTaskStatus(env, taskId, 'processing', { progress: 40, message: '正在提交生成任务...' })

    const headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }

    // 异步调用需要额外的头
    if (isAsync) {
      headers['X-DashScope-Async'] = 'enable'
    }

    const startTime = Date.now()

    // 🌐 调用DashScope API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DashScope API错误 (${response.status}): ${errorText}`)
    }

    const result = await response.json()

    // 🔄 处理不同的响应类型
    if (isAsync) {
      // 异步任务：获取task_id并轮询
      const dashscopeTaskId = result.output?.task_id
      if (!dashscopeTaskId) {
        throw new Error('异步任务创建失败：未获取到task_id')
      }

      console.log(`⏳ [DashScope] 异步任务创建成功: ${dashscopeTaskId}`)
      return await handleDashScopeAsyncTask(dashscopeTaskId, config.apiKey, env, taskId, startTime, baseUrl, config.seed)
    } else if (apiEndpoint.includes('compatible-mode')) {
      // OpenAI兼容模式：处理聊天完成响应
      console.log(`🤖 [DashScope] OpenAI兼容模式处理`)
      return await handleOpenAICompatibleResponse(response, env, taskId, startTime, requestBody.stream || false)
    } else {
      // 同步任务：直接处理结果
      console.log(`✅ [DashScope] 同步任务完成`)
      return await handleDashScopeSyncResponse(result, startTime, config.seed)
    }

  } catch (error) {
    console.error('阿里巴巴DashScope生成失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 🔧 构建QWEN-Image请求体
function buildQwenImageRequest(model: string, prompt: string, config: any) {
  return {
    model: model,
    input: {
      messages: [{
        role: "user",
        content: [{
          text: prompt
        }]
      }]
    },
    parameters: {
      size: config.size || "1328*1328",
      negative_prompt: config.negative_prompt || "",
      prompt_extend: config.prompt_extend !== false, // 默认开启智能改写
      watermark: config.watermark !== true, // 默认不添加水印
      seed: config.seed,
      n: 1 // 当前仅支持生成1张图像
    }
  }
}

// 🔧 构建WanX请求体
function buildWanxRequest(model: string, prompt: string, config: any) {
  return {
    model: model,
    input: {
      prompt: prompt,
      negative_prompt: config.negative_prompt || ""
    },
    parameters: {
      size: config.size || "1024*1024",
      n: 1,
      seed: config.seed,
      style: config.style,
      model_version: config.model_version
    }
  }
}

// 🔧 构建OpenAI兼容请求体 - 针对图像生成优化
function buildOpenAICompatibleRequest(model: string, prompt: string, config: any) {
  // 为图像生成任务构建合适的聊天请求
  // 注意：DashScope的OpenAI兼容模式主要用于文本生成
  // 对于图像生成，我们构造一个请求图像描述的消息
  const imageGenerationPrompt = `Please provide a detailed description for generating this image: "${prompt}". Include specific details about style, composition, colors, lighting, and artistic elements that would help create a high-quality image.`
  
  return {
    model: model,
    messages: [{
      role: "user",
      content: imageGenerationPrompt
    }],
    stream: config.stream || false,
    max_tokens: config.max_tokens || 1000,
    temperature: config.temperature || 0.7,
    top_p: config.top_p || 0.9,
    presence_penalty: config.presence_penalty,
    frequency_penalty: config.frequency_penalty
  }
}

// 🌊 处理DashScope OpenAI兼容模式响应
async function handleOpenAICompatibleResponse(response: Response, env: CloudflareBindings, taskId: string, startTime: number, isStream: boolean) {
  if (isStream) {
    return await handleOpenAIStreamResponse(response, env, taskId, startTime)
  } else {
    return await handleOpenAINormalResponse(response, env, taskId, startTime)
  }
}



// 📋 处理OpenAI兼容模式普通响应 - 增强图像生成逻辑
async function handleOpenAINormalResponse(response: Response, env: CloudflareBindings, taskId: string, startTime: number) {
  const result = await response.json()
  
  await updateTaskStatus(env, taskId, 'processing', { progress: 60, message: '正在解析OpenAI响应...' })

  // 检查响应格式
  if (!result.choices || result.choices.length === 0) {
    throw new Error('OpenAI兼容模式响应格式错误：缺少choices')
  }

  const choice = result.choices[0]
  const enhancedPrompt = choice.message?.content

  if (!enhancedPrompt) {
    throw new Error('OpenAI兼容模式未生成有效内容')
  }

  console.log(`🎨 [OpenAI兼容] 获得增强提示词: ${enhancedPrompt.substring(0, 100)}...`)

  // 使用增强的提示词调用实际的图像生成API (WanX)
  await updateTaskStatus(env, taskId, 'processing', { progress: 70, message: '使用增强提示词生成图像...' })
  
  try {
    // 构建WanX请求来实际生成图像
    const wanxRequest = {
      model: "wanx-v1",
      input: {
        prompt: enhancedPrompt,
        negative_prompt: "low quality, blurry, distorted"
      },
      parameters: {
        size: "1024*1024",
        n: 1
      }
    }

    // 确定API端点（使用异步WanX）
    const baseUrl = 'https://dashscope-intl.aliyuncs.com'
    const wanxEndpoint = `${baseUrl}/api/v1/services/aigc/text2image/image-synthesis`

    // 调用WanX API
    const wanxResponse = await fetch(wanxEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': response.headers.get('authorization') || '',
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify(wanxRequest)
    })

    if (wanxResponse.ok) {
      const wanxResult = await wanxResponse.json()
      const taskId = wanxResult.output?.task_id
      
      if (taskId) {
        // 使用现有的异步轮询机制
        return await handleDashScopeAsyncTask(taskId, '', env, taskId, startTime, baseUrl)
      }
    }
  } catch (wanxError) {
    console.warn('WanX生成失败，使用增强提示词的占位符:', wanxError)
  }

  // 如果WanX调用失败，使用Pollinations AI作为后备
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${Date.now()}`
  
  const generationTime = (Date.now() - startTime) / 1000

  return {
    success: true,
    imageUrl: fallbackUrl,
    width: 1024,
    height: 1024,
    format: 'png',
    generationTime,
    metadata: {
      model: result.model,
      originalPrompt: enhancedPrompt,
      enhancedPrompt: enhancedPrompt,
      usage: result.usage,
      mode: 'openai-compatible-enhanced',
      fallbackUsed: true
    }
  }
}

// 🌊 处理OpenAI兼容模式流式响应 - 增强图像生成逻辑
async function handleOpenAIStreamResponse(response: Response, env: CloudflareBindings, taskId: string, startTime: number) {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法读取OpenAI流式响应')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let contentParts: string[] = []
  let usage: any = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataContent = line.substring(6).trim()
          
          if (dataContent === '[DONE]') {
            break
          }

          try {
            const eventData = JSON.parse(dataContent)
            
            if (eventData.choices && eventData.choices[0]?.delta?.content) {
              contentParts.push(eventData.choices[0].delta.content)
              
              await updateTaskStatus(env, taskId, 'processing', { 
                progress: Math.min(30 + (contentParts.length * 2), 60),
                message: `正在接收流式增强提示词... (${contentParts.length} 部分)`
              })
            }

            if (eventData.usage) {
              usage = eventData.usage
            }
          } catch (parseError) {
            console.warn('解析OpenAI SSE事件失败:', parseError, '原始数据:', dataContent)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  const enhancedPrompt = contentParts.join('')

  if (!enhancedPrompt) {
    throw new Error('OpenAI流式响应未获取到有效内容')
  }

  console.log(`🎨 [OpenAI兼容流式] 获得增强提示词: ${enhancedPrompt.substring(0, 100)}...`)

  // 使用增强的提示词生成实际图像
  await updateTaskStatus(env, taskId, 'processing', { progress: 70, message: '使用增强提示词生成图像...' })
  
  // 使用Pollinations AI作为后备图像生成器（因为我们在流式模式中难以调用其他异步API）
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${Date.now()}`
  
  const generationTime = (Date.now() - startTime) / 1000

  return {
    success: true,
    imageUrl: imageUrl,
    width: 1024,
    height: 1024,
    format: 'png',
    generationTime,
    metadata: {
      originalPromptParts: contentParts.length,
      enhancedPrompt: enhancedPrompt,
      usage,
      mode: 'openai-compatible-stream-enhanced',
      fallbackUsed: true
    }
  }
}

// 🔄 处理DashScope异步任务轮询 - 更新版本
async function handleDashScopeAsyncTask(taskId: string, apiKey: string, env: CloudflareBindings, ourTaskId: string, startTime: number, baseUrl: string, seed?: any) {
  let attempts = 0
  const maxAttempts = 60 // 最多等待5分钟，建议间隔3秒
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000)) // 官方建议3秒间隔
    attempts++
    
    await updateTaskStatus(env, ourTaskId, 'processing', { 
      progress: Math.min(60 + attempts * 2, 95),
      message: `正在生成图片... (${attempts}/${maxAttempts})`
    })

    try {
      // 使用正确的baseUrl进行状态查询
      const statusResponse = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!statusResponse.ok) {
        console.warn(`状态查询失败: ${statusResponse.status}`)
        if (attempts < 3) continue // 前几次失败继续重试
        throw new Error(`状态查询失败: ${statusResponse.status}`)
      }

      const statusResult = await statusResponse.json()
      console.log(`📋 任务状态 (${attempts}):`, statusResult)
      
      const taskStatus = statusResult.output?.task_status
      
      switch (taskStatus) {
        case 'SUCCEEDED':
          // 🎉 任务成功
          const results = statusResult.output?.results
          if (!results || results.length === 0) {
            throw new Error('任务成功但未获取到生成的图片')
          }

          // 下载第一张图片
          const imageUrl = results[0].url
          if (!imageUrl) {
            throw new Error('图片URL为空')
          }

          console.log(`📥 下载图片: ${imageUrl}`)
          const imageResponse = await fetch(imageUrl)
          
          if (!imageResponse.ok) {
            throw new Error(`图片下载失败: ${imageResponse.status}`)
          }

          const imageBuffer = await imageResponse.arrayBuffer()
          const generationTime = (Date.now() - startTime) / 1000

          return {
            success: true,
            imageData: imageBuffer,
            width: results[0].width || 1024,
            height: results[0].height || 1024,
            format: 'png',
            seed: seed,
            generationTime
          }
          
        case 'FAILED':
          throw new Error(`任务执行失败: ${statusResult.output?.message || '未知错误'}`)
          
        case 'CANCELED':
          throw new Error('任务已被取消')
          
        case 'UNKNOWN':
          throw new Error('任务不存在或已过期 (24小时)')
          
        case 'PENDING':
        case 'RUNNING':
          // 继续等待
          console.log(`⏳ 任务进行中: ${taskStatus}`)
          break
          
        default:
          console.warn(`未知任务状态: ${taskStatus}`)
          break
      }
      
    } catch (pollError) {
      console.warn(`轮询任务状态时出错 (${attempts}/${maxAttempts}):`, pollError)
      if (attempts >= maxAttempts - 5) {
        throw pollError // 最后几次失败就抛出错误
      }
      // 前面的失败继续重试
    }
  }

  throw new Error('图片生成超时 (5分钟)，请稍后重试')          
}

// 🎯 处理DashScope同步响应 (QWEN-Image)
async function handleDashScopeSyncResponse(result: any, startTime: number, seed?: any) {
  console.log('📥 处理同步响应:', result)
  
  const choices = result.output?.choices
  if (!choices || choices.length === 0) {
    throw new Error('同步响应中未找到choices数据')
  }

  const choice = choices[0]
  if (!choice?.message?.content) {
    throw new Error('响应格式错误：缺少message.content')
  }

  // 查找图像内容
  const imageContent = choice.message.content.find((c: any) => c.image)
  if (!imageContent?.image) {
    throw new Error('响应中未找到图片数据')
  }

  // 📥 下载图片
  const imageUrl = imageContent.image
  console.log(`📥 下载同步图片: ${imageUrl}`)
  
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error(`图片下载失败: ${imageResponse.status}`)
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const generationTime = (Date.now() - startTime) / 1000
  
  // 📐 获取图片尺寸信息
  const usage = result.usage || {}
  const width = usage.width || 1328
  const height = usage.height || 1328

  return {
    success: true,
    imageData: imageBuffer,
    width,
    height,
    format: 'png',
    seed: seed,
    generationTime,
    taskMetrics: result.output?.task_metrics
  }
}

// 🚀 字节跳动豆包即梦生成函数 (Ark API)
async function generateWithBytedance(prompt: string, config: any, env: CloudflareBindings, taskId: string) {
  try {
    await updateTaskStatus(env, taskId, 'processing', { progress: 20, message: '正在连接字节跳动即梦...' })

    // 🔧 根据模型确定参数和能力（基于官方文档）
    const model = config.model || "doubao-seedream-4-0-250828"
    const is4_0 = model.includes('seedream-4') || model.includes('4-0-250828')
    const is3_0_t2i = model.includes('seedream-3-0-t2i')
    const is3_0_i2i = model.includes('seededit-3-0-i2i')
    const is3_0 = is3_0_t2i || is3_0_i2i
    
    // ✅ 参数验证（根据文档规范）
    if (prompt.length > 600) { // 文档建议不超过600个英文单词
      console.warn('提示词过长，可能影响生成质量')
    }
    
    // 🎯 构建请求体（严格遵循文档规范）
    const requestBody: any = {
      model: model,
      prompt: prompt
    }
    
    // 📷 图片输入支持（仅4.0和3.0图生图模型）
    if (config.image) {
      if (is4_0 || is3_0_i2i) {
        if (Array.isArray(config.image)) {
          // 多图输入（仅4.0支持，最多10张）
          if (is4_0 && config.image.length <= 10) {
            requestBody.image = config.image
          } else {
            throw new Error('多图输入仅支持即梦4.0，且最多10张图片')
          }
        } else {
          // 单图输入
          requestBody.image = config.image
        }
      } else {
        throw new Error(`模型 ${model} 不支持图片输入`)
      }
    }
    
    // 📏 尺寸设置（根据文档支持的格式）
    if (config.size) {
      requestBody.size = config.size
    } else {
      // 默认尺寸设置
      if (is4_0) {
        requestBody.size = "2K" // 即梦4.0默认2K
      } else if (is3_0_t2i) {
        requestBody.size = "1024x1024" // 即梦3.0文生图默认
      } else if (is3_0_i2i) {
        requestBody.size = "adaptive" // 即梦3.0图生图默认自适应
      }
    }
    
    // 🎨 即梦4.0独有功能
    if (is4_0) {
      // 组图功能
      requestBody.sequential_image_generation = config.sequential_image_generation || "disabled"
      
      if (requestBody.sequential_image_generation === "auto" && config.sequential_image_generation_options) {
        requestBody.sequential_image_generation_options = config.sequential_image_generation_options
        
        // 验证组图限制（文档：参考图+生成图≤ 15张）
        const refImageCount = Array.isArray(requestBody.image) ? requestBody.image.length : (requestBody.image ? 1 : 0)
        const maxGeneratedImages = config.sequential_image_generation_options.max_images || 1
        if (refImageCount + maxGeneratedImages > 15) {
          throw new Error('参考图数量 + 生成图片数量不能超过15张')
        }
      }
      
      // 流式输出（仅4.0支持）
      if (config.stream !== undefined) {
        requestBody.stream = config.stream
      }
    }
    
    // 🎨 即梦3.0特有功能
    if (is3_0) {
      // 随机种子（仅3.0支持）
      if (config.seed !== undefined && config.seed >= -1 && config.seed <= 2147483647) {
        requestBody.seed = config.seed
      }
      
      // 引导强度（仅3.0支持）
      if (config.guidance_scale !== undefined) {
        if (config.guidance_scale >= 1 && config.guidance_scale <= 10) {
          requestBody.guidance_scale = config.guidance_scale
        } else {
          throw new Error('guidance_scale 参数必须在 [1, 10] 范围内')
        }
      } else {
        // 默认引导强度
        if (is3_0_i2i) {
          requestBody.guidance_scale = 5.5 // 图生图默认
        } else if (is3_0_t2i) {
          requestBody.guidance_scale = 2.5 // 文生图默认
        }
      }
    }
    
    // 🌊 通用参数
    requestBody.response_format = config.response_format || "url" // 默认返回URL
    requestBody.watermark = config.watermark !== false // 默认添加水印

    await updateTaskStatus(env, taskId, 'processing', { progress: 40, message: '正在提交生成任务...' })

    const startTime = Date.now()
    
    // 🌐 调用字节跳动Ark API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`字节跳动Ark API错误 (${response.status}): ${errorText}`)
    }

    // 🌊 判断是否为流式响应（必须在解析响应之前判断）
    if (requestBody.stream && is4_0) {
      return await handleBytedanceStreamResponse(response, env, taskId, startTime, requestBody)
    } else {
      return await handleBytedanceNormalResponse(response, env, taskId, startTime, requestBody)
    }

  } catch (error) {
    console.error('字节跳动即梦生成失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 🌊 处理ByteDance流式响应 (SSE)
async function handleBytedanceStreamResponse(response: Response, env: CloudflareBindings, taskId: string, startTime: number, requestBody: any) {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法读取流式响应')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  const generatedImages: any[] = []
  let completed = false
  let usage: any = null

  try {
    while (!completed) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        // 🔧 正确处理SSE格式：分别处理event行和data行
        if (line.startsWith('event: ')) {
          // 事件类型行，暂时不需要处理（事件类型包含在data的JSON中）
          continue
        } else if (line.startsWith('data: ')) {
          const dataContent = line.substring(6)
          
          if (dataContent === '[DONE]') {
            completed = true
            break
          }

          try {
            const eventData = JSON.parse(dataContent)
            
            if (eventData.type === 'image_generation.partial_succeeded') {
              generatedImages.push({
                url: eventData.url,
                size: eventData.size,
                index: eventData.image_index
              })
              
              await updateTaskStatus(env, taskId, 'processing', { 
                progress: Math.min(60 + (generatedImages.length * 10), 90),
                message: `已生成 ${generatedImages.length} 张图片...`
              })
              
            } else if (eventData.type === 'image_generation.partial_failed') {
              console.warn(`图片生成失败 (index: ${eventData.image_index}):`, eventData.error)
              
            } else if (eventData.type === 'image_generation.completed') {
              usage = eventData.usage
              completed = true
            }
          } catch (parseError) {
            console.warn('解析SSE事件失败:', parseError, '原始数据:', dataContent)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (generatedImages.length === 0) {
    throw new Error('流式生成未获取到任何图片')
  }

  // 下载第一张图片
  const firstImage = generatedImages[0]
  const imageResponse = await fetch(firstImage.url)
  
  if (!imageResponse.ok) {
    throw new Error(`图片下载失败: ${imageResponse.status}`)
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const generationTime = (Date.now() - startTime) / 1000
  
  // 解析尺寸
  let width = 1024, height = 1024
  if (firstImage.size) {
    const sizeParts = firstImage.size.split('x')
    if (sizeParts.length === 2) {
      width = parseInt(sizeParts[0])
      height = parseInt(sizeParts[1])
    }
  }

  return {
    success: true,
    imageData: imageBuffer,
    width,
    height,
    format: 'jpeg',
    generationTime,
    metadata: {
      model: requestBody.model,
      size: requestBody.size,
      watermark: requestBody.watermark,
      sequential_image_generation: requestBody.sequential_image_generation,
      stream: true,
      totalImages: generatedImages.length,
      usage
    }
  }
}

// 📋 处理ByteDance普通响应
async function handleBytedanceNormalResponse(response: Response, env: CloudflareBindings, taskId: string, startTime: number, requestBody: any) {
  const result = await response.json()
  
  // 📊 检查API响应
  if (!result.data || result.error) {
    const errorMsg = result.error?.message || result.message || '未知错误'
    throw new Error(`生成失败: ${errorMsg}`)
  }

  await updateTaskStatus(env, taskId, 'processing', { progress: 80, message: '正在处理生成结果...' })

  // 📸 处理生成结果（支持多张图片）
  const imageData = result.data[0] // 取第一张图片
  
  if (!imageData || (!imageData.url && !imageData.b64_json)) {
    throw new Error('未获取到生成的图片数据')
  }

  let imageBuffer: ArrayBuffer
  
  if (imageData.url) {
    // URL格式图片
    const imageResponse = await fetch(imageData.url)
    if (!imageResponse.ok) {
      throw new Error(`图片下载失败: ${imageResponse.status}`)
    }
    imageBuffer = await imageResponse.arrayBuffer()
  } else if (imageData.b64_json) {
    // Base64格式图片
    const base64Data = imageData.b64_json.replace(/^data:image\/[a-z]+;base64,/, '')
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    imageBuffer = bytes.buffer
  } else {
    throw new Error('未知的图片数据格式')
  }

  const generationTime = (Date.now() - startTime) / 1000

  // 📐 解析尺寸信息
  let width = 1024, height = 1024
  
  if (imageData.size) {
    // 从返回的size字段解析
    const sizeParts = imageData.size.split('x')
    if (sizeParts.length === 2) {
      width = parseInt(sizeParts[0])
      height = parseInt(sizeParts[1])
    }
  } else if (requestBody.size) {
    // 从请求的size字段推断
    if (requestBody.size === "2K") {
      width = height = 2048
    } else if (requestBody.size === "1K") {
      width = height = 1024
    } else if (requestBody.size.includes('x')) {
      const sizeParts = requestBody.size.split('x')
      if (sizeParts.length === 2) {
        width = parseInt(sizeParts[0])
        height = parseInt(sizeParts[1])
      }
    }
  }

  return {
    success: true,
    imageData: imageBuffer,
    width,
    height,
    format: 'jpeg',
    generationTime,
    seed: result.seed,
    metadata: {
      model: requestBody.model,
      size: requestBody.size,
      watermark: requestBody.watermark,
      sequential_image_generation: requestBody.sequential_image_generation,
      guidance_scale: requestBody.guidance_scale,
      usage: result.usage
    }
  }
}

// Stability AI生成函数
async function generateWithStability(prompt: string, config: any, env: CloudflareBindings, taskId: string) {
  try {
    await updateTaskStatus(env, taskId, 'processing', { progress: 20, message: '正在连接Stability AI...' })

    // 根据模型选择不同的API端点
    const model = config.model || "stable-image-ultra"
    let apiEndpoint: string
    
    switch (model) {
      case 'stable-image-ultra':
        apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/generate/ultra'
        break
      case 'stable-image-core':
        apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core'
        break
      case 'sd3.5-large':
        apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/generate/sd3'
        break
      default:
        apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/generate/ultra'
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 40, message: '正在提交生成任务...' })

    // 构建FormData请求体
    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('output_format', config.output_format || 'webp')
    
    if (config.aspect_ratio) {
      formData.append('aspect_ratio', config.aspect_ratio)
    }
    if (config.seed) {
      formData.append('seed', config.seed.toString())
    }
    if (config.style_preset) {
      formData.append('style_preset', config.style_preset)
    }

    const startTime = Date.now()
    
    // 调用Stability AI API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Stability AI API 错误: ${response.status} - ${errorText}`)
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 80, message: '正在处理生成结果...' })

    // Stability AI直接返回图片二进制数据
    const imageBuffer = await response.arrayBuffer()
    const generationTime = (Date.now() - startTime) / 1000

    // 从响应头获取一些元数据
    const contentType = response.headers.get('content-type') || 'image/webp'
    const format = contentType.split('/')[1] || 'webp'

    // 解析尺寸（Stability AI通常返回标准尺寸）
    let width = 1024, height = 1024
    if (config.aspect_ratio) {
      const [w, h] = config.aspect_ratio.split(':').map(Number)
      if (w && h) {
        const scale = 1024 / Math.max(w, h)
        width = Math.round(w * scale)
        height = Math.round(h * scale)
      }
    }

    return {
      success: true,
      imageData: imageBuffer,
      width,
      height,
      format,
      seed: config.seed,
      generationTime,
      metadata: {
        model: model,
        output_format: config.output_format || 'webp',
        aspect_ratio: config.aspect_ratio
      }
    }

  } catch (error) {
    console.error('Stability AI生成失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// Hugging Face生成函数
async function generateWithHuggingFace(prompt: string, config: any, env: CloudflareBindings, taskId: string) {
  try {
    await updateTaskStatus(env, taskId, 'processing', { progress: 20, message: '正在连接Hugging Face...' })

    // 构建API URL
    let apiUrl: string
    if (config.baseUrl) {
      // 使用自定义Inference Endpoint (OpenAI兼容)
      apiUrl = `${config.baseUrl.replace(/\/$/, '')}/v1/images/generations`
    } else {
      // 使用公共Inference API
      const model = config.model || "black-forest-labs/FLUX.1-dev"
      apiUrl = `https://api-inference.huggingface.co/models/${model}`
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 40, message: '正在提交生成任务...' })

    let requestBody: any
    let headers: HeadersInit

    if (config.baseUrl) {
      // OpenAI兼容格式 (用于Inference Endpoints)
      requestBody = {
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      }
      headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    } else {
      // Hugging Face Inference API格式
      requestBody = {
        inputs: prompt,
        parameters: {
          guidance_scale: config.guidance_scale || 7.5,
          num_inference_steps: config.num_inference_steps || 50
        }
      }
      
      if (config.seed) {
        requestBody.parameters.seed = config.seed
      }

      headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    }

    const startTime = Date.now()
    
    // 调用Hugging Face API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Hugging Face API 错误: ${response.status} - ${errorText}`)
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 60, message: '正在处理API响应...' })

    let imageBuffer: ArrayBuffer

    if (config.baseUrl) {
      // OpenAI兼容响应格式
      const result = await response.json()
      if (!result.data || result.data.length === 0) {
        throw new Error('未获取到生成的图片URL')
      }
      
      const imageUrl = result.data[0].url
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`图片下载失败: ${imageResponse.status}`)
      }
      imageBuffer = await imageResponse.arrayBuffer()
      
    } else {
      // 直接的二进制响应
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.startsWith('application/json')) {
        // 可能是错误响应或需要等待的响应
        const result = await response.json()
        if (result.error) {
          throw new Error(`API错误: ${result.error}`)
        }
        if (result.estimated_time) {
          throw new Error(`模型正在加载，预计等待时间: ${result.estimated_time}秒`)
        }
      }
      
      imageBuffer = await response.arrayBuffer()
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 90, message: '正在保存图片...' })

    const generationTime = (Date.now() - startTime) / 1000

    return {
      success: true,
      imageData: imageBuffer,
      width: 1024,
      height: 1024,
      format: 'png',
      seed: config.seed,
      generationTime,
      metadata: {
        model: config.model || "black-forest-labs/FLUX.1-dev",
        guidance_scale: config.guidance_scale,
        num_inference_steps: config.num_inference_steps,
        inference_type: config.baseUrl ? 'endpoint' : 'public'
      }
    }

  } catch (error) {
    console.error('Hugging Face生成失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// Replicate生成函数
async function generateWithReplicate(prompt: string, config: any, env: CloudflareBindings, taskId: string) {
  try {
    await updateTaskStatus(env, taskId, 'processing', { progress: 20, message: '正在连接Replicate...' })

    // 构建模型URL
    const model = config.model || "black-forest-labs/flux-schnell"
    const apiUrl = `https://api.replicate.com/v1/models/${model}/predictions`

    // 构建请求体
    const requestBody = {
      input: {
        prompt: prompt,
        width: config.width || 1024,
        height: config.height || 1024,
        num_outputs: 1
      }
    }

    // 添加可选参数
    if (config.guidance_scale) {
      requestBody.input.guidance_scale = config.guidance_scale
    }
    if (config.num_inference_steps) {
      requestBody.input.num_inference_steps = config.num_inference_steps
    }
    if (config.seed) {
      requestBody.input.seed = config.seed
    }
    
    // FLUX 1.1 Pro 特殊参数
    if (model.includes('flux-1.1-pro') && config.prompt_upsampling !== false) {
      requestBody.input.prompt_upsampling = true
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 40, message: '正在提交生成任务...' })

    const startTime = Date.now()
    
    // 提交预测任务
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'  // 等待完成而不是立即返回
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Replicate API 错误: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(`生成失败: ${result.error}`)
    }

    await updateTaskStatus(env, taskId, 'processing', { progress: 60, message: '任务已提交，等待处理...' })

    // 如果使用了 Prefer: wait，直接获取结果
    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output
      
      await updateTaskStatus(env, taskId, 'processing', { progress: 80, message: '正在下载生成的图片...' })
      
      // 下载图片
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`图片下载失败: ${imageResponse.status}`)
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      const generationTime = (Date.now() - startTime) / 1000

      return {
        success: true,
        imageData: imageBuffer,
        width: config.width || 1024,
        height: config.height || 1024,
        format: 'png',
        seed: config.seed,
        generationTime,
        metadata: {
          model: model,
          prediction_id: result.id,
          width: config.width || 1024,
          height: config.height || 1024
        }
      }
    }

    // 如果没有立即完成，需要轮询结果
    const predictionId = result.id
    if (!predictionId) {
      throw new Error('未获取到预测任务ID')
    }

    // 轮询获取结果
    let attempts = 0
    const maxAttempts = 60 // 最多等待5分钟
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // 等待5秒
      attempts++
      
      await updateTaskStatus(env, taskId, 'processing', { 
        progress: Math.min(60 + attempts * 2, 95),
        message: `正在生成图片... (${attempts}/${maxAttempts})`
      })

      try {
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          }
        })

        if (!statusResponse.ok) {
          console.warn(`状态查询失败: ${statusResponse.status}`)
          continue
        }

        const statusResult = await statusResponse.json()
        
        if (statusResult.status === 'succeeded' && statusResult.output) {
          const imageUrl = Array.isArray(statusResult.output) ? statusResult.output[0] : statusResult.output
          
          // 下载图片
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            throw new Error(`图片下载失败: ${imageResponse.status}`)
          }

          const imageBuffer = await imageResponse.arrayBuffer()
          const generationTime = (Date.now() - startTime) / 1000

          return {
            success: true,
            imageData: imageBuffer,
            width: config.width || 1024,
            height: config.height || 1024,
            format: 'png',
            seed: config.seed,
            generationTime,
            metadata: {
              model: model,
              prediction_id: predictionId,
              width: config.width || 1024,
              height: config.height || 1024
            }
          }
          
        } else if (statusResult.status === 'failed') {
          throw new Error(`生成失败: ${statusResult.error || '任务失败'}`)
        }
        
        // 继续等待
        
      } catch (pollError) {
        console.warn('轮询状态时出错:', pollError)
        // 继续尝试
      }
    }

    throw new Error('图片生成超时，请稍后重试')

  } catch (error) {
    console.error('Replicate生成失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// ===============================================
// 🚀 V2 API Enhanced Image Generation Functions for HTML Processing
// ===============================================

async function generateImageWithV2API(altText: string, imageConfig: any): Promise<string> {
  try {
    console.log('🚀 V2 API Image Generation:', { provider: imageConfig.v2Provider, altText })
    
    // Create a temporary task for tracking
    const taskId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Make request to V2 API
    const response = await fetch('/api/v2/image-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: imageConfig.v2Provider,
        model: imageConfig.v2Model || getDefaultV2Model(imageConfig.v2Provider),
        prompt: enhanceImagePrompt(altText),
        config: imageConfig.v2Config || {}
      })
    })
    
    if (!response.ok) {
      throw new Error(`V2 API request failed: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (!result.taskId) {
      throw new Error('No task ID received from V2 API')
    }
    
    console.log(`🎯 V2 API task created: ${result.taskId}`)
    
    // Poll for completion
    const maxAttempts = 60 // 5 minutes
    let attempts = 0
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      attempts++
      
      try {
        const statusResponse = await fetch(`/api/v2/image-generate/${result.taskId}`)
        const statusResult = await statusResponse.json()
        
        if (statusResult.status === 'completed' && statusResult.imageUrl) {
          console.log(`✅ V2 API image generated: ${statusResult.imageUrl}`)
          return statusResult.imageUrl
        } else if (statusResult.status === 'failed') {
          throw new Error(`V2 API generation failed: ${statusResult.error || 'Unknown error'}`)
        }
        
        console.log(`⏳ V2 API polling attempt ${attempts}/${maxAttempts}: ${statusResult.status}`)
        
      } catch (pollError) {
        console.warn(`V2 API polling error (attempt ${attempts}):`, pollError)
        if (attempts >= 3) {
          throw pollError // Only throw after a few attempts
        }
      }
    }
    
    throw new Error('V2 API generation timeout after 5 minutes')
    
  } catch (error) {
    console.error('V2 API image generation failed:', error)
    
    // Fallback to placeholder
    console.log('🔄 Falling back to placeholder image')
    const query = encodeURIComponent(altText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50))
    return `https://source.unsplash.com/1024x1024/?${query}`
  }
}

function enhanceImagePrompt(altText: string): string {
  // Enhance the alt text for better image generation
  const enhanced = `${altText}, high quality, professional, detailed, modern design, clean background, well-lit, photorealistic`
  console.log('📝 Enhanced prompt:', enhanced)
  return enhanced
}

function getDefaultV2Model(provider: string): string {
  const defaults = {
    'cloudflare': '@cf/bytedance/stable-diffusion-xl-lightning',
    'alibaba-dashscope': 'qwen-image-plus', // 更新为推荐的QWEN-Image模型
    'bytedance-ark': 'doubao-seedream-4-0-250828',
    'stability-ai': 'stable-image-ultra',
    'hugging-face': 'black-forest-labs/FLUX.1-dev',
    'replicate': 'black-forest-labs/flux-schnell'
  }
  return defaults[provider] || defaults['cloudflare']
}

// 🎯 获取阿里巴巴DashScope支持的模型列表
function getDashScopeModels() {
  return {
    'qwen-image': {
      name: 'QWEN-Image 标准版',
      description: '通义千问图像生成标准版',
      type: 'sync',
      endpoint: 'multimodal-generation',
      pricing: '$0.035/张',
      features: ['中英文文本渲染', '多行布局', '段落级文本生成']
    },
    'qwen-image-plus': {
      name: 'QWEN-Image Plus版',
      description: '通义千问图像生成增强版',
      type: 'sync',
      endpoint: 'multimodal-generation',
      pricing: '$0.03/张',
      features: ['中英文文本渲染', '多行布局', '段落级文本生成', '更优惠价格']
    },
    'wanx-v1': {
      name: '通义万相 V1',
      description: '强大的文本到图像生成服务',
      type: 'async',
      endpoint: 'text2image',
      features: ['文生图', '图像风格迁移', '人物写真', '图像放大增强']
    },
    'alt_diffusion_v2': {
      name: 'Alt Diffusion V2',
      description: '替代扩散模型第二版',
      type: 'async',
      endpoint: 'text2image',
      features: ['高质量文生图', '多种艺术风格']
    }
  }
}

app.notFound((c) => {
  return c.text('Not Found', 404)
})

export default app
