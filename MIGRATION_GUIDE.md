# 🔄 AI HTML Generator 项目迁移指南

## 📋 概述
本指南详细说明如何将AI HTML Generator项目迁移到新的GitHub仓库和Cloudflare Pages项目。

## 🎯 迁移影响评估

### ✅ **完全不受影响的功能**
- **智能图片存储**: R2桶是账户级资源，可跨项目使用
- **图文交互逻辑**: 所有业务逻辑在代码中，不依赖特定项目
- **D1数据库**: 账户级资源，可重新绑定
- **KV存储**: 账户级资源，可重新绑定

### 🔄 **自动适应的功能** 
- **WordPress测试API**: 使用 `new URL(c.req.url).origin` 自动获取新域名
- **图片代理URL**: 动态获取当前域名，无需手动更新
- **实际WordPress转换**: 正常情况下会自动使用新域名

### ⚠️ **需要注意的风险点**
- **硬编码降级URL**: 在异常情况下可能返回旧域名
- **已生成的图片链接**: 指向旧域名，但6小时后自动过期

## 🛠️ 迁移步骤

### 1. GitHub仓库迁移
```bash
# 更新远程仓库地址
git remote set-url origin https://github.com/username/new-repo.git

# 推送代码
git push -f origin main
```

### 2. Cloudflare Pages配置

#### 2.1 创建新Pages项目
```bash
# 使用wrangler创建新项目
npx wrangler pages project create your-new-project-name

# 或通过Cloudflare仪表板创建
```

#### 2.2 配置资源绑定 (wrangler.jsonc)
```jsonc
{
  "name": "your-new-project-name",
  "compatibility_date": "2024-09-26", 
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist",
  
  // R2存储桶绑定 - 使用现有桶
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "ai-html-generator-temp-images"  // 保持不变
    }
  ],
  
  // D1数据库绑定 - 使用现有数据库
  "d1_databases": [
    {
      "binding": "DB", 
      "database_name": "ai-html-generator-production",
      "database_id": "your-existing-database-id"  // 保持不变
    }
  ],
  
  // KV命名空间绑定 - 使用现有KV
  "kv_namespaces": [
    {
      "binding": "JOBS",
      "id": "your-existing-kv-id"  // 保持不变
    }
  ]
}
```

#### 2.3 部署项目
```bash
# 构建并部署
npm run build
npx wrangler pages deploy dist --project-name your-new-project-name
```

### 3. 环境变量配置

#### 3.1 重新设置Secrets (如果有)
```bash
# 设置API keys等敏感信息
npx wrangler pages secret put OPENAI_API_KEY --project-name your-new-project-name
npx wrangler pages secret put GEMINI_API_KEY --project-name your-new-project-name
```

### 4. 验证功能

#### 4.1 基础功能测试
```bash
# 健康检查
curl https://your-new-domain.pages.dev/api/hello

# WordPress转换测试
curl -X POST https://your-new-domain.pages.dev/api/test/wordpress-convert \
  -H "Content-Type: application/json" \
  -d '{"base64Data": "data:image/png;base64,...", "altText": "测试图片"}'

# 图片代理测试
curl -I https://your-new-domain.pages.dev/api/proxy/image/job123/test.jpg
```

#### 4.2 完整流程测试
测试HTML生成和WordPress兼容性功能是否正常工作。

## 🔧 代码优化建议

### 消除硬编码URL风险

**当前风险代码位置:**
- `src/index.tsx` 第5526行和第5580行

**建议的改进方案:**

#### 方案1: 使用环境变量
```typescript
const appBaseUrl = baseUrl || 
  env.PAGES_URL || 
  'https://fallback-domain.pages.dev'
```

#### 方案2: 更智能的降级策略
```typescript
const appBaseUrl = baseUrl || 
  (typeof globalThis !== 'undefined' && globalThis.location?.origin) ||
  'https://ai-html-generator.pages.dev'  // 通用域名
```

#### 方案3: 移除硬编码依赖
```typescript
if (!baseUrl) {
  throw new Error('baseUrl is required for WordPress compatibility')
}
```

## 📋 迁移检查清单

### 🔍 **迁移前检查**
- [ ] 记录当前R2桶名称和ID
- [ ] 记录D1数据库ID
- [ ] 记录KV命名空间ID
- [ ] 备份当前环境变量/secrets
- [ ] 确认新仓库创建完成

### 🚀 **迁移执行**
- [ ] 更新git远程仓库
- [ ] 推送代码到新仓库
- [ ] 创建新Pages项目
- [ ] 配置wrangler.jsonc资源绑定
- [ ] 部署到新项目
- [ ] 重新配置环境变量

### ✅ **迁移后验证**
- [ ] 基础API功能正常
- [ ] WordPress转换API正常
- [ ] 图片代理功能正常
- [ ] R2存储读写正常
- [ ] D1数据库访问正常
- [ ] 完整HTML生成流程正常

## 🔒 最佳实践

### 1. **零停机迁移**
- 先创建新项目，测试完成后再切换流量
- 保持旧项目运行直到新项目验证完成

### 2. **资源复用**
- R2桶、D1数据库、KV存储都可以跨项目复用
- 避免重复创建账户级资源

### 3. **域名管理**
- 考虑使用自定义域名减少迁移影响
- 或在代码中使用相对路径和动态域名获取

### 4. **监控和回滚**
- 迁移后密切监控新项目运行状况
- 准备快速回滚到旧项目的方案

## 🚨 常见问题

### Q: 迁移后WordPress转换返回旧域名？
**A:** 检查baseUrl参数传递，正常情况下会自动使用新域名。如持续出现，需要更新硬编码URL。

### Q: 图片无法显示？
**A:** 确认R2桶绑定正确，检查图片代理API是否正常工作。

### Q: 数据库连接失败？
**A:** 检查D1数据库绑定配置，确认database_id正确。

### Q: 环境变量丢失？
**A:** 重新配置所有secrets和环境变量，它们不会自动迁移。

---

**📝 注意**: 迁移过程中如遇到问题，建议先在测试环境验证，确保功能正常后再进行正式迁移。