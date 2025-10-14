# 🍌 Nano Banana 生产环境调试指南

## 🎯 问题诊断

你遇到的问题：Nano Banana 在生产环境中失败，回退到 Unsplash 图片。

## 🔧 已修复的问题

### 1. 配置对象命名不一致 ✅
- **问题**: 代码中使用 `nanoBananaConfig` 但实际检查 `nanoBanana`
- **修复**: 统一使用 `nanoBanana` 属性名

### 2. 路径解析问题 ✅
- **问题**: 复杂的 URL 构建逻辑在生产环境中失败
- **修复**: 简化为相对路径 `/api/generate/nano-banana`

### 3. 调试信息不足 ✅
- **问题**: 生产环境错误信息不详细
- **修复**: 增加详细的环境检测和错误日志

## 🧪 测试步骤

### 第一步：获取 Gemini API Key
1. 访问: https://makersuite.google.com/app/apikey
2. 创建新的 API Key（格式：`AIzaSy...`）
3. 确保 API Key 有效且有权限

### 第二步：在生产环境测试
1. 访问: https://ai-html-generator-v3.pages.dev
2. 选择 **Nano Banana** 作为图片提供商
3. 点击配置，输入你的 Gemini API Key
4. 选择基础风格和主题风格（可选）
5. 保存配置

### 第三步：生成测试
1. 输入简单的网页描述，例如：
   ```
   一个咖啡店的官网，需要展示不同的咖啡豆产品
   ```
2. 点击"开始制作"
3. 观察浏览器开发者工具的控制台日志

### 第四步：调试工具测试
访问专门的调试页面：
- https://ai-html-generator-v3.pages.dev/static/debug-nano-banana.html

这个页面会显示详细的：
- 配置验证
- 后端 API 测试
- 前端服务调用测试
- 完整的调试日志

## 🔍 期望的日志输出

### 成功情况下，你应该看到：
```
🍌 [Nano Banana] Starting image generation for: Professional coffee shop...
🔍 [Nano Banana] Environment info: {...}
🔍 [Nano Banana] Debug imageConfig structure: {hasNanoBanana: true, hasApiKey: true}
✅ [Config] Loaded Nano Banana config from localStorage: {...}
🚀 [Nano Banana] Calling NanoBananaService.generateImage...
🔗 Nano Banana now using backend proxy only (CORS fix)
🚀 Calling Nano Banana generation endpoint via relative path
[API] Nano Banana 图片生成请求: {hasApiKey: true, prompt: "...", outputFormat: "base64"}
[API] 调用 Nano Banana API 生成图片
[API] Nano Banana API 响应状态: 200
✅ [Nano Banana] Successfully generated image, URL length: [大于0的数字]
```

### 失败情况下，查找：
```
❌ [Config] No Nano Banana config found in localStorage
❌ [Nano Banana] Service call failed: {...}
❌ Nano Banana backend proxy error: [具体错误]
[API] Nano Banana API 错误: [具体 API 错误]
🔄 Using Unsplash fallback
```

## 🚨 常见问题和解决方案

### 1. API Key 无效
**症状**: `API key not valid. Please pass a valid API key.`
**解决**: 检查 API Key 是否正确，是否以 `AIzaSy` 开头

### 2. 配置未保存
**症状**: `No Nano Banana config found in localStorage`
**解决**: 重新打开配置弹窗，输入 API Key 并点击保存

### 3. 网络请求失败
**症状**: `Failed to fetch` 或 `Network error`
**解决**: 检查网络连接，可能是临时的网络问题

### 4. 速率限制
**症状**: `Rate limit exceeded`
**解决**: 等待几分钟后重试，或使用不同的 API Key

## 📊 最新部署信息

- **生产环境**: https://ai-html-generator-v3.pages.dev
- **最新部署**: https://f3c87bad.ai-html-generator-v3.pages.dev
- **调试工具**: https://ai-html-generator-v3.pages.dev/static/debug-nano-banana.html
- **版本**: V3.0.1 - 2025-10-09

## 🔄 如果问题仍然存在

1. **检查浏览器控制台**: 按 F12 打开开发者工具，查看 Console 标签页
2. **清除浏览器缓存**: 硬刷新页面 (Ctrl+Shift+R 或 Cmd+Shift+R)
3. **尝试隐身模式**: 排除扩展程序干扰
4. **测试不同的提示词**: 使用简单的英文描述

## 📞 技术支持

如果问题仍然存在，请提供：
1. 浏览器控制台的完整错误日志
2. 使用的 Gemini API Key 前几位字符 (`AIzaSy...`)
3. 输入的网页描述内容
4. 选择的风格配置

---

🚀 **现在尝试测试 Nano Banana 功能吧！** 🎨