import logger from '../utils/logger.js';
import mongoose from 'mongoose';
import dns from 'dns';

// Use Google DNS to resolve MongoDB Atlas SRV records (fixes Windows DNS issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Global cached connection for Serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    logger.info('Using existing cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/b2bholidays';
    mongoose.set('strictQuery', true);
    
    cached.promise = mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 10000 
    }).then((mongooseInstance) => {
      logger.info('New MongoDB connection established:', mongooseInstance.connection.host);
      return mongooseInstance;
    }).catch(err => {
      cached.promise = null;
      logger.error('MongoDB connection failed:', err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
