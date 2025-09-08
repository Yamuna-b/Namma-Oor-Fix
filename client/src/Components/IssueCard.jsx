import { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

export default function IssueCard({ issue }) {
  // Default to empty state if issue or properties are undefined
  const initialUp = Array.isArray(issue?.upvotes) ? issue.upvotes.length : (Array.isArray(issue?.likes) ? issue.likes.length : 0);
  const initialDown = Array.isArray(issue?.downvotes) ? issue.downvotes.length : 0;
  const [upvotes, setUpvotes] = useState(initialUp);
  const [downvotes, setDownvotes] = useState(initialDown);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(issue?.comments || []);
  const { user } = useContext(AuthContext) || {};

  const handleUpvote = async () => {
    if (!issue?._id) return; // Prevent action if issue is invalid
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await axios.post(`http://localhost:5000/issues/${issue._id}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUpvotes(res.data.data?.upvotes || 0);
      setDownvotes(res.data.data?.downvotes || 0);
    } catch (error) {
      console.error('Error upvoting issue:', error);
      alert('Please log in to vote on this issue.');
    }
  };

  const handleDownvote = async () => {
    if (!issue?._id) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await axios.post(`http://localhost:5000/issues/${issue._id}/downvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUpvotes(res.data.data?.upvotes || 0);
      setDownvotes(res.data.data?.downvotes || 0);
    } catch (error) {
      console.error('Error downvoting issue:', error);
      alert('Please log in to vote on this issue.');
    }
  };

  const handleComment = async () => {
    if (!issue?._id || !comment.trim()) return; // Prevent action if issue or comment is invalid
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await axios.post(
        `http://localhost:5000/issues/${issue._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, res.data.data.comment]);
      setComment('');
    } catch (error) {
      console.error('Error commenting on issue:', error);
      alert('Please log in to comment on this issue.');
    }
  };

  // Render only if issue is valid
  if (!issue) return null;

  return (
    <div className="border p-4 rounded shadow">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-gray-600">
          {issue.reportedBy?.username || issue.reportedBy?.name || 'User'}
          {issue.reportedBy?.role === 'official' && issue.reportedBy?.isVerified && (
            <span title="Verified Official" className="ml-1 text-yellow-500">★</span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'red' ? 'bg-red-100 text-red-700' : issue.severity === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
          {issue.severity || 'blue'}
        </span>
      </div>
      <h3 className="text-lg font-bold">{issue.title || 'Untitled Issue'}</h3>
      <p>{issue.description || 'No description'}</p>
      <p><strong>Category:</strong> {issue.category || 'N/A'}</p>
      <p><strong>Ward:</strong> {issue.wardNumber || 'N/A'}{issue.zoneNumber ? `, Zone ${issue.zoneNumber}` : ''}</p>
      <p><strong>Status:</strong> {issue.status || 'Reported'}</p>
      <p><strong>Address:</strong> {issue.location?.address || issue.fullAddress || 'N/A'}</p>
      <div className="flex items-center gap-3 my-1">
        <span className="text-sm">Votes: 👍 {upvotes} / 👎 {downvotes}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleUpvote} className="text-blue-600">Upvote</button>
        <button onClick={handleDownvote} className="text-red-600">Downvote</button>
      </div>
      {Array.isArray(issue.images) && issue.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {issue.images.slice(0, 4).map((src, idx) => (
            <img key={idx} src={src} alt="issue" className="w-full h-24 object-cover rounded" />
          ))}
        </div>
      )}
      <div className="mt-4">
        <input
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment"
          className="w-full p-2 border"
        />
        <button onClick={handleComment} className="bg-green-600 text-white px-2 py-1 mt-2">
          Comment
        </button>
        <ul className="mt-2">
          {comments.map((c, i) => (
            <li key={i} className="text-sm border-t pt-1">
              {c.user?.username || 'Anonymous'}: {c.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Official actions */}
      {user?.role === 'official' && user?.isVerified && (
        <OfficialActions issueId={issue._id} />
      )}
    </div>
  );
}

function OfficialActions({ issueId }) {
  const [eta, setEta] = useState('');
  const [severity, setSeverity] = useState('');
  const [reply, setReply] = useState('');

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const acknowledge = async () => {
    try {
      await axios.post(`http://localhost:5000/issues/${issueId}/acknowledge`, { resolutionEta: eta || undefined, severity: severity || undefined }, { headers: headers() });
      alert('Acknowledged');
    } catch (e) { alert('Failed to acknowledge'); }
  };
  const resolve = async () => {
    try {
      await axios.post(`http://localhost:5000/issues/${issueId}/resolve`, {}, { headers: headers() });
      alert('Resolved');
    } catch (e) { alert('Failed to resolve'); }
  };
  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      await axios.post(`http://localhost:5000/issues/${issueId}/reply`, { text: reply }, { headers: headers() });
      setReply('');
      alert('Reply sent');
    } catch (e) { alert('Failed to reply'); }
  };

  return (
    <div className="mt-4 border-t pt-3">
      <div className="text-sm font-semibold mb-2">Official Actions</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input type="datetime-local" value={eta} onChange={e => setEta(e.target.value)} className="p-2 border rounded" />
        <select value={severity} onChange={e => setSeverity(e.target.value)} className="p-2 border rounded">
          <option value="">Severity (optional)</option>
          <option value="blue">Blue</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>
        <button onClick={acknowledge} className="bg-yellow-600 text-white px-3 py-2 rounded">Acknowledge</button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={resolve} className="bg-blue-700 text-white px-3 py-2 rounded">Mark Resolved</button>
      </div>
      <div className="mt-3">
        <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Authorized reply..." className="w-full p-2 border rounded" />
        <button onClick={sendReply} className="bg-gray-800 text-white px-3 py-1 mt-2 rounded">Send Reply</button>
      </div>
    </div>
  );
}