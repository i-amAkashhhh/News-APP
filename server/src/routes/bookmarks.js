import { Router } from 'express';
import Bookmark from '../models/Bookmark.js';
const router = Router();
router.get('/', async (_req, res, next) => {
  try { res.json({ bookmarks: await Bookmark.find().sort({ createdAt: -1 }).lean() }); }
  catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, description, url, image, source, publishedAt } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || typeof url !== 'string')
      return res.status(400).json({ error: 'Article title and URL are required' });
    let parsed;
    try { parsed = new URL(url); } catch { return res.status(400).json({ error: 'Invalid article URL' }); }
    if (!['http:', 'https:'].includes(parsed.protocol)) return res.status(400).json({ error: 'Invalid article URL' });
    const bookmark = await Bookmark.findOneAndUpdate(
      { url }, { $setOnInsert: { title, description: description || '', url, image: image || '', source: source || '', publishedAt: publishedAt || '' } },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ bookmark });
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ error: 'Invalid bookmark ID' });
    const removed = await Bookmark.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Bookmark not found' });
    res.json({ message: 'Bookmark removed' });
  } catch (err) { next(err); }
});
export default router;
