module.exports = {
  apps: [{
    name: "telegram-bot",
    script: "index.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    instances: "max",
    exec_mode: "cluster"
  }]
}
