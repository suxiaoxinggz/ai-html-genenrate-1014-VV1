# AI HTML Generator V10 🚀

一个基于 AI 的智能 HTML 网页生成器，支持多种图像生成模型和扩展的模型支持，特别优化了阿里巴巴DashScope和ByteDance即梦等企业级AI服务。

**🎯 最新更新 (V10.0)**：全新V2 Enhanced API架构，完整支持阿里巴巴DashScope、ByteDance即梦、OpenAI兼容模式！

## 🌟 项目特色

### 核心功能
- **智能网页生成**: 基于用户描述自动生成完整的 HTML 网页
- **多模型图像生成**: 支持 10+ 种图像生成服务
- **实时预览**: 即时预览生成的网页效果
- **一键部署**: 支持导出和部署到多个平台

### 技术架构
- **前端**: HTML + CSS + JavaScript (原生)
- **后端**: Hono Framework + TypeScript
- **部署**: Cloudflare Pages/Workers
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare KV + R2

## 🎯 支持的图像生成模型

### 🆕 V2 Enhanced API 企业级服务
| 提供商 | 模型 | 特色 | API类型 | 状态 |
|--------|------|------|---------|------|
| **阿里巴巴DashScope** | QWEN-Image Plus/Standard | 🇨🇳 中英文文本渲染专家 | 同步/异步 | ✅ **新增** |
| **阿里巴巴DashScope** | 通义万相 WanX V1 | 🎨 强大文生图服务 | 异步 | ✅ **新增** |
| **阿里巴巴DashScope** | OpenAI兼容模式 | 🔄 标准OpenAI接口 | 同步/流式 | ✅ **新增** |
| **ByteDance 即梦** | 即梦4.0 (Seedream) | ⚡ 2K分辨率+流式输出 | SSE流式 | ✅ **新增** |
| **ByteDance 即梦** | 即梦3.0 文生图/图生图 | 🎯 精细控制+多输入 | 标准API | ✅ **新增** |
| **Stability AI** | Stable Image Ultra/Core | 🏆 顶级质量保证 | RESTful | ✅ **新增** |

### 🍌 基础服务 (V1 API)
| 提供商 | 模型 | 特色 | 状态 |
|--------|------|------|------|
| **Nano Banana** | Gemini 2.5 Flash Image | 🍌 快速、风格丰富 | ✅ 已优化 |
| **ChatGPT** | GPT Image 1, DALL-E 3/2 | 🎨 高质量创意 | ✅ |
| **Vertex AI** | Imagen 4.0/3.0 | 🚀 Google 最新 | ✅ |
| **Gemini Imagen** | Imagen 3.0/2.0 | 🔥 多样化风格 | ✅ |
| **Cloudflare AI** | Stable Diffusion XL | ☁️ 边缘计算 | ✅ |
| **免费服务** | Unsplash, Pollinations | 💰 零成本 | ✅ |

## 🍌 Nano Banana 特别优化

### 问题修复
- ✅ **CORS 修复**: 通过后端代理避免跨域问题
- ✅ **URL 解析**: 修复 Cloudflare Workers 环境中的相对路径问题
- ✅ **配置传递**: 完善风格配置和输出格式支持
- ✅ **错误处理**: 改进错误日志和调试信息

### 风格配置
**基础风格**:
- 写实摄影、贴纸图标、Logo设计、商品图、留白插图等

**主题风格**:
- 可信专业、温暖亲和、科技未来、活力年轻、极简高级等

## 🌐 在线访问

### 生产环境 (VV1 - 最新部署)
- **主站**: https://ai-html-generator-vv1.pages.dev
- **当前访问**: https://9f294fc9.ai-html-generator-vv1.pages.dev (立即可用)
- **GitHub**: https://github.com/suxiaoxinggz/ai-html-genenrate-1014-VV1

### API 端点

#### V2 Enhanced API (新架构)
- **图像生成**: `POST /api/v2/image-generate` - 统一多提供商接口
- **任务状态**: `GET /api/v2/image-generate/{taskId}` - 异步任务查询
- **提供商配置**: `GET /api/v2/providers` - 获取所有支持的提供商
- **图片代理**: `GET /api/image-proxy/{filename}` - R2存储图片访问

#### V1 基础API (兼容)
- **健康检查**: `/api/hello`
- **模型列表**: `/api/models/{type}`
- **WordPress兼容**: `/api/test/wordpress-convert`
- **Vertex AI图像**: `POST /api/generate-imagen`

### 最新部署状态 (VV1)
- ✅ **部署时间**: 2025-10-14 16:24 UTC
- ✅ **基础API**: https://ai-html-generator-vv1.pages.dev/api/hello
- ✅ **WordPress转换**: 自动新域名适配，正常工作
- ✅ **图片代理**: R2存储访问正常
- ✅ **资源绑定**: D1/KV/R2 所有服务正常
- ✅ **迁移状态**: 100%成功，零停机迁移完成

## 🚀 快速开始

### 1. 本地开发

```bash
# 克隆项目
git clone https://github.com/suxiaoxinggz/ai-html-genenrate-1014-VV1.git
cd ai-html-genenrate-1014-VV1

# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev:sandbox
# 或使用 PM2
pm2 start ecosystem.config.cjs
```

### 2. 配置 API Keys

访问应用后，点击相应的图像提供商进行配置：

- **Gemini API** (Nano Banana): https://makersuite.google.com/app/apikey
- **OpenAI API**: https://platform.openai.com/api-keys
- **Google Cloud** (Vertex AI): https://console.cloud.google.com/
- **Cloudflare AI**: https://developers.cloudflare.com/ai/

### 3. 部署到 Cloudflare Pages

```bash
# 配置 Cloudflare API
npx wrangler login

# 创建项目
npx wrangler pages project create ai-html-generator-v3 --production-branch main

# 部署
npm run deploy:prod
```

## 📁 项目结构

```
webapp/
├── src/
│   ├── index.tsx              # 主应用入口 (Hono) + V2 Enhanced API
│   ├── services/              # 服务层
│   │   ├── NanoBananaService.ts   # 🍌 Nano Banana 服务 (V1)
│   │   └── SDKService.ts          # SDK 管理服务
│   ├── types.ts               # TypeScript 类型定义
│   └── input.css              # Tailwind CSS 输入
├── public/
│   ├── static/               # 静态资源
│   │   ├── app.js           # 前端 JavaScript
│   │   ├── styles.css       # 编译后的样式
│   │   ├── test-nano-banana.html      # Nano Banana 简单测试
│   │   └── debug-nano-banana.html     # Nano Banana 调试页面
│   └── favicon.ico          # 网站图标
├── migrations/              # D1 数据库迁移
├── ecosystem.config.cjs     # PM2 配置
├── wrangler.jsonc          # Cloudflare 配置 (含R2和KV绑定)
├── 模型需求-预设模型-阿里.md    # 阿里巴巴DashScope官方文档
└── package.json            # 项目配置
```

## 🔧 开发脚本

```bash
# 开发相关
npm run dev              # Vite 开发服务器
npm run dev:sandbox      # 沙盒环境开发
npm run build           # 构建项目
npm run preview         # 预览构建结果

# 部署相关
npm run deploy          # 部署到 Cloudflare Pages
npm run deploy:prod     # 生产环境部署

# 数据库相关 (D1)
npm run db:migrate:local    # 本地数据库迁移
npm run db:migrate:prod     # 生产数据库迁移
npm run db:console:local    # 本地数据库控制台

# 工具命令
npm run clean-port      # 清理端口
npm run test           # 测试连接
```

## 🌍 在线演示

- **生产环境 V6**: https://feebb3c3.ai-html-generator-v5.pages.dev ✨ **最新部署版本 - WordPress兼容功能**
- **GitHub V6**: https://github.com/suxiaoxinggz/ai-html-genenrate-1012-V6
- **WordPress测试API**: https://feebb3c3.ai-html-generator-v5.pages.dev/api/test/wordpress-convert
- **测试页面**: https://feebb3c3.ai-html-generator-v5.pages.dev/static/test-nano-banana.html
- **调试工具**: https://feebb3c3.ai-html-generator-v5.pages.dev/static/debug-nano-banana.html

### 🚀 V2 Enhanced API 使用指南

#### 阿里巴巴DashScope
1. 获取 [DashScope API Key](https://www.alibabacloud.com/help/zh/model-studio/get-api-key)
2. 选择地域: 新加坡(国际版)或北京(中国版)
3. 选择模型: 
   - `qwen-image-plus`: 最新增强版(推荐)
   - `wanx-v1`: 通义万相经典版
   - OpenAI兼容模式: 任意qwen模型

#### ByteDance 即梦
1. 获取 [ByteDance Ark API Key](https://console.volcengine.com/ark)
2. 选择即梦模型:
   - `doubao-seedream-4-0-250828`: 即梦4.0(推荐)
   - `doubao-seedream-3-0-t2i`: 即梦3.0文生图
   - `doubao-seededit-3-0-i2i`: 即梦3.0图生图

#### API 调用示例
```javascript
// V2 Enhanced API 调用
const response = await fetch('/api/v2/image-generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'alibaba-dashscope',
    model: 'qwen-image-plus',
    prompt: '一只可爱的猫咪在花园里玩耍',
    config: {
      apiKey: 'your-api-key',
      region: 'intl', // 或 'cn'
      size: '1328*1328',
      negative_prompt: '低质量，模糊'
    }
  })
})

const { taskId } = await response.json()

// 查询任务状态
const statusResponse = await fetch(`/api/v2/image-generate/${taskId}`)
const { status, imageUrl } = await statusResponse.json()
```

### 🍌 Nano Banana 使用指南 (V1 API)
1. 获取 [Gemini API Key](https://makersuite.google.com/app/apikey)
2. 在主页面选择 "Nano Banana" 图像提供商
3. 点击配置按钮，输入 API Key 和选择风格
4. 开始生成网页，享受快速的图像生成！

## 📊 使用统计

### 当前功能状态
- ✅ **完整功能**: 网页生成、图片生成、预览、导出
- ✅ **多模型支持**: 10+ 图像生成服务
- ✅ **Nano Banana 优化**: CORS 和 URL 解析问题已修复
- ✅ **响应式设计**: 支持桌面和移动端
- ✅ **错误处理**: 完善的错误提示和调试工具
- 🆕 **WordPress兼容**: 自动图片URL转换，支持WordPress本地化

### 技术指标
- **构建大小**: ~492KB (压缩后)
- **冷启动时间**: <100ms (Cloudflare Workers)
- **图片生成**: 支持 Base64 和 URL 格式
- **并发处理**: 支持批量图片生成
- **所有图像模型**: ✅ 生产环境完全支持 (V3.0.4+)
- **紧急修复**: ✅ API Key 传递问题已解决

## ✨ 新功能更新记录

### V10.0 V2 Enhanced API 架构 (2025-10-13) ✅ **全新部署**
🚀 **V2 Enhanced API统一架构**：

1. **阿里巴巴DashScope全面支持** ⭐ **企业级核心** ✅:
   - **多模型支持**: QWEN-Image Plus/Standard、通义万相WanX V1、Alt Diffusion V2
   - **多地域部署**: 支持新加坡(intl)和北京(cn)地域，自动地域选择
   - **三种API模式**: 同步生成、异步任务轮询、OpenAI兼容模式
   - **完整参数支持**: 负面提示词、尺寸控制、智能改写、水印设置
   - **状态**: **已实现并测试** - 支持所有官方文档规范的功能

2. **ByteDance即梦4.0/3.0完整集成** ✅:
   - **即梦4.0**: 2K分辨率、SSE流式输出、组图功能、多图输入(最多10张)
   - **即梦3.0**: 文生图/图生图、随机种子控制、引导强度调节
   - **流式处理**: 实时SSE事件解析，支持partial_succeeded/failed事件
   - **状态**: **生产就绪** - 完整支持官方Ark API v3规范

3. **统一V2 API架构** ✅:
   - **多提供商统一**: 通过provider参数切换不同的AI服务
   - **异步任务管理**: KV存储任务状态，实时进度更新，R2图片存储
   - **图片代理服务**: 自动上传到R2，生成WordPress兼容URL
   - **错误处理**: 分层兜底机制，确保服务高可用性

4. **OpenAI兼容模式增强** ✅:
   - **提示词增强**: 使用DashScope生成更详细的图像描述
   - **流式支持**: 完整的SSE流式响应处理
   - **后备生成**: 自动调用WanX或Pollinations进行实际图像生成

### V6.0 WordPress兼容性功能 (2025-10-11) ✅ **已完成部署**
🎯 **WordPress兼容性模式**：
1. **自动图片转换** ⭐ **核心功能** ✅:
   - 功能: Base64图片自动转换为HTTP URL，支持WordPress自动下载
   - 实现: 6小时临时存储 + 语义化文件命名 + 自动清理
   - 状态: **已测试验证** - R2存储桶配置完成，上传/下载功能正常
   - 影响: 用户下载HTML后直接导入WordPress，无需手动处理图片

2. **智能兜底机制** ✅:
   - 功能: 支持所有图片提供商的统一转换处理
   - 实现: 多层降级策略确保图片始终可访问
   - 状态: **测试API已验证** - `/api/test/wordpress-convert` 正常工作
   - 结果: 100%兼容WordPress和其他CMS系统

3. **零破坏性集成** ✅:
   - 功能: 不影响现有任何功能和工作流程
   - 实现: 透明转换层 + 可选开关控制
   - 状态: **已测试** - 现有API保持100%兼容，默认启用WordPress模式
   - 优势: 向后兼容，用户可选择启用或禁用

### 📋 WordPress兼容性配置状态
- **R2存储桶**: ✅ `ai-html-generator-temp-images` 已创建并验证
- **上传功能**: ✅ Base64转HTTP URL测试成功
- **文件管理**: ✅ 6小时过期机制正常工作
- **API端点**: ✅ `/api/test/wordpress-convert` 测试通过
- **文档**: ✅ `WORDPRESS_COMPATIBILITY.md` 已更新

## 🐛 问题修复记录

### V4.0.1 SDK 初始化修复 (2025-10-09) 🔧 **架构修复**
🚫 **Nano Banana Google SDK 初始化问题**：
1. **SDK 绕过风险** ⭐ **关键修复**:
   - 问题: 选择 Nano Banana 时仍初始化 Google SDK，可能绕过后端代理
   - 解决: 修改 SDK 初始化逻辑，添加 `imageProvider !== 'nano-banana'` 排除条件
   - 影响: 确保 Nano Banana 100% 使用后端代理，避免前端 CORS 问题

2. **架构一致性保证**:
   - 问题: SDK 初始化可能导致前端直接调用，违反后端代理架构
   - 解决: 添加明确的日志跟踪和排除逻辑
   - 结果: Nano Banana 现在完全通过后端代理，无任何 SDK 依赖

### V3.0.4 紧急修复 (2025-10-09) ⚠️ **关键修复**
🚨 **所有图像模型 API Key 传递问题**：
1. **API Key 传递断链** ⭐ **紧急修复**:
   - 问题: 配置加载后 `imageApiKey` 字段为空，导致所有模型失败
   - 解决: 添加 API Key 从模型配置到基础字段的传递逻辑
   - 影响: 修复前所有模型都回退到 Unsplash，现已恢复正常

2. **配置传递链完整性**:
   - 问题: 弹窗配置保存成功，但生成时无法读取 API Key
   - 解决: 确保所有模型的 API Key 正确传递到 `modelConfig.imageApiKey`

### V3.0.3 配置系统修复 (2025-10-09)
🔧 **全模型配置加载系统**：
1. **配置加载逻辑缺失**:
   - 问题: 只有 Nano Banana 有配置加载，其他模型配置丢失
   - 解决: 为所有模型添加 localStorage 配置加载逻辑

### V3.0.2 Nano Banana API 认证修复 (2025-10-09)
🍌 **Nano Banana 生产环境完全修复**：
1. **API 认证方式错误** ⭐ **关键修复**:
   - 问题: 使用错误的 query parameter `?key=${apiKey}`
   - 解决: 改用正确的 header `'x-goog-api-key': apiKey`
   - 影响: 这是 Nano Banana 失败回退到 Unsplash 的根本原因

2. **配置属性名不一致**:
   - 问题: `nanoBananaConfig` vs `nanoBanana` 属性名混乱
   - 解决: 统一使用 `nanoBanana` 属性名

3. **调试信息增强**:
   - 问题: 生产环境错误难以诊断
   - 解决: 添加详细的环境检测和错误日志

### V3.0.1 版本修复
1. **Nano Banana CORS 问题**: 
   - 问题: 前端直接调用导致 CORS 错误
   - 解决: 实现后端代理机制

2. **配置传递链**:
   - 问题: `outputFormat` 参数未正确传递
   - 解决: 完善配置对象传递逻辑

3. **风格配置**:
   - 问题: 风格增强功能不稳定
   - 解决: 重构风格映射和提示词构建逻辑

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- **项目仓库**: https://github.com/suxiaoxinggz/ai-html-genenrate-1012-V6
- **问题反馈**: [Issues](https://github.com/suxiaoxinggz/ai-html-genenrate-1012-V6/issues)
- **讨论交流**: [Discussions](https://github.com/suxiaoxinggz/ai-html-genenrate-1012-V6/discussions)

## ⭐ 致谢

感谢以下服务和技术：
- [Hono](https://hono.dev/) - 轻量级 Web 框架
- [Cloudflare Pages](https://pages.cloudflare.com/) - 边缘部署平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Google AI Studio](https://makersuite.google.com/) - Gemini API
- [OpenAI](https://openai.com/) - GPT 和 DALL-E API

---

🚀 **开始创建你的第一个 AI 生成网页吧！** 🎨