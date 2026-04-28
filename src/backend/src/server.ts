import 'dotenv/config';

import { createApp } from './app';
import { sequelize } from './models';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start(): Promise<void> {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
