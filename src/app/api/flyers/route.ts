// src/app/api/flyers/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: Request) {
  const { data, error } = await supabase
    .from('flyers')
    .select('*')
    .order('created_at', { ascending: false });

  // Prepare the response body
  const body = error ? { error: error.message } : data;

  return new NextResponse(
    JSON.stringify(body),
    {
      status: error ? 500 : 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // or restrict to your domain
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle preflight (CORS) requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // or restrict to your domain
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
