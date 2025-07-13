// server/src/routes/posts.js - Posts routes

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Post = require('../models/Post');
const { authenticate, authorize } = require('../utils/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validatePost = [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticate, validatePost, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, content, category, tags, status, meta } = req.body;

    // Create new post
    const post = new Post({
      title,
      content,
      category,
      tags: tags || [],
      status: status || 'draft',
      author: req.user._id,
      meta
    });

    await post.save();

    // Populate author and category
    await post.populate('author', 'username profile.firstName profile.lastName');
    await post.populate('category', 'name');

    logger.info(`New post created: ${post.title} by ${req.user.username}`);

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    logger.error('Post creation error:', error);
    res.status(500).json({ error: 'Server error during post creation' });
  }
});

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
// @access  Public
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ID'),
  query('author')
    .optional()
    .isMongoId()
    .withMessage('Author must be a valid MongoDB ID'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  query('search')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters')
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
      category,
      author,
      status = 'published',
      search,
      sort = '-publishedAt'
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (author) query.author = author;
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    logger.info(`Posts retrieved: ${posts.length} posts`);

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNextPage: skip + posts.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    logger.error('Posts retrieval error:', error);
    res.status(500).json({ error: 'Server error during posts retrieval' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName')
      .populate('category', 'name');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await post.incrementViews();

    logger.info(`Post viewed: ${post.title}`);

    res.json({ post });

  } catch (error) {
    logger.error('Post retrieval error:', error);
    res.status(500).json({ error: 'Server error during post retrieval' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (author or admin)
router.put('/:id', authenticate, validatePost, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Update post
    const { title, content, category, tags, status, meta } = req.body;
    
    Object.assign(post, {
      title,
      content,
      category,
      tags: tags || post.tags,
      status,
      meta
    });

    await post.save();

    // Populate author and category
    await post.populate('author', 'username profile.firstName profile.lastName');
    await post.populate('category', 'name');

    logger.info(`Post updated: ${post.title} by ${req.user.username}`);

    res.json({
      message: 'Post updated successfully',
      post
    });

  } catch (error) {
    logger.error('Post update error:', error);
    res.status(500).json({ error: 'Server error during post update' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (author or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    logger.info(`Post deleted: ${post.title} by ${req.user.username}`);

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    logger.error('Post deletion error:', error);
    res.status(500).json({ error: 'Server error during post deletion' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.toggleLike(req.user._id);

    logger.info(`Post like toggled: ${post.title} by ${req.user.username}`);

    res.json({
      message: 'Like toggled successfully',
      likeCount: post.likeCount,
      isLiked: post.likes.includes(req.user._id)
    });

  } catch (error) {
    logger.error('Post like error:', error);
    res.status(500).json({ error: 'Server error during like operation' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comments', authenticate, [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
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

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.addComment(req.user._id, req.body.content);

    // Populate the new comment
    await post.populate('comments.user', 'username profile.firstName profile.lastName');

    logger.info(`Comment added to post: ${post.title} by ${req.user.username}`);

    res.json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });

  } catch (error) {
    logger.error('Comment addition error:', error);
    res.status(500).json({ error: 'Server error during comment addition' });
  }
});

module.exports = router; 