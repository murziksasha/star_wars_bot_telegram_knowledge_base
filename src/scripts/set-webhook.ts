import { loadConfig } from "../infrastructure/config.ts";

const config = loadConfig();
if (!config.publicBaseUrl) {
  throw new Error("PUBLIC_BASE_URL is required to set the webhook");
}
if (!config.telegramWebhookSecret) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET is required to set the webhook");
}

const webhookUrl = `${config.publicBaseUrl}/telegram/webhook`;
const api = `https://api.telegram.org/bot${config.telegramBotToken}/setWebhook`;

const response = await fetch(api, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: config.telegramWebhookSecret,
    allowed_updates: ["message", "callback_query"],
  }),
});

const body = (await response.json()) as { ok?: boolean };
if (!response.ok || body.ok !== true) {
  throw new Error(`setWebhook failed: ${JSON.stringify(body)}`);
}

console.log(`Webhook set to ${webhookUrl}`);
