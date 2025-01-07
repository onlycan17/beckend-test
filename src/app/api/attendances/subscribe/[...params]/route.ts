import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ff350a6295bd.ngrok.app';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { params: string[] } }
) {
  const [academicYear, teacherId, subjectCode, episodeNumber, classCode] = params.params;
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/attendances/subscribe/${academicYear}/${teacherId}/${subjectCode}/${episodeNumber}/${classCode}`,
      {
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SSE connection failed: ${response.status}`);
    }

    // Transform the response into a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(new TextEncoder().encode(`${line}\n`));
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });

    // Return the transformed stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('SSE Setup Error:', error);
    return NextResponse.json(
      { error: '서버 연결 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 