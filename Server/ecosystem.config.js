module.exports = {
  apps: [
    {
      name: "server-fingenius-ai",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "development",
        ENV_VAR1: "environment-variable",
      },
    },
  ],
};
