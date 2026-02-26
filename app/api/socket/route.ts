// Socket.io is initialized via the custom server (server.ts).
// This route exists so Next.js doesn't return 404 for the socket path.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'Socket.io server running via custom server' });
}
