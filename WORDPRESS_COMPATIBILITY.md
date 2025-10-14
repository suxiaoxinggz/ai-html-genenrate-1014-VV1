# WordPress兼容性功能配置说明

## ✅ 配置状态：已完成
R2存储桶 `ai-html-generator-temp-images` 已成功重新创建和配置。

## 🆕 新增功能
WordPress兼容性模式自动将Base64图片转换为HTTP URL，便于WordPress自动下载和本地化图片。

## 📋 配置步骤 (已完成)

### 1. 创建R2存储桶 ✅
```bash
# R2存储桶已创建并验证
npx wrangler r2 bucket create ai-html-generator-temp-images
# 状态：✅ 成功创建于 2025-10-11T18:19:02.850Z
# 位置：WNAM (西北美洲)
```

### 2. cors.json 配置文件
创建 `cors.json` 文件：
```json
{
  "rules": [
    {
      "allowedOrigins": ["*"],
      "allowedMethods": ["GET", "HEAD"],
      "allowedHeaders": ["*"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

### 3. 配置自定义域名 (推荐)
在Cloudflare控制台为R2存储桶配置自定义域名：
- 默认域名: `https://pub-xxx.r2.dev`  
- 自定义域名: `https://temp-images.your-domain.com`

### 4. 更新代码中的域名
在 `uploadBase64ToTempR2` 函数中更新域名：
```typescript
const publicUrl = `https://temp-images.your-domain.com/${filename}`
```

## 🎯 使用方式

### 用户端
1. 勾选"启用WordPress兼容模式" (默认启用)
2. 生成网页后下载HTML文件
3. 将HTML导入WordPress
4. WordPress自动下载图片并本地化

### 开发者维护
```bash
# 查看临时存储统计
curl https://your-app.pages.dev/api/stats/temp-storage

# 手动清理过期文件
curl -X POST https://your-app.pages.dev/api/cleanup/expired-images

# 定时清理 (推荐设置Cron Triggers)
# 在Cloudflare控制台设置每日自动清理
```

## ⚠️ 重要说明

### 图片有效期
- **临时链接**: 6小时有效期
- **用途**: 仅供WordPress导入时下载，不适合长期使用
- **清理**: 每日自动清理过期文件

### 存储成本
- **免费额度**: Cloudflare R2 每月10GB免费存储
- **带宽**: Class A操作 (上传) 每月1百万次免费
- **估算**: 每张图片约1-3MB，可支持大约3000-10000张临时图片

### 性能影响
- **生成时间**: 增加1-3秒 (图片上传时间)
- **并发限制**: 受R2 API限制影响
- **降级策略**: 上传失败时自动降级到占位符

## 🔧 故障排除

### 常见问题
1. **上传失败**: 检查R2存储桶是否正确创建和配置
2. **域名访问失败**: 确认自定义域名DNS设置
3. **CORS错误**: 检查存储桶CORS配置
4. **图片无法显示**: 确认图片URL格式和有效期

### 调试命令
```bash
# 测试R2存储桶连接
npx wrangler r2 object list ai-html-generator-temp-images

# 查看单个文件信息  
npx wrangler r2 object get ai-html-generator-temp-images/temp/xxx/image.jpg --local
```