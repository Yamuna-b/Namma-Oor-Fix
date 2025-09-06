import { useState } from 'react';
import axios from 'axios';

export default function IssueCard({ issue }) {
  // Default to empty state if issue or properties are undefined
  const initialLikes = Array.isArray(issue?.likes) ? issue.likes.length : 0;
  const [likes, setLikes] = useState(initialLikes);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(issue?.comments || []);

  const handleLike = async () => {
    if (!issue?._id) return; // Prevent action if issue is invalid
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await axios.post(
        `http://localhost:5000/issues/${issue._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikes(res.data.data?.likesCount || 0);
    } catch (error) {
      console.error('Error liking issue:', error);
      alert('Please log in to like this issue.');
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
      <h3 className="text-lg font-bold">{issue.title || 'Untitled Issue'}</h3>
      <p>{issue.description || 'No description'}</p>
      <p><strong>Category:</strong> {issue.category || 'N/A'}</p>
      <p><strong>Ward:</strong> {issue.wardNumber || 'N/A'}</p>
      <p><strong>Urgency Score:</strong> {issue.urgencyScore?.toFixed(2) || '0.00'}</p>
      <p><strong>Likes:</strong> {likes}</p>
      <button onClick={handleLike} className="text-blue-600">👍 Like</button>
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
    </div>
  );
}