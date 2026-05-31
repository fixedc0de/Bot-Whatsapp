'use client';

import { useEffect, useState } from 'react';
import { useBotStore } from '@/store/useBotStore';
import { ws } from '@/lib/websocket';
import QRCode from 'react-qr-code';

export default function DashboardPage() {
  const { 
    isConnected, botNumber, qrCode, qrExpiry, messages, status,
    startSession, stopSession, sendMessage, fetchMessages 
  } = useBotStore();

  const [messageText, setMessageText] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    // Connect WebSocket
    const token = localStorage.getItem('bot_token');
    if (token) {
      ws.connect(token, (success) => {
        if (success) {
          fetchMessages();
          // Auto-start session if not connected
          if (!isConnected && status === 'disconnected') {
            startSession();
          }
        }
      });
    }

    return () => {
      ws.disconnect();
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !messageText) return;
    
    try {
      await sendMessage(recipient, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🤖 Bot Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isConnected ? `● Connected: ${botNumber}` : '○ Disconnected'}
            </span>
            <button
              onClick={isConnected ? stopSession : startSession}
              className={`px-4 py-2 rounded-lg font-medium ${
                isConnected 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isConnected ? 'Stop Bot' : 'Start Bot'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold mb-4">📱 QR Code</h2>
              {qrCode && !isConnected ? (
                <div className="text-center">
                  <div className="bg-white p-4 inline-block rounded-lg mb-4">
                    <QRCode value={qrCode} size={180} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan dengan WhatsApp → Linked Devices
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Expired in: {qrExpiry}s
                  </p>
                </div>
              ) : isConnected ? (
                <div className="text-center py-8 text-green-600">
                  ✅ Bot sudah terhubung!
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Klik "Start Bot" untuk generate QR
                </div>
              )}
            </div>
          </div>

          {/* Send Message Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="font-semibold mb-4">✉️ Kirim Pesan</h2>
              <form onSubmit={handleSend} className="space-y-4">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Nomor tujuan (628xxx)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Tulis pesan..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !recipient || !messageText}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>

            {/* Message History */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold mb-4">📜 Riwayat Pesan</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.isIncoming ? 'bg-gray-100 ml-8' : 'bg-blue-100 mr-8'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada pesan
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
