'use client';
import { useState, useEffect } from 'react';
import { Cairo } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image'; // Added for the logo

const cairo = Cairo({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

type PrayerTime = {
  id: string;
  name: string;
  time: string;
  ampm: string;
};

type NextPrayerStatus = {
  name: string;
  timeLeft: string;
  isTomorrow: boolean;
} | null;

type Funeral = {
  id: string;
  fullNameOfDeceased: string;
  genderOfDeceased: string;
  funeralAddress: string;
  dateOfFuneral: string; 
  janazaPrayerLocation: string;
  contactNumberOfResponsibleParty: string;
  ageOfDeceased: string;
};

export default function Home() {
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [allFunerals, setAllFunerals] = useState<Funeral[]>([]);
  const [displayFunerals, setDisplayFunerals] = useState<Funeral[]>([]);
  const [nextFuneralIdx, setNextFuneralIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerStatus>(null);
  const [visiblePrayers, setVisiblePrayers] = useState<PrayerTime[]>([]);
  
  const [funeralIndex, setFuneralIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, fRes] = await Promise.all([fetch('/api/times'), fetch('/api/funerals')]);
        const tData = await tRes.json();
        const fData = await fRes.json();
        
        setTimes(tData);
        setAllFunerals(fData);
        setDisplayFunerals(fData.slice(0, 4));
        setNextFuneralIdx(fData.length > 4 ? 4 : 0);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allFunerals.length <= 4) return;

    const interval = setInterval(() => {
      setDisplayFunerals((prev) => {
        const nextItem = allFunerals[nextFuneralIdx];
        const newList = [nextItem, ...prev.slice(0, 3)];
        return newList;
      });

      setNextFuneralIdx((prev) => (prev + 1) % allFunerals.length);
    }, 30000); 

    return () => clearInterval(interval);
  }, [allFunerals, nextFuneralIdx]);

  const getPrayersForDate = (allPrayers: PrayerTime[], date: Date) => {
    const isFriday = date.getDay() === 5;
    return allPrayers.filter(p => {
      const name = p.name.toLowerCase();
      if (isFriday) {
        if (name.includes('dhuhr') || name.includes('zuhr')) return false;
        return true;
      } else {
        if (name.includes('jum')) return false;
        return true;
      }
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (times.length > 0) setVisiblePrayers(getPrayersForDate(times, new Date()));
  }, [times]);

  useEffect(() => {
    if (times.length === 0) return;
    const calculateNextPrayer = () => {
      const now = new Date();
      let targetPrayer: PrayerTime | null = null;
      let targetDate: Date | null = null;
      let isTomorrow = false;

      const getPrayerDateObj = (timeStr: string, ampm: string, dateBase: Date) => {
        const [h, m] = timeStr.split(':');
        let hours = parseInt(h);
        const minutes = parseInt(m);
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const d = new Date(dateBase);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const todayPrayers = getPrayersForDate(times, now);
      for (const prayer of todayPrayers) {
        const pDate = getPrayerDateObj(prayer.time, prayer.ampm, now);
        if (pDate > now) {
          targetPrayer = prayer;
          targetDate = pDate;
          break; 
        }
      }

      if (!targetPrayer) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPrayers = getPrayersForDate(times, tomorrow);
        if (tomorrowPrayers.length > 0) {
          targetPrayer = tomorrowPrayers[0];
          targetDate = getPrayerDateObj(targetPrayer.time, targetPrayer.ampm, tomorrow);
          isTomorrow = true;
        }
      }

      if (targetPrayer && targetDate) {
        const diffMs = targetDate.getTime() - now.getTime();
        const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        let timeString = `${diffMins}m ${pad(diffSecs)}s`;
        if (diffHrs > 0) timeString = `${diffHrs}h ${timeString}`;
        setNextPrayer({ name: targetPrayer.name, timeLeft: timeString, isTomorrow });
      }
    };
    calculateNextPrayer();
    const timer = setInterval(calculateNextPrayer, 1000);
    return () => clearInterval(timer);
  }, [times]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-800">Loading...</div>;

  return (
    <main className={`min-h-screen bg-slate-50 relative flex flex-col items-center ${cairo.className} overflow-hidden`}>
      
      {/* BACKGROUND TEXTURE */}
      <div className="absolute inset-0 opacity-[0.065] pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="seljukInterlace" width="96" height="56" patternUnits="userSpaceOnUse">
              <path d="M24 0 L48 14 L72 0 M0 14 L24 28 L48 14 L72 28 L96 14" fill="none" stroke="#065f46" strokeWidth="1.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#seljukInterlace)" />
        </svg>
      </div>

      {/* HEADER WITH LOGO AND SLOGAN */}
      <div className="w-full bg-emerald-800 p-6 md:p-8 rounded-b-[4rem] shadow-2xl mb-8 text-center relative z-10 border-b-8 border-emerald-900/20">
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          {/* LOGO: Added brightness-0 invert to make the black logo white for visibility on dark green */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4">
             <Image 
                src="/logo.png" 
                alt="Islamic Help Logo" 
                fill 
                className="object-contain brightness-0 invert opacity-95"
                priority
             />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
            MASJID AL-IHSAAN
          </h1>

          {/* SLOGAN */}
          <p className="text-emerald-300 mt-2 text-lg md:text-2xl font-medium italic tracking-wide">
            &quot;Islamic Help Reaching People In Need&quot;
          </p>
          
          <div className="w-32 h-1 bg-white/20 my-4 rounded-full" />
          
          <p className="text-emerald-100/60 text-xl font-light tracking-[0.2em] uppercase">
            Daily Prayer Schedule
          </p>
        </div>
      </div>

      {/* NEXT PRAYER WIDGET */}
      {nextPrayer && (
        <div className="w-full max-w-[95%] mb-8 relative z-10">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-900 rounded-3xl shadow-2xl border-2 border-white/20 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden">
            <div className="p-6 md:p-8">
              <p className="text-emerald-200 text-xl font-medium mb-1 uppercase">Next Prayer {nextPrayer.isTomorrow && '(Tomorrow)'}</p>
              <h3 className="text-6xl md:text-8xl font-black">{nextPrayer.name}</h3>
            </div>
            <div className="bg-black/30 p-8 md:px-16 text-center h-full flex flex-col justify-center min-w-[300px]">
              <span className="text-xl text-emerald-200 block mb-2 uppercase font-bold">Starts in</span>
              <span className="text-5xl md:text-7xl font-mono font-bold tracking-tighter text-yellow-400">
                {nextPrayer.timeLeft}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="w-full max-w-[95%] grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10 mb-10 h-full">
        
        {/* LEFT COLUMN: PRAYER TIMES */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-100 flex flex-col">
          <div className="bg-emerald-800 py-6 text-center border-b-4 border-emerald-700">
            <h2 className="text-3xl text-white font-bold uppercase tracking-widest">
              {new Date().getDay() === 5 ? 'Jummah Schedule' : 'Salah Times'}
            </h2>
          </div>
          
          <div className="flex flex-col flex-1 justify-around py-4">
            {visiblePrayers.map((prayer) => {
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <div key={prayer.id} className={`flex justify-between items-center px-12 py-6 border-b border-slate-100 last:border-0 ${isNext ? 'bg-emerald-50' : ''}`}>
                  <span className={`text-4xl md:text-5xl font-extrabold ${isNext ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {prayer.name}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-5xl md:text-6xl font-black ${isNext ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {prayer.time}
                    </span>
                    <span className="text-2xl text-emerald-600 font-bold uppercase">{prayer.ampm}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: FUNERALS */}
        <div className="flex flex-col h-full">
          <div className="bg-slate-800 py-6 text-center rounded-t-[2.5rem] shadow-lg z-20">
            <h2 className="text-3xl text-white font-bold uppercase tracking-widest">Janazah Announcements</h2>
          </div>
          
          <div className="bg-slate-100/50 flex-1 p-6 relative overflow-hidden rounded-b-[2.5rem] border-x border-b border-slate-200">
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {displayFunerals.map((mayyat) => (
                  <motion.div
                    key={mayyat.id}
                    layout
                    initial={{ opacity: 0, y: -100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
                    className="bg-white rounded-3xl p-8 shadow-xl border-l-[16px] border-emerald-600 flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1 leading-tight">
                          {mayyat.fullNameOfDeceased}
                        </h3>
                        <p className="text-2xl font-bold text-emerald-700">
                          {mayyat.genderOfDeceased} • Age: {mayyat.ageOfDeceased}
                        </p>
                      </div>
                      
                      <div className="text-right bg-slate-900 text-white px-6 py-4 rounded-2xl">
                        <div className="text-sm uppercase font-bold text-emerald-400 mb-1">Janazah Time</div>
                        <div className="text-4xl font-black leading-none">
                          {new Date(mayyat.dateOfFuneral).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                        <div className="text-lg font-bold text-slate-400 mt-1">
                          {new Date(mayyat.dateOfFuneral).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📍</span>
                        <div>
                          <span className="block text-[10px] uppercase font-black text-slate-400">Address</span>
                          <span className="text-xl font-bold text-slate-700 block max-w-[250px]">{mayyat.funeralAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🕌</span>
                        <div>
                          <span className="block text-[10px] uppercase font-black text-slate-400">Masjid</span>
                          <span className="text-xl font-bold text-slate-700  block max-w-[250px]">{mayyat.janazaPrayerLocation}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-8 text-center relative z-10 w-full bg-slate-100/50 border-t border-slate-200">
        <p className="text-emerald-800 font-bold text-lg mb-2">Islamic Help Reaching People In Need</p>
        <p className="text-slate-500 text-sm">
          Made by Yassir Hossan Buksh • Contact 5761 8764 | <a href="/admin" className="hover:text-emerald-700 font-semibold underline decoration-emerald-300">Admin Login</a>
        </p>
      </footer>
    </main>
  );
}