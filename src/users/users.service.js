// src/users/users.service.js

const User = require('./users.model');
const { PAGINATION } = require('../config/constants');

class UsersService {
  // Get all users with pagination
  async getAllUsers(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
    const skip = (page - 1) * limit;
    
    // Ensure limit doesn't exceed maximum
    const validLimit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('-password')
        .skip(skip)
        .limit(validLimit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ isActive: true }),
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: validLimit,
        total,
        pages: Math.ceil(total / validLimit),
      },
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Get user by email
  async getUserByEmail(email) {
    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  async updateUser(userId, updateData) {
    // Fields that users can update
    const allowedUpdates = ['firstName', 'lastName', 'email', 'username'];
    const updates = {};

    // Filter only allowed fields
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user role (admin only)
  async updateUserRole(userId, newRole) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: newRole } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Soft delete user (set isActive to false)
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  // Hard delete user (permanent removal)
  async permanentlyDeleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User permanently deleted' };
  }

  // Search users by username or email
  async searchUsers(searchTerm, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
    const skip = (page - 1) * limit;
    const validLimit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const searchRegex = new RegExp(searchTerm, 'i');

    const [users, total] = await Promise.all([
      User.find({
        isActive: true,
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      })
        .select('-password')
        .skip(skip)
        .limit(validLimit)
        .sort({ createdAt: -1 }),
      User.countDocuments({
        isActive: true,
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      }),
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: validLimit,
        total,
        pages: Math.ceil(total / validLimit),
      },
    };
  }
}

module.exports = new UsersService();