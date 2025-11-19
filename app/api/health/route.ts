import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// GET /api/health - Diagnostic endpoint to test database
export async function GET() {
  try {
    const db = await getDatabase();
    
    // Try a simple query
    const stmt = db.prepare('SELECT 1 as test');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      test: result,
      environment: {
        isServerless: !!(process.env.NETLIFY || process.env.VERCEL),
        nodeEnv: process.env.NODE_ENV,
        netlify: !!process.env.NETLIFY,
        vercel: !!process.env.VERCEL,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database: 'failed',
      error: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }, { status: 500 });
  }
}

