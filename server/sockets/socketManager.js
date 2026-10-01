let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log('[Socket Connected]: Client ID:', socket.id);

    socket.on('join:room', (room) => {
      socket.join(room);
      console.log('[Socket Room Joined]: Client ' + socket.id + ' joined room ' + room);
    });

    socket.on('disconnect', () => {
      console.log('[Socket Disconnected]: Client ID:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket Warning]: IO instance requested before initialization');
  }
  return io;
};

const emitEvent = (event, data, room = null) => {
  if (!io) return;
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitEvent
};
