import { create } from 'zustand';
import { ws } from '../lib/websocket';

interface BotState {
  isConnected: boolean;
  botNumber: string | null;
  qrCode: string | null;
  qrExpiry: number;
  messages: any[];
  status: 'disconnected' | 'connecting' | 'connected' | 'error';

  setConnected: (connected: boolean, botNumber?: string) => void;
  setQRCode: (qr: string, expiry: number) => void;
  addMessage: (message: any) => void;
  setMessages: (messages: any[]) => void;
  setStatus: (status: BotState['status']) => void;

  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  sendMessage: (to: string, text: string) => Promise<void>;
  fetchMessages: (params?: { limit?: number; chatId?: string }) => Promise<void>;
}

export const useBotStore = create<BotState>((set, get) => ({
  isConnected: false,
  botNumber: null,
  qrCode: null,
  qrExpiry: 0,
  messages: [],
  status: 'disconnected',

  setConnected: (connected, botNumber) => 
    set({ isConnected: connected, botNumber: botNumber || null }),
  
  setQRCode: (qr, expiry) => set({ qrCode: qr, qrExpiry: expiry }),
  
  addMessage: (message) => 
    set((state) => ({ messages: [message, ...state.messages] })),
  
  setMessages: (messages) => set({ messages }),
  
  setStatus: (status) => set({ status }),

  startSession: async () => {
    try {
      set({ status: 'connecting' });
      const res = await fetch('/api/bot/start', { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
    } catch (error: any) {
      set({ status: 'error' });
      console.error('Start session failed:', error);
    }
  },

  stopSession: async () => {
    try {
      await fetch('/api/bot/stop', { method: 'POST' });
      set({ isConnected: false, botNumber: null, qrCode: null });
    } catch (error) {
      console.error('Stop session failed:', error);
    }
  },

  sendMessage: async (to: string, text: string) => {
    if (!get().isConnected) throw new Error('Bot not connected');
    
    // Optimistic update
    get().addMessage({
      id: `temp-${Date.now()}`,
      text,
      chatId: to,
      isIncoming: false,
      timestamp: new Date().toISOString(),
      type: 'text',
    });

    // Send via WebSocket
    ws.emit('send-message', { to, text });
  },

  fetchMessages: async (params = {}) => {
    try {
      const search = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/messages?${search}`);
      const data = await res.json();
      set({ messages: data.messages });
    } catch (error) {
      console.error('Fetch messages failed:', error);
    }
  },
}));

// Setup WebSocket listeners
if (typeof window !== 'undefined') {
  ws.on('bot-connected', (data) => {
    useBotStore.getState().setConnected(true, data.botNumber);
    useBotStore.getState().setStatus('connected');
  });

  ws.on('bot-disconnected', () => {
    useBotStore.getState().setConnected(false);
    useBotStore.getState().setStatus('disconnected');
  });

  ws.on('qr-code-generated', (data) => {
    useBotStore.getState().setQRCode(data.qr, data.expiresIn);
  });

  ws.on('message-received', (data) => {
    useBotStore.getState().addMessage({ ...data, isIncoming: true });
  });

  ws.on('message-sent', (data) => {
    // Update temp message with real ID if needed
  });
}
