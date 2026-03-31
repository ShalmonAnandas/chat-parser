import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const blob = await put(`shared/${id}.json`, JSON.stringify(body), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.CHAT_PARSER_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ id, url: blob.url });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json(
      { error: 'Failed to share chat' },
      { status: 500 }
    );
  }
}
