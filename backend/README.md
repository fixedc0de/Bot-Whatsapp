# WhatsApp Bot dengan Baileys

Bot WhatsApp sederhana menggunakan library @whiskeysockets/baileys.

## Fitur

- ✅ Auto-generate QR code untuk scan
- ✅ Auto-reply dengan perintah sederhana
- ✅ Session persistence (tidak perlu scan ulang setiap restart)
- ✅ Reconnect otomatis jika koneksi terputus

## Perintah Bot

- `/ping` - Cek status bot
- `/menu` - Tampilkan daftar perintah
- `/info` - Informasi bot
- `/help` atau `/bantuan` - Bantuan penggunaan

## Instalasi

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Jalankan bot

```bash
npm start
```

atau untuk development mode dengan auto-reload:

```bash
npm run dev
```

### 3. Scan QR Code

Setelah bot dijalankan, akan muncul QR code di terminal. Scan QR code tersebut menggunakan WhatsApp Anda:
- Buka WhatsApp di HP
- Pilih Menu > Perangkat Tertaut
- Tap "Tautkan Perangkat"
- Scan QR code yang muncul di terminal

## Struktur Folder

```
backend/
├── index.js          # File utama bot
├── package.json      # Dependencies
└── session/          # Folder session (auto-generated)
```

## Kustomisasi

Anda dapat menambahkan fitur baru dengan mengedit file `index.js`. Beberapa ide:

- Tambah perintah baru di event `messages.upsert`
- Kirim media (gambar, video, dokumen)
- Broadcast pesan ke banyak kontak
- Integrasi dengan API eksternal

## Troubleshooting

**QR code tidak muncul?**
- Pastikan koneksi internet stabil
- Hapus folder `session` dan jalankan ulang bot

**Bot tidak merespon?**
- Pastikan bot sudah terhubung (lihat pesan "✅ Berhasil terhubung")
- Cek apakah pesan menggunakan perintah yang benar (case-insensitive)

**Session error?**
- Hapus folder `session` dan scan QR code ulang

## License

MIT
