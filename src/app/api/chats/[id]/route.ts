import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { blobs } = await list({
      prefix: `saved/${session.user.id}/${id}.json`,
      limit: 1,
      token: process.env.CHAT_PARSER_READ_WRITE_TOKEN,
    });

    if (blobs.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const response = await fetch(blobs[0].url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch saved chat error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}
