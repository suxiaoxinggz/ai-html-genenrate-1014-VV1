// PM2 Configuration for AI HTML Generator
module.exports = {
  apps: [
    {
      name: 'ai-html-generator',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=ai-html-generator-production --local --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // 禁用PM2文件监控，让Wrangler处理热重载
      instances: 1, // 开发模式使用单实例
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}