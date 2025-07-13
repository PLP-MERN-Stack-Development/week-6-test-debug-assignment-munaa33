// server/src/models/Post.js - Post model

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  readTime: {
    type: Number,
    min: 1
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  meta: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for reading time (if not set)
postSchema.virtual('estimatedReadTime').get(function() {
  if (this.readTime) return this.readTime;
  
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Indexes for better query performance
// Note: slug index is automatically created due to unique: true
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ featured: 1 });
postSchema.index({ tags: 1 });

// Compound indexes
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1 });

// Pre-save middleware to generate slug if not provided
postSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  if (!this.excerpt) {
    this.excerpt = this.content.substring(0, 150) + '...';
  }
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (!this.readTime) {
    this.readTime = this.estimatedReadTime;
  }
  
  next();
});

// Method to increment views
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  
  return this.save();
};

// Static method to find published posts
postSchema.statics.findPublished = function() {
  return this.find({ status: 'published' })
    .populate('author', 'username profile.firstName profile.lastName')
    .populate('category', 'name')
    .sort({ publishedAt: -1 });
};

// Static method to find by slug
postSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, status: 'published' })
    .populate('author', 'username profile.firstName profile.lastName')
    .populate('category', 'name');
};

module.exports = mongoose.model('Post', postSchema); 