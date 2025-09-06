const express = require('express');
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');

const router = express.Router();

// Get all issues (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, status, ward, near } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (ward) filter.wardNumber = ward;

    if (near) {
      const [lat, lng, radius] = near.split(',');
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) || 5000
        }
      };
    }

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name username avatar')
      .populate('likes', 'name username avatar')
      .populate('comments.user', 'name username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: issues.length,
      data: {
        issues
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new issue
router.post('/', auth, async (req, res) => {
  try {
    const issueData = {
      ...req.body,
      reportedBy: req.user.id
    };

    const issue = await Issue.create(issueData);
    await issue.populate('reportedBy', 'name username avatar');

    res.status(201).json({
      status: 'success',
      data: {
        issue
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Like/Unlike issue
router.post('/:id/like', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found'
      });
    }

    const hasLiked = issue.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      issue.likes = issue.likes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // Like
      issue.likes.push(req.user.id);
    }

    await issue.save();

    res.status(200).json({
      status: 'success',
      data: {
        liked: !hasLiked,
        likesCount: issue.likes.length
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required'
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue not found'
      });
    }

    issue.comments.push({
      user: req.user.id,
      text
    });

    await issue.save();
    await issue.populate('comments.user', 'name username avatar');

    const newComment = issue.comments[issue.comments.length - 1];

    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;