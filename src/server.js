import logger from './utils/logger.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import User from './models/User.js';

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Admin user seed logic for local dev/first run
  const adminEmail = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  
  if (adminEmail && adminPass) {
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({ 
        name: 'System Admin', 
        email: adminEmail, 
        password: adminPass, 
        role: 'admin' 
      });
      logger.info('Admin user created from environment variables.');
    }
  }

  app.listen(PORT, () => {
    logger.info(`B2BHolidays API running locally on :${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}).catch(err => {
  logger.error('Failed to start server:', err.message);
  process.exit(1);
});
