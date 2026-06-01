'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useBotStore } from '@/store/useBotStore';

const registerSchema = z.object({
  phoneNumber: z.string().min(10, 'Minimal 10 digit'),
  username: z.string().min(3, 'Minimal 3 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { setToken } = useBotStore();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      
      setToken(result.data.token, result.data.userId);
      
      setMessage('✅ Registrasi berhasil! Mengalihkan ke dashboard...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'Registrasi gagal'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">🤖 WhatsApp Bot</h1>
        <p className="text-center text-gray-500 mb-6">Daftar untuk memulai</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nomor WhatsApp</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              placeholder="+628123456789"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
            <input
              {...register('username')}
              type="text"
              placeholder="BotSaya"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email (opsional)</label>
            <input
              {...register('email')}
              type="email"
              placeholder="anda@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-green-500/30"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
