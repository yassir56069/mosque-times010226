// app/api/times/route.ts
import { NextResponse } from 'next/server';
import { getTimes, updateTimes } from '@/app/lib/store';

export async function GET() {
  const times = await getTimes();
  return NextResponse.json(times);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateTimes(body);
    return NextResponse.json(updated);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: 'Invalid Data' }, { status: 400 });
  }
}