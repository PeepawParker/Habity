const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());

// Routes
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/habits', require('./routes/habitRoutes'));
app.use('/api/v1/follows', require('./routes/followRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/messages', require('./routes/messageRoutes'));

// Set up real-time connections
const { sseSetup } = require('./utils/realTimeConnection/sseSetup');

sseSetup(app);

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = { app, server };
