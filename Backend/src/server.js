import 'dotenv/config';
import { createApp } from './app/main.js';
import { env } from './app/core/env.js';
import { logError, logInfo } from './app/core/logger.js';

const app = await createApp();

app.listen(env.PORT, () => {
  logInfo('server.started', { port: env.PORT });
});

process.on('unhandledRejection', (error) => {
  logError('server.unhandled_rejection', { message: error?.message });
});
