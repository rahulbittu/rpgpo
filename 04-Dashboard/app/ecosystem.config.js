// PM2 Ecosystem Config — RPGPO Dashboard
// Usage: pm2 start ecosystem.config.js
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
