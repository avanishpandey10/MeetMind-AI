import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mongoose from 'mongoose';
import meetingRoutes from './src/routes/meetingRoutes.js';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the backend directory
const envPath = resolve(__dirname, '.env');
console.log('📁 Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug: Check if API key is loaded
console.log('🔑 GROQ_API_KEY loaded:', process.env.GROQ_API_KEY ? 'YES ✅' : 'NO ❌');
if (process.env.GROQ_API_KEY) {
  console.log('   Key starts with:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    groq: process.env.GROQ_API_KEY ? 'configured' : 'not configured'
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-assistant';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Running without database - data will not persist');
  }
};

connectDB();

// Routes
app.use('/api/meetings', meetingRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API base URL: http://localhost:${PORT}/api/meetings`);
  
  if (!process.env.GROQ_API_KEY) {
    console.log('\n⚠️  WARNING: GROQ_API_KEY is not set!');
    console.log('   The API will not work until you set your Groq API key.');
    console.log('   1. Get a free key at: https://console.groq.com');
    console.log('   2. Create/edit .env file in the backend folder');
    console.log('   3. Add: GROQ_API_KEY=gsk_your_actual_key_here\n');
  } else {
    console.log('\n✅ Groq API is configured and ready!');
    console.log('   Free tier limits: 30 requests/min, 14,400 requests/day\n');
  }
});

export default app;