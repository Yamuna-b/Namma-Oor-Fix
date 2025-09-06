const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update user profile
router.patch('/:id', auth, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own profile'
      });
    }

    const allowedUpdates = ['name', 'bio', 'avatar', 'isPrivate', 'locationAccess', 'notifications'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid updates'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Follow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already following this user'
      });
    }

    // Add to following list
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();

    res.status(200).json({
      status: 'success',
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Unfollow user
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot unfollow yourself'
      });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if actually following
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not following this user'
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    res.status(200).json({
      status: 'success',
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;