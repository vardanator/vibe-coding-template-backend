// src/auth/auth.service.js

const User = require('../users/users.model');
const { generateToken, verifyToken } = require('../utils/jwt');

class AuthService {
  // Register new user
  async register(userData) {
    const { username, email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    // Generate tokens
    const accessToken = generateToken({ userId: user._id, role: user.role });
    const refreshToken = generateToken(
      { userId: user._id, role: user.role },
      true
    );

    return {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    };
  }

  // Login user
  async login(email, password) {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateToken({ userId: user._id, role: user.role });
    const refreshToken = generateToken(
      { userId: user._id, role: user.role },
      true
    );

    return {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken);

      // Get user
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const newAccessToken = generateToken({
        userId: user._id,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  // Verify email token (placeholder for email verification)
  async verifyEmail(token) {
    // This is a placeholder - implement your email verification logic
    // You might want to store verification tokens in the database
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Mark email as verified (you'll need to add this field to the schema)
      // user.emailVerified = true;
      // await user.save();

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new Error('Invalid verification token');
    }
  }
}

module.exports = new AuthService();