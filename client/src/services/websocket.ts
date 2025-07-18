import { io, Socket } from "socket.io-client";
import NotificationService from "./notifications";

class WebSocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = "http://10.94.178.232:3000"; // Change this to your server URL

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit("joinRoom", room);
    }
  }

  leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit("leaveRoom", room);
    }
  }

  onPaymentUpdate(callback: (payment: any) => void): void {
    if (this.socket) {
      this.socket.on("paymentUpdate", callback);
    }
  }

  onNewPayment(callback: (payment: any) => void): void {
    if (this.socket) {
      this.socket.on("newPayment", (payment) => {
        callback(payment);
        // Trigger notification for new payment
        if (payment.status === "success") {
          NotificationService.notifyPaymentSuccess(payment);
        } else if (payment.status === "failed") {
          NotificationService.notifyPaymentFailed(payment);
        }
      });
    }
  }

  onStatsUpdate(callback: (stats: any) => void): void {
    if (this.socket) {
      this.socket.on("statsUpdate", callback);
    }
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new WebSocketService();
