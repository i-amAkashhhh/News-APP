# NewsHub — MERN News Aggregator

A small portfolio project demonstrating **MongoDB, Express, React and Node.js** with a real third-party **GNews REST API** integration. Users can search news, browse categories and save/remove bookmarks in MongoDB.

## Requirements
- Node.js **20+** (Node 20 supports `fetch()` and `AbortSignal.timeout()`)
- MongoDB Community Server locally running on port 27017 **or** MongoDB Atlas URI
- A free GNews API key from https://gnews.io/

## Setup

### 1) Backend
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env`: put your `GNEWS_API_KEY` and `MONGO_URI`. Keep this file private.

Start MongoDB locally or use Atlas. Then:
```bash
npm run dev
```
Backend: http://localhost:5000/api/health

### 2) Frontend (separate terminal)
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

The Vite dev server proxies `/api` calls to `http://localhost:5000`.

## Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |
| GET | `/api/news?category=technology` | GNews top headlines |
| GET | `/api/news?q=artificial%20intelligence` | GNews search |
| GET | `/api/bookmarks` | Fetch saved articles from MongoDB |
| POST | `/api/bookmarks` | Save a news article JSON object |
| DELETE | `/api/bookmarks/:id` | Delete by MongoDB `_id` |

### Example API calls
```bash
curl http://localhost:5000/api/health
curl 'http://localhost:5000/api/news?category=technology'
curl -X POST http://localhost:5000/api/bookmarks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Demo article","url":"https://example.com/story","source":"Demo"}'
curl http://localhost:5000/api/bookmarks
```

## Architecture
```text
React (Vite, port 5173)
    | GET /api/news, GET/POST/DELETE /api/bookmarks
    v
Express + Node.js (port 5000)
    | GET /api/news -> GNews REST API (API key only on server)
    | /api/bookmarks -> Mongoose -> MongoDB
```

## Backend tests
```bash
cd server
npm test
```

## Honest project scope
- This is a **single-user demo**. It has **no authentication**. Do not expose bookmark endpoints publicly until authentication, authorization, input validation and rate limiting are strengthened.
- External GNews limits and licensing restrictions apply. Their free tier is suitable for local learning, not unrestricted public/commercial deployment. See https://gnews.io/terms
- Do not commit your API key or Atlas credentials; `.env` is gitignored.
- Actual live news and MongoDB operations require your key and database to be configured.

## Resume bullet (only after running and verifying)
**NewsHub — MERN News Aggregator** | MongoDB, Express.js, React, Node.js, REST APIs
- Developed a news dashboard with category filtering, keyword search, and bookmark management using the MERN stack.
- Integrated the GNews API through Express endpoints and implemented MongoDB-backed create, read, and delete operations for saved articles.

## Suggested next improvements
Add JWT login, per-user bookmarks, pagination and integration tests before presenting this as a production-grade application.
