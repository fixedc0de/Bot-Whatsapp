export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
}

export interface BotSession {
  userId: string;
  isConnected: boolean;
  botNumber?: string;
  qrCode?: string;
  qrExpiry?: number;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface Message {
  id: string;
  userId: string;
  chatId: string;
  text: string;
  isIncoming: boolean;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
