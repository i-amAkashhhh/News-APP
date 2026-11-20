import React from "react";
import { useCallback, useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, Search, Newspaper, RefreshCw, Menu, X } from 'lucide-react';
const CATEGORIES = ['general','technology','business','sports','science','health','entertainment','world'];
const request = async (path, options) => {
  const response = await fetch(`/api${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};
function ArticleCard({ article, saved, onToggle }) {
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '';
  return <article className="article-card">
    <div className="image-area">{article.image ? <img src={article.image} alt="" loading="lazy" onError={e => {e.currentTarget.style.display='none';}} /> : <div className="image-placeholder"><Newspaper size={34}/></div>}</div>
    <div className="article-body"><div className="article-meta"><span>{article.source || 'News'}</span><span>{date}</span></div>
      <h3>{article.title}</h3><p>{article.description || 'Read the full article at the original source.'}</p>
      <div className="article-actions"><a href={article.url} target="_blank" rel="noopener noreferrer">Read article <ExternalLink size={15}/></a>
      <button type="button" className={`save-button ${saved ? 'saved' : ''}`} aria-label={saved ? 'Remove bookmark' : 'Save bookmark'} title={saved ? 'Remove bookmark' : 'Save bookmark'} onClick={() => onToggle(article)}>{saved ? <BookmarkCheck size={21}/> : <Bookmark size={21}/>}</button></div>
    </div>
  </article>;
}
export default function App() {
  const [category, setCategory] = useState('general');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('headlines');
  const [articles, setArticles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const loadBookmarks = useCallback(async () => {
    try { const data = await request('/bookmarks'); setBookmarks(data.bookmarks || []); }
    catch (err) { setNotice(`Bookmarks unavailable: ${err.message}`); }
  }, []);
  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);
  useEffect(() => {
    if (view !== 'headlines') return;
    const controller = new AbortController();
    setLoading(true); setError('');
    const params = new URLSearchParams({ category, ...(search ? { q: search } : {}) });
    request(`/news?${params}`, { signal: controller.signal })
      .then(data => setArticles(data.articles || []))
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [category, search, view, refresh]);
  async function toggleBookmark(article) {
    const stored = bookmarks.find(b => b.url === article.url);
    try {
      if (stored) await request(`/bookmarks/${stored._id}`, { method: 'DELETE' });
      else await request('/bookmarks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(article) });
      await loadBookmarks();
      setNotice(stored ? 'Bookmark removed' : 'Article saved');
    } catch (err) { setNotice(`Could not update bookmarks: ${err.message}`); }
  }
  function selectCategory(c) { setCategory(c); setSearch(''); setQuery(''); setView('headlines'); setMenuOpen(false); }
  const items = view === 'saved' ? bookmarks : articles;
  return <div className="app-shell">
    <header className="site-header"><div className="topbar container"><button className="brand" onClick={() => selectCategory('general')}><span className="brand-icon"><Newspaper size={23}/></span><span>news<span className="accent">hub.</span></span></button>
      <nav className="desktop-nav"><button className={view === 'headlines' ? 'nav-active' : ''} onClick={() => setView('headlines')}>Discover</button><button className={view === 'saved' ? 'nav-active' : ''} onClick={() => setView('saved')}>Saved <span className="count">{bookmarks.length}</span></button></nav>
      <button className="mobile-menu" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </div></header>
    {menuOpen && <nav className="mobile-nav"><button onClick={() => {setView('headlines');setMenuOpen(false);}}>Discover</button><button onClick={() => {setView('saved');setMenuOpen(false);}}>Saved ({bookmarks.length})</button></nav>}
    <main className="container"><section className="hero"><div className="eyebrow"><span className="status-dot"/> YOUR DAILY BRIEFING</div><h1>Stay curious.<br/><span>Stay informed.</span></h1><p>The stories that matter, all in one place. Explore headlines, discover perspectives, and save what interests you.</p>
      <form className="search-form" onSubmit={e => {e.preventDefault();setSearch(query.trim());setView('headlines');}}><Search size={20}/><input aria-label="Search news" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search topics, stories, or keywords..." maxLength={200}/><button type="submit">Search</button></form>
    </section>
    <section className="content-section"><div className="section-row"><div><span className="section-kicker">THE LATEST</span><h2>{view === 'saved' ? 'Your saved stories' : search ? `Results for “${search}”` : 'Top headlines'}</h2></div><button className="refresh-button" onClick={() => view === 'saved' ? loadBookmarks() : setRefresh(r => r+1)}><RefreshCw size={16}/> Refresh</button></div>
      {view === 'headlines' && <div className="category-strip" aria-label="News categories">{CATEGORIES.map(c => <button key={c} className={category === c && !search ? 'selected' : ''} onClick={() => selectCategory(c)}>{c[0].toUpperCase()+c.slice(1)}</button>)}</div>}
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}
      {error && view === 'headlines' && <div className="message error"><strong>Could not load news</strong><p>{error}</p><p>Check your GNews key, API quota and backend connection.</p></div>}
      {loading && view === 'headlines' ? <div className="message">Loading the latest stories…</div> : !error && items.length === 0 ? <div className="message">{view === 'saved' ? 'No saved articles yet. Browse news and tap the bookmark icon.' : 'No stories found. Try a different search.'}</div> : <div className="article-grid">{items.map(a => <ArticleCard key={a.url} article={a} saved={bookmarks.some(b => b.url === a.url)} onToggle={toggleBookmark}/>)}</div>}
    </section></main>
    <footer className="footer container"><strong>newshub.</strong><span>Powered by GNews API · Built with MongoDB, Express, React & Node</span><span>Articles belong to their original publishers.</span></footer>
  </div>;
}
