import { NextRequest, NextResponse } from 'next/server';
import { botManager } from '@/lib/bot-manager';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = db.tokens.verify(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, text } = body;

    if (!to || !text) {
      return NextResponse.json(
        { success: false, error: 'Recipient and message are required' },
        { status: 400 }
      );
    }

    const sent = await botManager.sendMessage(userId, to, text);

    if (sent) {
      return NextResponse.json({
        success: true,
        message: 'Message sent',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send message. Bot may not be connected.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
