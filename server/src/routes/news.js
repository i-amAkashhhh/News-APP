import { Router } from 'express';
import { getNews } from '../services/gnews.js';
const router = Router();
router.get('/', async (req, res) => {
  try {
    const articles = await getNews({
      category: String(req.query.category || 'general'),
      query: String(req.query.q || '')
    });
    res.json({ articles });
  } catch (error) {
    const status = error.status || (error.message.includes('Invalid') || error.message.includes('limited') ? 400 : 502);
    res.status(status).json({ error: error.message });
  }
});
export default router;
