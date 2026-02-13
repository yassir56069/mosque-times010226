// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/app/lib/store';

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const updated = await updateSettings(body);
  return NextResponse.json(updated);
}