const socketIo = require('socket.io');

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        this.io = socketIo(server, {
            cors: {
                origin: "*", // Allow all for now, lock down in prod
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Join user-specific room
            socket.on('join_room', (userId) => {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined room user_${userId}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    notifyUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user_${userId}`).emit(event, data);
        }
    }

    notifyAll(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

module.exports = new SocketService();
