import 'dotenv/config';
import { createApp } from './app/main.js';
import { env } from './app/core/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening at http://localhost:${env.PORT}`);
});
