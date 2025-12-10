import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Adjust if needed

class SocketService {
    socket = null;

    connect(userId) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL);

        this.socket.on("connect", () => {
            console.log("Connected to Socket.io");
            if (userId) {
                this.socket.emit("join_room", userId);
            }
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from Socket.io");
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();
