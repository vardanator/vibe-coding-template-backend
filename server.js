// server.js

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { PORT, NODE_ENV } = require('./src/config/env');

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📡 Environment: ${NODE_ENV}
🔗 URL: http://localhost:${PORT}
📊 Health check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});