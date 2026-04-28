import 'dotenv/config';
import { sequelize } from '../models';

(async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
