-- 异步任务管理表
CREATE TABLE IF NOT EXISTS async_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  request_data TEXT NOT NULL, -- 完整的请求数据JSON (包含用户配置)
  html_structure TEXT, -- 生成的HTML框架
  images_data TEXT, -- 图片生成结果JSON
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON async_jobs(status);
CREATE INDEX IF NOT EXISTS idx_async_jobs_created_at ON async_jobs(created_at);