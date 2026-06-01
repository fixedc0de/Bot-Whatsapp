import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import { db, generateId } from './db';
import { BotSession, Message } from '@/types';

// Global socket instances per user (for serverless, this resets on cold start)
const sockets: Map<string, WASocket> = new Map();

interface BotManager {
  startSession: (userId: string) => Promise<{ success: boolean; qrCode?: string; expiresIn?: number; error?: string }>;
  stopSession: (userId: string) => Promise<void>;
  sendMessage: (userId: string, to: string, text: string) => Promise<boolean>;
  getSession: (userId: string) => BotSession | undefined;
}

export const botManager: BotManager = {
  async startSession(userId: string) {
    try {
      // Check if session already exists
      const existingSession = db.sessions.findByUserId(userId);
      if (existingSession?.isConnected) {
        return { success: true, error: 'Session already connected' };
      }

      // Create session directory for auth state
      const sessionDir = `/tmp/session_${userId}`;
      
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        browser: ['WhatsApp Bot', 'Chrome', '120.0.0'],
      });

      sock.ev.on('creds.update', saveCreds);

      let qrTimeout: NodeJS.Timeout;

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          // Generate QR code as data URL
          const qrCodeDataUrl = await QRCode.toDataURL(qr);
          const expiresIn = 60; // QR expires in 60 seconds

          db.sessions.update(userId, {
            qrCode: qrCodeDataUrl,
            qrExpiry: expiresIn,
            status: 'connecting',
          });

          // Clear QR after expiry
          clearTimeout(qrTimeout!);
          qrTimeout = setTimeout(() => {
            db.sessions.update(userId, { qrCode: undefined, qrExpiry: undefined });
          }, expiresIn * 1000);
        }

        if (connection === 'close') {
          const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = reason !== DisconnectReason.loggedOut;

          if (shouldReconnect) {
            // Auto reconnect
            this.startSession(userId);
          } else {
            db.sessions.update(userId, {
              isConnected: false,
              status: 'disconnected',
              botNumber: undefined,
            });
            sockets.delete(userId);
          }
        } else if (connection === 'open') {
          const botNumber = sock.user?.id?.split('@')[0];
          db.sessions.update(userId, {
            isConnected: true,
            botNumber: botNumber || undefined,
            qrCode: undefined,
            qrExpiry: undefined,
            status: 'connected',
          });
          console.log(`✅ Bot connected for user ${userId}: ${botNumber}`);
        }
      });

      sock.ev.on('messages.upsert', async (event) => {
        const messages = event.messages;

        for (const msg of messages) {
          if (!msg.message || msg.key.fromMe) continue;

          const senderId = msg.key.remoteJid || '';
          const senderName = msg.pushName || 'Unknown';
          const messageContent =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            JSON.stringify(msg.message);

          console.log(`📨 Message from ${senderName} (${senderId}): ${messageContent}`);

          // Store message
          const storedMessage: Message = {
            id: generateId(),
            userId,
            chatId: senderId,
            text: messageContent,
            isIncoming: true,
            timestamp: new Date().toISOString(),
            type: 'text',
          };
          db.messages.add(userId, storedMessage);

          // Auto-reply commands
          await handleCommand(sock, senderId, messageContent.toLowerCase());
        }
      });

      // Initialize session
      const session: BotSession = {
        userId,
        isConnected: false,
        status: 'connecting',
      };
      db.sessions.create(session);
      sockets.set(userId, sock);

      return { success: true, expiresIn: 60 };
    } catch (error: any) {
      console.error('Error starting session:', error);
      return { success: false, error: error.message };
    }
  },

  async stopSession(userId: string) {
    const sock = sockets.get(userId);
    if (sock) {
      sock.end(undefined);
      sockets.delete(userId);
    }
    db.sessions.update(userId, {
      isConnected: false,
      status: 'disconnected',
      botNumber: undefined,
      qrCode: undefined,
      qrExpiry: undefined,
    });
  },

  async sendMessage(userId: string, to: string, text: string): Promise<boolean> {
    const sock = sockets.get(userId);
    if (!sock || !db.sessions.findByUserId(userId)?.isConnected) {
      return false;
    }

    try {
      // Add country code if missing
      let formattedTo = to.replace(/\D/g, '');
      if (!formattedTo.startsWith('62') && !formattedTo.startsWith('+')) {
        formattedTo = '62' + formattedTo;
      }
      formattedTo = formattedTo.replace(/^0/, '62') + '@s.whatsapp.net';

      await sock.sendMessage(formattedTo, { text });

      // Store sent message
      const message: Message = {
        id: generateId(),
        userId,
        chatId: formattedTo,
        text,
        isIncoming: false,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      db.messages.add(userId, message);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  },

  getSession(userId: string) {
    return db.sessions.findByUserId(userId);
  },
};

async function handleCommand(sock: WASocket, senderId: string, command: string) {
  if (command === '/ping') {
    await sock.sendMessage(senderId, { text: '🤖 Pong! Bot aktif.' });
  } else if (command === '/menu') {
    const menu = `
╔═══════════════════
║   🤖 WHATSAPP BOT
╠═══════════════════
║ /ping - Cek status bot
║ /menu - Tampilkan menu ini
║ /info - Info bot
║ /help - Bantuan
╚═══════════════════
    `.trim();
    await sock.sendMessage(senderId, { text: menu });
  } else if (command === '/info') {
    await sock.sendMessage(senderId, { text: 'Bot WhatsApp v2.0\nStatus: Aktif ✅' });
  } else if (command === '/help' || command === '/bantuan') {
    await sock.sendMessage(senderId, {
      text: 'Cara menggunakan:\n1. /ping - cek status\n2. /menu - lihat perintah\n3. /info - info bot',
    });
  }
}
