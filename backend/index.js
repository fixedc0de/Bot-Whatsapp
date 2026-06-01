import {
  default as makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Store untuk menyimpan pesan saat koneksi aktif
const store = makeInMemoryStore({});

// Fungsi utama untuk memulai bot
async function startBot() {
  console.log('Memulai WhatsApp Bot...');

  // Load session auth state
  const { state, saveCreds } = await useMultiFileAuthState('session');

  // Fetch versi terbaru Baileys
  const { version } = await fetchLatestBaileysVersion();

  // Buat socket WhatsApp
  const sock = makeWASocket({
    version,
    printQRInTerminal: false, // Kita akan handle QR code manual
    auth: state,
    browser: ['WhatsApp Bot', 'Chrome', '120.0.0']
  });

  // Simpan kredensial setiap kali ada update
  sock.ev.on('creds.update', saveCreds);

  // Handle QR Code
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Tampilkan QR code di terminal
      qrcode.generate(qr, { small: true });
      console.log('\nScan QR code di atas dengan WhatsApp Anda!\n');
    }

    if (connection === 'close') {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;

      console.log('Koneksi tertutup, alasan:', reason);

      if (shouldReconnect) {
        console.log('Menghubungkan ulang...');
        startBot();
      } else {
        console.log('Silakan jalankan ulang bot dan scan QR code baru');
        process.exit(1);
      }
    } else if (connection === 'open') {
      console.log('✅ Berhasil terhubung ke WhatsApp!');
    }
  });

  // Handle pesan masuk
  sock.ev.on('messages.upsert', async (event) => {
    const messages = event.messages;
    
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const senderId = msg.key.remoteJid;
      const senderName = msg.pushName || 'Unknown';
      const messageContent = msg.message?.conversation || 
                            msg.message?.extendedTextMessage?.text || 
                            JSON.stringify(msg.message);

      console.log(`📨 Pesan dari ${senderName} (${senderId}): ${messageContent}`);

      // Contoh auto-reply sederhana
      if (messageContent.toLowerCase() === '/ping') {
        await sock.sendMessage(senderId!, { text: '🤖 Pong! Bot aktif.' });
        console.log(`✅ Membalas ke ${senderName}: Pong!`);
      }

      if (messageContent.toLowerCase() === '/menu') {
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
        await sock.sendMessage(senderId!, { text: menu });
      }

      if (messageContent.toLowerCase() === '/info') {
        const info = `
Bot WhatsApp menggunakan Baileys Library
Versi: 1.0.0
Status: Aktif ✅
        `.trim();
        await sock.sendMessage(senderId!, { text: info });
      }

      if (messageContent.toLowerCase() === '/help' || messageContent.toLowerCase() === '/bantuan') {
        const help = `
Cara menggunakan bot:
1. Ketik /ping untuk cek status
2. Ketik /menu untuk lihat perintah
3. Ketik /info untuk info bot

Untuk bantuan lebih lanjut, hubungi developer.
        `.trim();
        await sock.sendMessage(senderId!, { text: help });
      }
    }
  });

  // Simpan store data
  store.bind(sock.ev);

  return sock;
}

// Jalankan bot
startBot().catch((err) => {
  console.error('Error saat memulai bot:', err);
  process.exit(1);
});
