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
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/issues/clustered')
      .then(res => {
        if (res.data.status === 'success') {
          setClusters(res.data.data?.clusters || []);
        } else {
          setClusters([]);
        }
      })
      .catch(err => {
        console.error('Error fetching clustered issues:', err);
        setClusters([]);
      });
  }, []);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-extrabold mb-8 text-center text-red-600">🧭 Issues by Location Cluster</h2>
      {clusters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clusters.map((cluster, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-red-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-red-500 to-yellow-400 h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600">Cluster {idx + 1}</h3>
                  <p className="text-sm text-gray-500">
                    Centroid: <span className="font-mono">{cluster.centroid.lat.toFixed(4)}, {cluster.centroid.lng.toFixed(4)}</span>
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                  {cluster.issues.length} issues
                </span>
              </div>
              <div className="space-y-4">
                {cluster.issues.length > 0 ? (
                  cluster.issues.map(issue =>
                    issue ? (
                      <ErrorBoundary key={issue._id}>
                        <IssueCard issue={issue} />
                      </ErrorBoundary>
                    ) : null
                  )
                ) : (
                  <div className="text-gray-400 text-sm">No issues in this cluster.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-yellow-50 rounded-xl text-lg text-gray-600">
          No clustered issues found.
        </div>
      )}
    </div>
  );
}
