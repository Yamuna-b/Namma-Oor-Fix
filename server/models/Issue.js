const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Water Logging',
      'Stray Dogs',
      'Road Damage',
      'No Street Lights',
      'Uncemented Road',
      'Infrastructure',
      'Sanitation',
      'Safety',
      'Environment',
      'Other'
    ]
  },
  wardNumber: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  urgencyScore: { type: Number, default: 0 },
  images: [String],
  status: { type: String, default: 'Reported', enum: ['Reported', 'In Progress', 'Resolved'] },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // Added timestamp option

module.exports = mongoose.model('Issue', issueSchema);
