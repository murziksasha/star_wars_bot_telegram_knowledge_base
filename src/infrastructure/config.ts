import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1).max(256).optional().or(z.literal("")),
  PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),
  SWAPI_BASE_URL: z.string().url().default("https://swapi.online"),
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  VERCEL: z.string().optional(),
  ENABLE_POLLING: z.enum(["true", "false"]).optional(),
});

export type AppConfig = {
  telegramBotToken: string;
  telegramWebhookSecret: string;
  publicBaseUrl: string;
  swapiBaseUrl: string;
  nodeEnv: string;
  port: number;
  polling: boolean;
  swapiTimeoutMs: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env);
  const telegramBotToken = parsed.TELEGRAM_BOT_TOKEN ?? parsed.BOT_TOKEN;
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN (or BOT_TOKEN) is required");
  }

  const onVercel = Boolean(parsed.VERCEL);
  const polling =
    parsed.ENABLE_POLLING === "true"
      ? true
      : parsed.ENABLE_POLLING === "false"
        ? false
        : !onVercel && parsed.NODE_ENV !== "production";

  return {
    telegramBotToken,
    telegramWebhookSecret: parsed.TELEGRAM_WEBHOOK_SECRET ?? "",
    publicBaseUrl: (parsed.PUBLIC_BASE_URL ?? "").replace(/\/$/, ""),
    swapiBaseUrl: parsed.SWAPI_BASE_URL.replace(/\/$/, ""),
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    polling,
    swapiTimeoutMs: 8000,
  };
}
