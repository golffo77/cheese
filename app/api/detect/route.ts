import { NextRequest, NextResponse } from 'next/server';

const YOLO_SERVICE_URL = process.env.YOLO_SERVICE_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.frame) {
    return NextResponse.json({ error: 'frame (base64) required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${YOLO_SERVICE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: body.frame }),
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `YOLO service error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // Service not running – return empty detections so UI stays functional
    if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('ECONNREFUSED'))) {
      return NextResponse.json({
        detections: [],
        processing_time_ms: 0,
        service_unavailable: true,
      });
    }
    return NextResponse.json({ error: 'Detection service unavailable' }, { status: 503 });
  }
}
