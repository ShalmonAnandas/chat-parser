import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { blobs } = await list({
      prefix: `shared/${id}.json`,
      limit: 1,
      token: process.env.CHAT_PARSER_READ_WRITE_TOKEN,
    });

    if (blobs.length === 0) {
      return NextResponse.json(
        { error: 'Shared chat not found' },
        { status: 404 }
      );
    }

    const response = await fetch(blobs[0].url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch shared chat error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared chat' },
      { status: 500 }
    );
  }
}
