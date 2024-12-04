const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../appError');
const userModel = require('../../models/userModel');

const protectSSE = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to access this feature.',
          401,
        ),
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await userModel.getUserById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401),
      );
    }

    // Check if the user ID in the token matches the requested user ID
    if (decoded.id !== parseInt(req.params.userId, 10)) {
      return next(
        new AppError('You are not authorized to access this resource.', 403),
      );
    }

    // If everything is okay, save the user to the request object
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

const sseConnections = {};

function sendSSEMessage(userId, eventType, data) {
  if (sseConnections[userId] && sseConnections[userId].write) {
    const eventData = JSON.stringify(data);
    sseConnections[userId].write(`event: ${eventType}\ndata: ${eventData}\n\n`);
    sseConnections[userId].flushHeaders();
    console.log(`Sent ${eventType} event to user ${userId}`);
  } else {
    console.log(`User ${userId} not connected or connection not writable`);
  }
}

function sseSetup(app) {
  app.get('/sse/:userId', protectSSE, (req, res) => {
    const { userId } = req.params;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Content-Encoding': 'none',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    sseConnections[userId] = res;
    console.log(`User ${userId} connected via SSE.`);
    const eventData = JSON.stringify({ followerId: 1 });
    res.write(`event: newFollow\ndata: ${eventData}\n\n`);

    req.on('close', () => {
      delete sseConnections[userId];
      console.log(`User ${userId} disconnected from SSE.`);
    });
  });

  // setInterval(pingClients, 1000);

  console.log('ws', Object.keys(sseConnections));
}

// ... rest of your realTimeConnections.js code ...

module.exports = {
  sseSetup,
  sseConnections,
  sendSSEMessage,
};
