const CATEGORIES = new Set(['general','world','nation','business','technology','entertainment','sports','science','health']);
export { CATEGORIES };
export function newsUrl({ category = 'general', query = '' } = {}) {
  const cleanQuery = String(query).trim();
  if (cleanQuery.length > 200) throw new Error('Search is limited to 200 characters');
  if (!CATEGORIES.has(category)) throw new Error('Invalid news category');
  const isSearch = Boolean(cleanQuery);
  const url = new URL(`https://gnews.io/api/v4/${isSearch ? 'search' : 'top-headlines'}`);
  url.searchParams.set('lang', 'en');
  url.searchParams.set('country', 'in');
  url.searchParams.set('max', '10');
  if (isSearch) url.searchParams.set('q', cleanQuery);
  else url.searchParams.set('category', category);
  url.searchParams.set('apikey', process.env.GNEWS_API_KEY || '');
  return url;
}
export async function getNews(options) {
  if (!process.env.GNEWS_API_KEY || process.env.GNEWS_API_KEY === 'YOUR_GNEWS_KEY_HERE') {
    const error = new Error('Set GNEWS_API_KEY in server/.env to load live news');
    error.status = 503;
    throw error;
  }
  const url = newsUrl(options);
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    const error = new Error(response.status === 429 ? 'News provider rate limit reached. Try again later.' : `News provider returned HTTP ${response.status}`);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }
  const data = await response.json();
  return (data.articles || []).map(({ title, description, url, image, publishedAt, source }) => ({
    title, description, url, image, publishedAt, source: source?.name || 'Unknown source'
  }));
}
