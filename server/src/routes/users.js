// server/src/routes/users.js - Users routes

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticate, authorize } = require('../utils/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (admin)
router.get('/', authenticate, authorize('admin'), [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    logger.info(`Users retrieved: ${users.length} users by admin ${req.user.username}`);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNextPage: skip + users.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    logger.error('Users retrieval error:', error);
    res.status(500).json({ error: 'Server error during users retrieval' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (admin or self)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is requesting their own profile or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this profile' });
    }

    logger.info(`User profile viewed: ${user.username}`);

    res.json({ user });

  } catch (error) {
    logger.error('User retrieval error:', error);
    res.status(500).json({ error: 'Server error during user retrieval' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin or self)
// @access  Private (admin or self)
router.put('/:id', authenticate, [
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    // Only admins can change role and isActive
    const { profile, role, isActive } = req.body;
    
    if (profile) {
      Object.assign(user.profile, profile);
    }

    if (req.user.role === 'admin') {
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    logger.info(`User updated: ${user.username} by ${req.user.username}`);

    res.json({
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    logger.error('User update error:', error);
    res.status(500).json({ error: 'Server error during user update' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user's posts
    await Post.deleteMany({ author: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    logger.info(`User deleted: ${user.username} by admin ${req.user.username}`);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    logger.error('User deletion error:', error);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
});

// @route   GET /api/users/:id/posts
// @desc    Get posts by user
// @access  Public
router.get('/:id/posts', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      page = 1,
      limit = 10,
      status = 'published',
      sort = '-publishedAt'
    } = req.query;

    // Build query
    const query = { author: req.params.id };

    if (status) query.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const posts = await Post.find(query)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    logger.info(`User posts retrieved: ${posts.length} posts for ${user.username}`);

    res.json({
      posts,
      user: user.getPublicProfile(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNextPage: skip + posts.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    logger.error('User posts retrieval error:', error);
    res.status(500).json({ error: 'Server error during user posts retrieval' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (admin only)
// @access  Private (admin)
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });

    logger.info(`Stats retrieved by admin ${req.user.username}`);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        newThisMonth: newUsersThisMonth
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts
      }
    });

  } catch (error) {
    logger.error('Stats retrieval error:', error);
    res.status(500).json({ error: 'Server error during stats retrieval' });
  }
});

module.exports = router; 