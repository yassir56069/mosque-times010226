'use client';
import { useState, useEffect } from 'react';
import { Cairo } from 'next/font/google';

// Initialize the font
const cairo = Cairo({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

type PrayerTime = {
  id: string;
  name: string;
  time: string;
  ampm: string;
};

export default function Home() {
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch times on load
  useEffect(() => {
    fetch('/api/times')
      .then((res) => res.json())
      .then((data) => {
        setTimes(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center text-emerald-800 ${cairo.className}`}>
      Loading...
    </div>
  );

  return (
    <main className={`min-h-screen bg-slate-50 relative flex flex-col items-center ${cairo.className}`}>
      
      {/* BACKGROUND TEXTURE (Islamic Geometric Pattern) */}
<div className="absolute inset-0 opacity-[0.065] pointer-events-none z-0 overflow-hidden">
  <svg
    className="w-full h-full animate-breathe"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="seljukInterlace"
        width="96"
        height="56"
        patternUnits="userSpaceOnUse"
      >
        {/* Primary interlace */}
        <path
          d="
            M24 0 L48 14 L72 0
            M0 14 L24 28 L48 14 L72 28 L96 14
            M24 28 L48 42 L72 28
            M0 42 L24 56 L48 42 L72 56 L96 42
          "
          fill="none"
          stroke="#065f46"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary offset interlace (adds depth) */}
        <path
          d="
            M24 1 L48 15 L72 1
            M0 15 L24 29 L48 15 L72 29 L96 15
            M24 29 L48 43 L72 29
            M0 43 L24 57 L48 43 L72 57 L96 43
          "
          fill="none"
          stroke="#065f46"
          strokeWidth="0.6"
          opacity="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#seljukInterlace)" />
  </svg>
</div>





      {/* HEADER */}
      <div className="w-full bg-emerald-800 p-8 rounded-b-[3rem] shadow-xl mb-10 text-center relative z-10 border-b-4 border-emerald-600">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide">
          Masjid Al-Salam
        </h1>
        <p className="text-emerald-100 mt-2 text-xl font-light">Prayer Times</p>
      </div>

      {/* MAIN GRID CONTENT */}
      <div className="w-full max-w-7xl px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-8">
        
        {/* LEFT COLUMN: PRAYER TIMES */}
        <div className="flex flex-col">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-emerald-100 h-full">
            <div className="bg-emerald-700 p-4 text-center">
              <h2 className="text-xl text-white font-semibold">Daily Prayers</h2>
            </div>
            
            {times.map((prayer, index) => (
              <div 
                key={prayer.id}
                className={`flex justify-between items-center px-8 py-5 border-b border-gray-100 last:border-0 
                  ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50'}
                  hover:bg-emerald-50 transition-colors duration-200
                `}
              >
                <span className="text-2xl md:text-3xl font-bold text-emerald-900">
                  {prayer.name}
                </span>
                <div className="flex items-baseline">
                  <span className="text-3xl md:text-4xl font-bold text-slate-800">
                    {prayer.time}
                  </span>
                  <span className="ml-2 text-lg text-emerald-600 font-semibold">
                    {prayer.ampm}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: UPCOMING MAYAATS */}
        <div className="flex flex-col h-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-emerald-100 h-full flex flex-col">
            <div className="bg-slate-700 p-4 text-center">
              <h2 className="text-xl text-white font-semibold">Upcoming Mayaats</h2>
            </div>
            
            {/* Empty State / Placeholder */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 min-h-[300px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <p className="text-lg italic">No upcoming Janazah announcements</p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-auto py-6 text-slate-500 text-sm relative z-10">
        Updated Manually • <a href="/admin" className="hover:text-emerald-700 font-semibold underline decoration-emerald-300">Admin Login</a>
      </footer>
    </main>
  );
}

