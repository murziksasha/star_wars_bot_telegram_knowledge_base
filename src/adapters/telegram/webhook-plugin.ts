import type { FastifyPluginAsync } from 'fastify';
import { webhookCallback, type Bot } from 'grammy';

type WebhookOpts = {
  bot: Bot;
  secretToken: string;
};

export const telegramWebhookPlugin: FastifyPluginAsync<
  WebhookOpts
> = async (app, opts) => {
  const handler = webhookCallback(
    opts.bot,
    'fastify',
    opts.secretToken ? { secretToken: opts.secretToken } : {},
  );

  app.post('/telegram/webhook', async (req, reply) => {
    try {
      await handler(req, reply);
    } catch (err: any) {
      app.log.error(err, 'Telegram webhook error');
      if (!reply.sent) {
        return reply
          .status(200)
          .send({ ok: false, error: err?.message });
      }
    }
  });
};
