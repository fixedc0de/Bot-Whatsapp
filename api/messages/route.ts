import { NextRequest, NextResponse } from 'next/server';
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

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const messages = db.messages.findByUserId(userId, limit);

    return NextResponse.json({
      success: true,
      data: { messages },
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get messages' },
      { status: 500 }
    );
  }
}
