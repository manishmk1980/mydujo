import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, "mdpl-api");
const logDir = path.resolve(apiRoot, process.env.PM2_LOG_DIR || "logs");

export default {
  apps: [
    {
      name: process.env.PM2_APP_NAME || "mdpl-api",
      cwd: apiRoot,
      script: "src/server.js",
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: process.env.PM2_MAX_MEMORY || "500M",
      time: true,
      merge_logs: true,
      out_file: path.join(logDir, "out.log"),
      error_file: path.join(logDir, "error.log"),
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
