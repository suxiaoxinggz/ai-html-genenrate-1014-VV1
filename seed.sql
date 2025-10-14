-- Seed data for AI HTML Generator

-- Insert default model configurations
INSERT OR IGNORE INTO model_configs (
  name, 
  text_model_provider, 
  text_model_name,
  image_model_provider, 
  image_model_name,
  cost_limit,
  is_default
) VALUES 
(
  'QWEN3 + QWEN-VL (推荐)',
  'qwen3',
  'qwen-max',
  'qwen-vl',
  'qwen-vl-max',
  0.5,
  TRUE
),
(
  'Claude + DALL-E (高质量)',
  'claude',
  'claude-3-5-sonnet-20241022',
  'dalle3',
  'dall-e-3',
  1.0,
  FALSE
),
(
  'GPT-4 + Gemini (均衡)',
  'openai',
  'gpt-4-turbo',
  'gemini-nano',
  'gemini-nano-banana',
  0.8,
  FALSE
);

-- Insert sample project
INSERT OR IGNORE INTO projects (
  title,
  description,
  page_type,
  theme_color,
  user_prompt,
  enhanced_prompt,
  html_content,
  generation_status,
  generation_progress,
  cost_estimate
) VALUES (
  '示例咖啡店官网',
  '一个现代简约风格的精品咖啡店官方网站',
  'homepage',
  '#8B4513',
  '我想要一个精品咖啡店的官网，需要展示不同产地的咖啡豆，包含价格表、联系方式和在线订购，风格要现代简约，温暖的色调',
  '根据用户需求："我想要一个精品咖啡店的官网，需要展示不同产地的咖啡豆，包含价格表、联系方式和在线订购，风格要现代简约，温暖的色调"生成专业HTML页面...',
  '<html><!-- Sample HTML content --></html>',
  'completed',
  100,
  0.25
);

-- Insert usage statistics
INSERT OR IGNORE INTO usage_stats (
  date,
  total_generations,
  successful_generations,
  total_cost,
  avg_generation_time_ms
) VALUES (
  DATE('now'),
  1,
  1,
  0.25,
  45000
);