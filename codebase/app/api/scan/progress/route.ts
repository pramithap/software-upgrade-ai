import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repositories = searchParams.get('repositories');

  if (!repositories) {
    return new Response('No repositories specified', { status: 400 });
  }

  // Set headers for Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Initial status
      controller.enqueue(encoder.encode('data: {"type":"progress","progress":0}\n\n'));

      // Simulate progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          controller.enqueue(
            encoder.encode(`data: {"type":"progress","progress":${progress}}\n\n`)
          );
        } else {
          controller.enqueue(
            encoder.encode('data: {"type":"complete"}\n\n')
          );
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
