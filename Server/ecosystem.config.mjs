export default {
  apps: [
    {
      name: "server-fingenius-ai",
      script: "npm",
      args: "run start",
      interpreter: "bash",
      env: {
        NODE_ENV: "development",
        ENV_VAR1: "environment-variable",
      },
    },
  ],
};
