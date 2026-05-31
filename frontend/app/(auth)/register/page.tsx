'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';

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

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/auth/register', data);
      setMessage('✅ Registrasi berhasil! Silakan verifikasi.');
      // Auto-verify for demo (in production: show verification form)
      setTimeout(() => {
        api.post('/api/auth/verify', { userId: res.data.userId, code: '123456' })
          .then((verifyRes) => {
            localStorage.setItem('bot_token', verifyRes.data.token);
            router.push('/dashboard');
          });
      }, 1500);
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.error || 'Registrasi gagal'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">🤖 Daftar Bot WhatsApp</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              placeholder="+628123456789"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              {...register('username')}
              type="text"
              placeholder="BotSaya"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email (opsional)</label>
            <input
              {...register('email')}
              type="email"
              placeholder="anda@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <a href="/login" className="text-green-600 hover:underline">Login</a>
        </p>
      </form>
    </div>
  );
}
