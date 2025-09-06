const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Swetha:Swetha2005@cluster0.gq1ro.mongodb.net/civicconnect?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const User = require('./models/User'); // Assuming User.js exists
const Issue = require('./models/Issue');

// Protect middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.',
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.',
    });
  }
};

// Auth Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists',
      });
    }
    const newUser = await User.create({
      username,
      email,
      password,
      name: name || username,
    });
    newUser.password = undefined;
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }
    user.password = undefined;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.get('/auth/logout', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// Issue Routes
app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name username avatar')
      .populate('likes', 'name username avatar')
      .populate('comments.user', 'name username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: issues.length,
      data: { issues },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/issues', protect, async (req, res) => {
  try {
    const issueData = {
      ...req.body,
      reportedBy: req.user.id,
    };
    const issue = await Issue.create(issueData);
    await issue.populate('reportedBy', 'name username avatar');
    res.status(201).json({
      status: 'success',
      data: { issue },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/issues/:id/like', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found',
      });
    }
    const hasLiked = issue.likes.includes(req.user.id);
    if (hasLiked) {
      issue.likes = issue.likes.filter(id => id.toString() !== req.user.id);
    } else {
      issue.likes.push(req.user.id);
    }
    await issue.save();
    res.status(200).json({
      status: 'success',
      data: {
        liked: !hasLiked,
        likesCount: issue.likes.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/issues/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required',
      });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found',
      });
    }
    issue.comments.push({
      user: req.user.id,
      text,
    });
    await issue.save();
    await issue.populate('comments.user', 'name username avatar');
    const newComment = issue.comments[issue.comments.length - 1];
    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.get('/issues/clustered', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name username avatar')
      .sort({ createdAt: -1 });
    const clusters = [];
    const clusterRadius = 0.01; // ~1km
    issues.forEach(issue => {
      if (!issue.location || !issue.location.lat || !issue.location.lng) return;
      let addedToCluster = false;
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(issue.location.lat - cluster.centroid.lat, 2) +
          Math.pow(issue.location.lng - cluster.centroid.lng, 2)
        );
        if (distance < clusterRadius) {
          cluster.issues.push(issue);
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
        clusters.push({
          centroid: { lat: issue.location.lat, lng: issue.location.lng },
          issues: [issue],
        });
      }
    });
    res.status(200).json({
      status: 'success',
      data: { clusters },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Test and Health Endpoints
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Catch-all for React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));