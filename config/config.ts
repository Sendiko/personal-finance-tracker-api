import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  db: {
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    host: process.env.DB_HOST || "",
  },
  jwt: process.env.JWT_SECRET
};

export default config;
