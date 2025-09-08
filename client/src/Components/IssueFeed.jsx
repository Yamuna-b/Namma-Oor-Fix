import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import IssueCard from './IssueCard';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-3">
          Something went wrong with this issue card. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function IssueFeed() {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = (p) => {
    return axios.get(`http://localhost:5000/feed/trending?page=${p}&limit=12`)
      .then(res => {
        if (res.data.status === 'success') {
          const newItems = res.data.data.issues || [];
          setIssues(prev => [...prev, ...newItems]);
          const total = res.data.data.total || 0;
          const limit = res.data.data.limit || 12;
          const loaded = (p) * limit;
          setHasMore(loaded < total);
        }
      })
      .catch(() => setHasMore(false));
  };

  useEffect(() => { fetchPage(1); }, []);

  useEffect(() => {
    const sentinel = document.getElementById('feed-sentinel');
    if (!sentinel) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore) {
          const next = page + 1;
          setPage(next);
          fetchPage(next);
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [page, hasMore]);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-extrabold mb-6 text-center text-red-600">🔥 Trending Issues</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {issues.map(issue => (
          <ErrorBoundary key={issue._id}>
            <IssueCard issue={issue} />
          </ErrorBoundary>
        ))}
      </div>
      <div id="feed-sentinel" className="h-8"></div>
    </div>
  );
}
