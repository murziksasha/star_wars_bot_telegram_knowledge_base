import { loadConfig } from "../infrastructure/config.ts";

const config = loadConfig();
const api = `https://api.telegram.org/bot${config.telegramBotToken}/deleteWebhook`;
const response = await fetch(api, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ drop_pending_updates: false }),
});
const body = (await response.json()) as { ok?: boolean };
if (!response.ok || body.ok !== true) {
  throw new Error(`deleteWebhook failed: ${JSON.stringify(body)}`);
}
console.log("Webhook deleted. Local polling can receive updates.");
