const {
  handleSetUserId,
  handleLogout,
  handleDisconnect,
  handleSendNotificationToUserId,
  handleDeleteNotificationToUserId,
  handleSendMessageToUserIds,
} = require('./socketFunctions');

function handleConnection(socket, userSockets) {
  console.log('A user connected');

  socket.on('setUserId', (userId) => {
    console.log('setting userId');
    handleSetUserId(socket, userSockets, userId);
  });
  socket.on('logout', (userId) => handleLogout(socket, userSockets, userId));
  socket.on('sendNotificationToUserId', (userId) =>
    handleSendNotificationToUserId(userSockets, userId),
  );
  socket.on('deleteNotificationToUserId', (userId) =>
    handleDeleteNotificationToUserId(userSockets, userId),
  );
  socket.on('sendMessageToUserId', (userIds, senderId, chatId) => {
    console.log('the message websocket request has been receieved');
    handleSendMessageToUserIds(userSockets, userIds, senderId, chatId);
  });
  socket.on('disconnect', handleDisconnect);
}

module.exports = handleConnection;
