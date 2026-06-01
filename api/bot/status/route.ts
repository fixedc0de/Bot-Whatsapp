import { NextRequest, NextResponse } from 'next/server';
import { botManager } from '@/lib/bot-manager';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const session = botManager.getSession(userId);

    return NextResponse.json({
      success: true,
      data: session || {
        userId,
        isConnected: false,
        status: 'disconnected',
      },
    });
  } catch (error: any) {
    console.error('Get status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}
