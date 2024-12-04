// socketSetup.js

const { Server } = require('socket.io');
const handleConnection = require('./handleConnection');

let io;
const userSockets = {};

const setupSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    handleConnection(socket, userSockets);
  });

  // Export the io instance so that only the socket is exported not the connection setup
  return { io, userSockets };
};

module.exports = setupSocketIO;
