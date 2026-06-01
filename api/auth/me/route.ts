import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const userId = db.tokens.verify(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = db.users.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
