import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import newsRouter from './routes/news.js';
import bookmarkRouter from './routes/bookmarks.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/news', newsRouter);
app.use('/api/bookmarks', bookmarkRouter);
app.use((err, _req, res, _next) => {
  console.error(err.message);
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT || 5000);
try {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in server/.env');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 7000 });
  app.listen(port, () => console.log(`NewsHub API on http://localhost:${port}`));
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1);
}
