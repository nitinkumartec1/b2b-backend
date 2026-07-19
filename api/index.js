import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel Serverless Function Entrypoint
export default async function handler(req, res) {
  // Ensure the database is connected before processing the request
  await connectDB();
  
  // Pass the request to the Express app
  return app(req, res);
}
