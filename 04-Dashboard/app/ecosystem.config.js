// PM2 Ecosystem Config — RPGPO Command Center v5
// Usage: pm2 start ecosystem.config.js
//
// API keys: Create 04-Dashboard/app/.env with your keys:
//   OPENAI_API_KEY=sk-...
//   PERPLEXITY_API_KEY=pplx-...
//   GEMINI_API_KEY=AIza...
//
// Or export them in your shell profile (~/.zshrc):
//   export OPENAI_API_KEY=sk-...
//
// PM2 will inherit shell environment. The .env file is also loaded by
// server.js and worker.js at startup for reliability.

module.exports = {
  apps: [
    {
      name: 'rpgpo-server',
      script: 'server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3200,
      },
      watch: false,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      name: 'rpgpo-worker',
      script: 'worker.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      max_restarts: 10,
      restart_delay: 2000,
    },
  ],
};
