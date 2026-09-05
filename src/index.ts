import 'fastify';
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

export default app;
