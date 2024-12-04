const { EventEmitter } = require('events');

const eventEmitter = new EventEmitter();
const userConnections = {}; // Store connections by userId

function setupSSE(app) {
  app.post('/send-message', (req, res) => {
    const { userId, message, recipientId } = req.body;

    eventEmitter.emit('message', { userId, message, recipientId });

    res.sendStatus(200);
  });

  app.get('/messages/:userId', (req, res) => {
    const { userId } = req.params;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    if (!userConnections[userId]) {
      userConnections[userId] = [];
    }

    userConnections[userId].push(res);

    const onMessage = ({ userId: senderId, message, recipientId }) => {
      if (recipientId === userId) {
        userConnections[recipientId].forEach((conn) => {
          conn.write(`data: ${JSON.stringify({ senderId, message })}\n\n`);
        });
      }
    };

    eventEmitter.on('message', onMessage);

    console.log('this is good we got something', userId);

    // checks if user has multiple connections, if they do it only closes the relavent one leaving the other connections active, only completely removing the user when all connections are closed
    req.on('close', () => {
      eventEmitter.off('message', onMessage);
      userConnections[userId] = userConnections[userId].filter(
        (conn) => conn !== res,
      );
      if (userConnections[userId].length === 0) {
        delete userConnections[userId];
      }
    });
  });
}

module.exports = setupSSE;
