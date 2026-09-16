import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT ?? "4000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  AI_DAILY_LIMIT_PER_USER: Number(process.env.AI_DAILY_LIMIT_PER_USER ?? 20),
  AI_MONTHLY_GLOBAL_CAP: Number(process.env.AI_MONTHLY_GLOBAL_CAP ?? 1000),
};