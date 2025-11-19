import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

// GET /api/health - Diagnostic endpoint to test database
export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      },
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
