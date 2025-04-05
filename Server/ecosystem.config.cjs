module.exports = {
  apps: [
    {
      name: "server-fingenius-ai",
      script: "src/index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "development",
        ENV_VAR1: "environment-variable",
      },
    },
  ],
};
