import 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from './infrastructure/http/create-app.ts';

const { app, bot, config } = await createApp();

if (config.polling) {
  bot.start({
    onStart: (info) => {
      app.log.info(`Polling as @${info.username}`);
    },
  });
} else {
  app.log.info('Webhook mode (polling disabled)');
}

await app.listen({ port: config.port, host: '0.0.0.0' });
if (!process.env.VERCEL) {
  await app.listen({ port: config.port, host: '0.0.0.0' });
} else {
  await app.ready();
}

export default app;
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  await app.ready();
  app.server.emit('request', req, res);
}
