import React, { useState } from "react";
import axios from "axios";

export default function IssueCard({ issue }) {
  const token = localStorage.getItem("token");

  const [upvotes, setUpvotes] = useState(issue?.upvotes?.length || 0);
  const [downvotes, setDownvotes] = useState(issue?.downvotes?.length || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(issue?.comments || []);

  const handleVote = async (type) => {
    if (!token) return alert("Please log in to vote");
    try {
      const res = await axios.post(
        `http://localhost:5000/issues/${issue._id}/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.data;
      setUpvotes(updated?.upvotes?.length || 0);
      setDownvotes(updated?.downvotes?.length || 0);
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const handleComment = async () => {
    if (!token || !comment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/issues/${issue._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([...comments, res.data.data.comment]);
      setComment("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // 🌈 Color palette by severity
  const bgColor =
    issue?.severity === "red"
      ? "bg-gradient-to-br from-red-100 via-pink-50 to-red-50"
      : issue?.severity === "yellow"
      ? "bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-50"
      : "bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50";

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl shadow-lg border border-gray-200 p-4 h-[500px] 
      ${bgColor} hover:shadow-2xl hover:scale-[1.03] transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-800">
          {issue?.reportedBy?.username || "Anonymous"}
        </span>
        <span
          className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
            issue?.severity === "red"
              ? "bg-red-500 text-white"
              : issue?.severity === "yellow"
              ? "bg-yellow-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {issue?.severity || "Blue"}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
        {issue?.title || "Untitled Issue"}
      </h3>
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {issue?.description || "No description provided."}
      </p>

      {/* Details */}
      <div className="text-xs text-gray-700 space-y-1 mb-3">
        <p>
          <strong>Category:</strong> {issue?.category || "N/A"}
        </p>
        <p>
          <strong>Ward:</strong> {issue?.wardNumber || "N/A"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`${
              issue?.status === "Open"
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }`}
          >
            {issue?.status || "Reported"}
          </span>
        </p>
        <p className="truncate">
          <strong>Address:</strong> {issue?.location?.address || "N/A"}
        </p>
      </div>

      {/* Images */}
      {Array.isArray(issue?.images) && issue.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {issue.images.slice(0, 4).map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="issue"
              className="w-full h-20 object-cover rounded-lg border shadow-sm hover:scale-105 transition-transform"
            />
          ))}
        </div>
      )}

      {/* Votes */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => handleVote("upvote")}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md transition"
        >
          👍 {upvotes}
        </button>
        <button
          onClick={() => handleVote("downvote")}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md transition"
        >
          👎 {downvotes}
        </button>
      </div>

      {/* Comments */}
      <div className="border-t pt-2 mt-auto">
        <h4 className="text-xs font-semibold mb-2 text-gray-800">💬 Comments</h4>
        <div className="flex gap-2 mb-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded-lg p-1 text-xs focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleComment}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition"
          >
            Send
          </button>
        </div>
        <ul className="space-y-1 text-xs max-h-16 overflow-y-auto">
          {comments.map((c, i) => (
            <li key={i} className="border-t pt-1">
              <span className="font-medium">
                {c.user?.username || "Anonymous"}:
              </span>{" "}
              {c.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
