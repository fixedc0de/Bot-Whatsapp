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

    const result = await botManager.startSession(userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          qrCode: result.qrCode,
          expiresIn: result.expiresIn,
        },
        message: result.error || 'Session started',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Start bot error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start bot' },
      { status: 500 }
    );
  }
}
