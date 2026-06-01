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

    await botManager.stopSession(userId);

    return NextResponse.json({
      success: true,
      message: 'Bot stopped',
    });
  } catch (error: any) {
    console.error('Stop bot error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to stop bot' },
      { status: 500 }
    );
  }
}
