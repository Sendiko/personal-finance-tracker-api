import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.APP_PORT || 3000,
  corsOrigins: (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    host: process.env.DB_HOST || "",
  },
  jwt: process.env.JWT_SECRET
};

export default config;
