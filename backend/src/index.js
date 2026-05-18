import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import meetingRoutes from './routes/meetingRoutes.js';
import chatRoutes from './routes/chat.js';
import { initDatabase } from './services/storageService.js';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/meetings', meetingRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});