exports.handleSetUserId = function (userId, sseConnections) {
  // Remove SSE connection if exists
  if (sseConnections[userId]) {
    const sseRes = sseConnections[userId];
    sseRes.end();
    delete sseConnections[userId];
    console.log(`Cleared SSE connection for User ${userId}.`);
  }
};

exports.handleDisconnect = function () {
  console.log('A user disconnected');
};

exports.handleSendNotificationToUserId = function (
  sseConnections,
  receivingId,
) {
  if (sseConnections[receivingId]) {
    const sseRes = sseConnections[receivingId];
    sseRes.write(`event: newNotificationCount\ndata: {}\n\n`);
    console.log(`Sent new notification count to User ${receivingId} via SSE.`);
  } else {
    console.log(`User ${receivingId} is offline. Could not send notification.`);
    // Implement offline storage or notification queue logic here
  }
};

exports.handleDeleteNotificationToUserId = function (
  sseConnections,
  receivingId,
) {
  if (sseConnections[receivingId]) {
    const sseRes = sseConnections[receivingId];
    sseRes.write(`event: removeNotificationCount\ndata: {}\n\n`);
    console.log(
      `Sent remove notification count to User ${receivingId} via SSE.`,
    );
  } else {
    console.log(
      `User ${receivingId} is offline. Could not delete notification.`,
    );
    // Implement offline logic here
  }
};

exports.handleSendMessageToUserIds = function (
  sseConnections,
  userIds,
  senderId,
  chatId,
) {
  const filteredUserIds = userIds.filter((userId) => userId !== senderId);

  console.log('is this the problem?');

  filteredUserIds.forEach((userId) => {
    if (sseConnections[userId]) {
      const sseRes = sseConnections[userId];
      sseRes.write(
        `event: newMessageReceived\ndata: ${JSON.stringify({ senderId, chatId })}\n\n`,
      );
      console.log(`Sent new message received event to User ${userId} via SSE.`);
    } else {
      console.log(`User ${userId} is offline. Could not send message.`);
    }
  });
};
