-- AI HTML Generator Database Schema

-- Projects table - 存储生成的HTML项目
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'homepage',
  theme_color TEXT NOT NULL DEFAULT '#3B82F6',
  user_prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  html_content TEXT,
  image_placeholders TEXT, -- JSON array of image requests
  image_results TEXT, -- JSON array of generated images
  seo_data TEXT, -- JSON object with SEO metadata
  model_config TEXT, -- JSON object with model settings
  generation_status TEXT NOT NULL DEFAULT 'pending', -- pending, generating, completed, failed
  generation_progress INTEGER DEFAULT 0,
  cost_estimate REAL DEFAULT 0.0,
  actual_cost REAL DEFAULT 0.0,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Model configurations table - 存储用户的模型配置
CREATE TABLE IF NOT EXISTS model_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  text_model_provider TEXT NOT NULL, -- qwen3, claude, openai
  text_model_name TEXT NOT NULL,
  text_api_key TEXT, -- encrypted
  image_model_provider TEXT NOT NULL, -- qwen-vl, dalle3, gemini-nano, etc.
  image_model_name TEXT,
  image_api_key TEXT, -- encrypted
  cost_limit REAL DEFAULT 1.0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generation logs table - 详细的生成日志
CREATE TABLE IF NOT EXISTS generation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  stage TEXT NOT NULL, -- stage1_html, stage2_images, stage3_assembly
  provider TEXT NOT NULL, -- qwen3, claude, dalle3, etc.
  model_name TEXT NOT NULL,
  prompt TEXT,
  response TEXT,
  tokens_used INTEGER,
  cost REAL,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Usage statistics table - 使用统计
CREATE TABLE IF NOT EXISTS usage_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  total_generations INTEGER DEFAULT 0,
  successful_generations INTEGER DEFAULT 0,
  total_cost REAL DEFAULT 0.0,
  avg_generation_time_ms INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(generation_status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_generation_logs_project_id ON generation_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_stage ON generation_logs(stage);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date);