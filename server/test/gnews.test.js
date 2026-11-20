import test from 'node:test';
import assert from 'node:assert/strict';
import { newsUrl } from '../src/services/gnews.js';
test('category request uses top-headlines endpoint', () => {
  const url = newsUrl({ category: 'technology' });
  assert.equal(url.pathname, '/api/v4/top-headlines');
  assert.equal(url.searchParams.get('category'), 'technology');
});
test('search uses search endpoint', () => {
  const url = newsUrl({ query: 'machine learning' });
  assert.equal(url.pathname, '/api/v4/search');
  assert.equal(url.searchParams.get('q'), 'machine learning');
});
test('invalid category is rejected', () => assert.throws(() => newsUrl({ category: 'not-a-category' })));
