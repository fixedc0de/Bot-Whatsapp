'use client';

import { useEffect, useState } from 'react';
import { useBotStore } from '@/store/useBotStore';

export default function DashboardPage() {
  const { 
    isConnected, botNumber, qrCode, qrExpiry, messages, status,
    startSession, stopSession, sendMessage, fetchMessages, checkStatus
  } = useBotStore();

  const [messageText, setMessageText] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bot_token');
    if (token) {
      checkStatus();
      fetchMessages();
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !messageText) return;
    
    setSending(true);
    try {
      await sendMessage(recipient, messageText);
      setMessageText('');
      setRecipient('');
      fetchMessages();
    } catch (error) {
      console.error('Send failed:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStartStop = async () => {
    if (isConnected) {
      await stopSession();
    } else {
      await startSession();
    }
    setTimeout(() => checkStatus(), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🤖 WhatsApp Bot</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isConnected ? `● ${botNumber}` : '○ Disconnected'}
            </span>
            <button
              onClick={handleStartStop}
              disabled={status === 'connecting'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isConnected 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50`}
            >
              {status === 'connecting' ? 'Connecting...' : isConnected ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* QR Code Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📱</span> Scan QR Code
            </h2>
            {qrCode && !isConnected ? (
              <div className="text-center">
                <div className="bg-white p-4 inline-block rounded-xl border mb-4">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Scan dengan WhatsApp</p>
                <p className="text-xs text-gray-400">Settings → Linked Devices → Link Device</p>
                {qrExpiry > 0 && (
                  <p className="text-xs text-orange-500 mt-2">Expired in: {qrExpiry}s</p>
                )}
              </div>
            ) : isConnected ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-green-600 font-medium">Bot terhubung!</p>
                <p className="text-sm text-gray-500 mt-1">{botNumber}</p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-4">📱</div>
                <p>Klik "Start" untuk generate QR</p>
              </div>
            )}
          </div>

          {/* Send Message Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>✉️</span> Kirim Pesan
              </h2>
              <form onSubmit={handleSend} className="space-y-4">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Nomor tujuan (628xxx)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Tulis pesan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !recipient || !messageText || sending}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sending ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Message History */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📜</span> Riwayat Pesan
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl ${
                  msg.isIncoming 
                    ? 'bg-gray-50 ml-8 border border-gray-100' 
                    : 'bg-blue-50 mr-8 border border-blue-100'
                }`}
              >
                <p className="text-sm text-gray-800">{msg.text}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(msg.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-4">💬</div>
                <p>Belum ada pesan</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
