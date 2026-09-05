import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET: z.preprocess(
    (v) => (v === undefined || v === null ? '' : String(v).trim()),
    z.string().max(256).default(''),
  ),
  PUBLIC_BASE_URL: z.preprocess(
    (v) => (v === undefined || v === null ? '' : String(v).trim()),
    z.string().default(''),
  ),
  SWAPI_BASE_URL: z.preprocess(
    (v) =>
      !v || String(v).trim() === ''
        ? 'https://swapi.online'
        : String(v).trim(),
    z.string().url().default('https://swapi.online'),
  ),
  NODE_ENV: z.preprocess(
    (v) =>
      !v || String(v).trim() === ''
        ? 'development'
        : String(v).trim(),
    z.string().default('development'),
  ),
  PORT: z.preprocess(
    (v) =>
      !v || isNaN(Number(v)) || Number(v) <= 0 ? 3000 : Number(v),
    z.number().int().positive().default(3000),
  ),
  VERCEL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  ENABLE_POLLING: z.enum(['true', 'false']).optional(),
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

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const parsed = envSchema.parse(env);
  const telegramBotToken =
    parsed.TELEGRAM_BOT_TOKEN ?? parsed.BOT_TOKEN;
  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN (or BOT_TOKEN) is required');
  }

  const onVercel = Boolean(parsed.VERCEL);
  const polling =
    parsed.ENABLE_POLLING === 'true'
      ? true
      : parsed.ENABLE_POLLING === 'false'
        ? false
        : !onVercel && parsed.NODE_ENV !== 'production';

  const rawBaseUrl =
    parsed.PUBLIC_BASE_URL ||
    (parsed.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${parsed.VERCEL_PROJECT_PRODUCTION_URL}`
      : parsed.VERCEL_URL
        ? `https://${parsed.VERCEL_URL}`
        : '');

  const publicBaseUrl = (
    rawBaseUrl.startsWith('http://') ||
    rawBaseUrl.startsWith('https://')
      ? rawBaseUrl
      : rawBaseUrl
        ? `https://${rawBaseUrl}`
        : ''
  ).replace(/\/$/, '');

  return {
    telegramBotToken,
    telegramWebhookSecret: parsed.TELEGRAM_WEBHOOK_SECRET,
    publicBaseUrl,
    swapiBaseUrl: parsed.SWAPI_BASE_URL.replace(/\/$/, ''),
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    polling,
    swapiTimeoutMs: 8000,
  };
}
