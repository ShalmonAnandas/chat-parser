import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { blobs } = await list({
      prefix: `saved/${session.user.id}/`,
      token: process.env.CHAT_PARSER_READ_WRITE_TOKEN,
    });

    const chats = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url);
          const data = await res.json();
          return {
            id: blob.pathname.split('/').pop()?.replace('.json', '') ?? blob.pathname,
            title: data.title ?? 'Untitled Chat',
            createdAt: data.createdAt,
            totalMessages: data.totalMessages ?? 0,
            model: data.model,
            savedAt: blob.uploadedAt,
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(chats.filter(Boolean));
  } catch (error) {
    console.error('List chats error:', error);
    return NextResponse.json(
      { error: 'Failed to list chats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    await put(
      `saved/${session.user.id}/${id}.json`,
      JSON.stringify(body),
      {
        access: 'public',
        contentType: 'application/json',
        token: process.env.CHAT_PARSER_READ_WRITE_TOKEN,
      }
    );

    return NextResponse.json({ id, message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Save chat error:', error);
    return NextResponse.json(
      { error: 'Failed to save chat' },
      { status: 500 }
    );
  }
}
