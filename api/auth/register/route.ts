import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, generateToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, username, email } = body;

    if (!phoneNumber || !username) {
      return NextResponse.json(
        { success: false, error: 'Phone number and username are required' },
        { status: 400 }
      );
    }

    const existingUser = db.users.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    const user = db.users.create({
      id: generateId(),
      phoneNumber,
      username,
      email: email || undefined,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(user.id);

    db.sessions.create({
      userId: user.id,
      isConnected: false,
      status: 'disconnected',
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        username: user.username,
        token,
      },
      message: 'Registration successful',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
