import { create } from 'zustand';
import { BotSession, Message } from '@/types';

interface BotState {
  token: string | null;
  userId: string | null;
  isConnected: boolean;
  botNumber?: string;
  qrCode?: string;
  qrExpiry?: number;
  status: BotSession['status'];
  messages: Message[];
  
  setToken: (token: string, userId: string) => void;
  clearToken: () => void;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  sendMessage: (to: string, text: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export const useBotStore = create<BotState>((set, get) => ({
  token: null,
  userId: null,
  isConnected: false,
  botNumber: undefined,
  qrCode: undefined,
  qrExpiry: undefined,
  status: 'disconnected',
  messages: [],

  setToken: (token, userId) => {
    localStorage.setItem('bot_token', token);
    localStorage.setItem('bot_user_id', userId);
    set({ token, userId });
  },

  clearToken: () => {
    localStorage.removeItem('bot_token');
    localStorage.removeItem('bot_user_id');
    set({ token: null, userId: null, isConnected: false, botNumber: undefined, qrCode: undefined });
  },

  startSession: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (result.success) {
        set({
          qrCode: result.data?.qrCode,
          qrExpiry: result.data?.expiresIn,
          status: 'connecting',
        });

        // Poll for QR expiry
        if (result.data?.expiresIn) {
          const interval = setInterval(() => {
            const expiry = get().qrExpiry;
            if (expiry && expiry > 0) {
              set({ qrExpiry: expiry - 1 });
            } else {
              clearInterval(interval);
              get().checkStatus();
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  },

  stopSession: async () => {
    const { token } = get();
    if (!token) return;

    try {
      await fetch('/api/bot/stop', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        isConnected: false,
        botNumber: undefined,
        qrCode: undefined,
        qrExpiry: undefined,
        status: 'disconnected',
      });
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  },

  sendMessage: async (to: string, text: string) => {
    const { token } = get();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/bot/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, text }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to send message');
    }
  },

  fetchMessages: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (result.success) {
        set({ messages: result.data.messages });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  checkStatus: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await fetch('/api/bot/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (result.success) {
        set({
          isConnected: result.data?.isConnected || false,
          botNumber: result.data?.botNumber,
          qrCode: result.data?.qrCode,
          qrExpiry: result.data?.qrExpiry,
          status: result.data?.status || 'disconnected',
        });
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  },
}));
