# WhatsApp Bot - Single Deployment on Vercel

A simple and elegant WhatsApp bot management dashboard that runs entirely on Vercel with no separate backend server required.

## Features

- ✅ **Single Hosting** - Deploy everything on Vercel (frontend + API routes)
- ✅ **Simple & Elegant Design** - Clean UI with Tailwind CSS
- ✅ **Lightweight Bot** - Optimized Baileys implementation for serverless
- ✅ **In-Memory Database** - Fast storage (replace with DB for production)
- ✅ **QR Code Login** - Scan to connect your WhatsApp
- ✅ **Message History** - View sent and received messages
- ✅ **Auto-Reply Commands** - Built-in command handler

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand
- **Backend**: Next.js API Routes
- **WhatsApp**: Baileys Library
- **Deployment**: Vercel

## Project Structure

```
/workspace
├── app/                    # Next.js App Router
│   ├── (auth)/register/    # Registration page
│   ├── dashboard/          # Main dashboard
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (redirects to register)
├── api/                    # API Routes (Backend)
│   ├── auth/               # Authentication endpoints
│   ├── bot/                # Bot control endpoints
│   └── messages/           # Message history endpoint
├── lib/                    # Core Logic
│   ├── db.ts               # In-memory database
│   └── bot-manager.ts      # WhatsApp bot logic
├── store/                  # State Management
│   └── useBotStore.ts      # Zustand store
├── types/                  # TypeScript Types
│   └── index.ts            # Type definitions
├── package.json            # Dependencies
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment settings
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel at [vercel.com](https://vercel.com).

## Usage

1. **Register**: Enter your phone number and username
2. **Start Bot**: Click "Start" to generate QR code
3. **Scan QR**: Open WhatsApp → Settings → Linked Devices → Link Device
4. **Send Messages**: Use the dashboard to send WhatsApp messages
5. **View History**: See all sent and received messages

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/me` | POST | Get current user |
| `/api/bot/start` | POST | Start bot session |
| `/api/bot/stop` | POST | Stop bot session |
| `/api/bot/status` | GET | Get bot status |
| `/api/bot/send` | POST | Send message |
| `/api/messages` | GET | Get message history |

## Important Notes

### ⚠️ Serverless Limitations

- **In-Memory Storage**: Data resets on cold start. For production, replace `lib/db.ts` with a real database (PostgreSQL, MongoDB, etc.)
- **Connection Persistence**: WhatsApp connections may disconnect on cold starts. The bot will auto-reconnect when triggered.
- **Timeout Limits**: Vercel free tier has 10s timeout for API routes. Pro tier allows up to 60s.

### 🔄 Production Recommendations

1. **Database**: Replace in-memory storage with Vercel Postgres, MongoDB Atlas, or Supabase
2. **Session Storage**: Store Baileys auth state in cloud storage (S3, Redis)
3. **Environment Variables**: Add sensitive data to `.env.local` and Vercel environment variables
4. **Authentication**: Implement proper JWT authentication instead of simple tokens

## Environment Variables (Optional)

Create `.env.local`:

```env
# Optional: Add any API keys or secrets here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Next.js and Baileys
