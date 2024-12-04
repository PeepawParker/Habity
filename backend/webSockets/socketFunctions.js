exports.handleSetUserId = function (socket, userSockets, userId) {
  userSockets[userId] = socket;
  console.log(`User ${userId} connected.`);
};

exports.handleLogout = function (socket, userSockets, userId) {
  delete userSockets[userId];
  socket.disconnect();
  console.log(`User ${userId} logged out and disconnected`);
};

exports.handleDisconnect = function () {
  console.log('A user disconnected');
};

exports.handleSendNotificationToUserId = function (userSockets, receivingId) {
  const receivingSocket = userSockets[receivingId];

  if (receivingSocket) {
    console.log('we are adding');
    receivingSocket.emit('newNotificationCount');
  }
};

exports.handleDeleteNotificationToUserId = function (userSockets, receivingId) {
  const receivingSocket = userSockets[receivingId];

  if (receivingSocket) {
    console.log('we are deleting');
    receivingSocket.emit('removeNotificationCount');
  }
};

exports.handleRecieveNotification = function () {};

exports.handleSendMessageToUserIds = function (
  userSockets,
  userIds,
  senderId,
  chatId,
) {
  console.log(userIds, senderId, chatId);
  const filteredUserIds = userIds.filter(
    (userId) => userId.user_id !== senderId,
  );
  console.log(filteredUserIds);
  const receivingSockets = filteredUserIds
    .map((userId) => userSockets[userId.user_id])
    .filter((socket) => socket);
  receivingSockets.forEach((socket) => {
    socket.emit('newMessageReceived', { senderId, chatId });
    console.log('a websocket has been sent out by:', senderId);
  });
};
