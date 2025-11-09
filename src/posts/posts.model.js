// src/posts/posts.model.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'posts', // Explicit collection name in plural
  }
);

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Pre-save middleware to set publishedAt when status changes to published
postSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.published = true;
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;