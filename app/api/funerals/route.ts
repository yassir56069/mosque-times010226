// app/api/funerals/route.ts
import { NextResponse } from 'next/server';
import { getSettings } from '@/app/lib/store';

export async function GET() {
  try {
    // 1. Get Admin Settings
    const settings = await getSettings();

    // 2. Fetch from External API
    const res = await fetch('https://alihsaan.com/api/v2/funerals', {
      headers: {
        'X-Api-Key': 'ace36c585c07f5cc71d926b83d5fe4f200cda141f0918f5ffb4ed2570a10c91c',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!res.ok) throw new Error('Failed to fetch from provider');

    const result = await res.json();
    
    if (!result.success || !Array.isArray(result.data)) {
        return NextResponse.json([]);
    }

    const allFunerals = result.data;
    const now = new Date();

    // 3. Filter Logic
    const filtered = allFunerals.filter((item: { dateOfFuneral: string | number | Date; }) => {
      const funeralDate = new Date(item.dateOfFuneral);

      // Filter: Current Month (Shows all records in this calendar month)
      if (settings.funeralFilter === 'current_month') {
        return (
          funeralDate.getMonth() === now.getMonth() &&
          funeralDate.getFullYear() === now.getFullYear()
        );
      }

      // Filter: Next 30 Days (Shows only future/today items up to 30 days)
      if (settings.funeralFilter === 'next_30_days') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        // Reset time to ensure we catch today's funerals
        now.setHours(0,0,0,0); 
        return funeralDate >= now && funeralDate <= thirtyDaysFromNow;
      }

      return true;
    });

    // 4. Sort by date (nearest first)
    filtered.sort((a: { dateOfFuneral: string | number | Date; }, b: { dateOfFuneral: string | number | Date; }) => new Date(a.dateOfFuneral).getTime() - new Date(b.dateOfFuneral).getTime());

    return NextResponse.json(filtered);

  } catch (error) {
    console.error('Funeral API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch funerals' }, { status: 500 });
  }
}