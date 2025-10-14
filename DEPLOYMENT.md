# 🚀 部署指南

## 混合API密钥管理模式

应用现在支持两种API密钥管理方式：

1. **用户输入模式**（主要）：用户在前端输入自己的API密钥
2. **开发者预设模式**（可选）：开发者通过环境变量提供后备密钥

**优先级**：用户输入的密钥 > 开发者预设的环境变量密钥

### 1. 用户使用方式（推荐）

用户直接在前端界面输入自己的API密钥：
- 密钥会保存在浏览器本地存储中
- 每次访问时自动加载
- 不会上传到服务器（安全）

### 2. 开发者预设模式（可选）

如果你想为用户提供后备密钥（当用户没有输入时使用），编辑 `.dev.vars` 文件：

```bash
# 取消注释并填入你的API密钥作为后备选项
GOOGLE_API_KEY=你的Google-API密钥
OPENAI_API_KEY=你的OpenAI-API密钥
CLAUDE_API_KEY=你的Claude-API密钥
# ... 其他密钥
```

### 3. 生产环境（Cloudflare Pages）

如果你选择提供开发者预设密钥，使用 wrangler 命令设置生产环境密钥：

```bash
# 设置各种API密钥
wrangler secret put GOOGLE_API_KEY --project-name your-project-name
wrangler secret put OPENAI_API_KEY --project-name your-project-name  
wrangler secret put CLAUDE_API_KEY --project-name your-project-name
wrangler secret put GEMINI_API_KEY --project-name your-project-name
wrangler secret put CUSTOM_OPENAI_API_KEY --project-name your-project-name
wrangler secret put CUSTOM_OPENAI_BASE_URL --project-name your-project-name
wrangler secret put DALLE_API_KEY --project-name your-project-name
wrangler secret put QWEN_VL_API_KEY --project-name your-project-name

# 查看已设置的密钥
wrangler secret list --project-name your-project-name
```

### 4. 部署命令

```bash
# 构建并部署到生产环境
npm run deploy:prod

# 或者手动步骤
npm run build
wrangler pages deploy dist --project-name your-project-name
```

## 🔧 最新修复内容

### ✅ API密钥管理优化
- **问题**：需要灵活的密钥管理方式
- **修复**：实现混合模式 - 用户输入优先，环境变量后备
- **影响**：用户可以使用自己的密钥，开发者可以提供后备密钥

### ✅ 503错误重试机制
- **问题**：Worker重启导致请求中断，返回503错误
- **修复**：添加自动重试机制（最多3次，指数退避）
- **影响**：提高请求成功率，更好的用户体验

### ✅ Tailwind生产警告
- **问题**：使用CDN版本在生产环境有警告
- **修复**：改用本地构建版本，消除警告
- **影响**：更快加载，无生产警告

### ✅ 错误处理改进
- **问题**：错误信息不够详细，难以调试
- **修复**：添加请求ID跟踪，详细错误日志
- **影响**：更容易调试和监控

## 📝 注意事项

1. **API密钥安全**：
   - `.dev.vars` 文件已在 `.gitignore` 中，不会被提交
   - 生产环境必须使用 `wrangler secret` 命令设置
   - 永远不要在前端代码中硬编码API密钥

2. **重试机制**：
   - 自动重试 503、502、504、429、500 错误
   - 网络超时也会触发重试
   - 用户会看到重试进度提示

3. **本地CSS**：
   - 修改样式需要运行 `npm run build:css`
   - 或使用 `npm run watch:css` 监听变化
   - 自定义样式在 `src/input.css` 中

4. **API密钥管理**：
   - **用户模式**：用户在前端输入，保存在浏览器本地存储
   - **开发者模式**：通过 `.dev.vars`（本地）或 `wrangler secret`（生产）提供后备
   - **混合优先级**：用户输入 > 环境变量 > 报错提示