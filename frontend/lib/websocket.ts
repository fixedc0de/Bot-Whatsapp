import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:5000';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string, onAuth?: (success: boolean) => void) {
    this.token = token;
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.socket?.emit('authenticate', token);
    });

    this.socket.on('authenticated', (data: { success: boolean; error?: string }) => {
      onAuth?.(data.success);
      if (!data.success) {
        console.error('WebSocket auth failed:', data.error);
        this.disconnect();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const ws = new WebSocketService();
