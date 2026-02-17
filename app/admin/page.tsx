'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type PrayerTime = {
  id: string;
  name: string;
  time: string; // Will store "13:30"
  ampm: string; // Calculated automatically in background for backward compatibility
};

export default function Admin() {
  const [times, setTimes] = useState<PrayerTime[]>([]);
  
  // Settings
  const [filterType, setFilterType] = useState('current_month');
  const [timeFormat, setTimeFormat] = useState('12h'); 
  
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Helper to convert DB legacy data to strict HH:MM 24h format
  const convertTo24Hour = (timeStr: string, modifier: string) => {
    if (!timeStr) return "00:00";
    
    // If it already looks like 24h (contains :)
    // We just ensure it has leading zeros (e.g. 1:30 -> 01:30)
    if (timeStr.includes(':')) {
       const [h, m] = timeStr.split(':');
       // If modifier exists (old data), we might need to convert
       // But usually if it has a colon in your new system, it's already 24h.
       // Let's rely on the modifier if the hour seems small and modifier is PM
       let hour = parseInt(h, 10);
       // Conversion logic only if we suspect old data format
       if (modifier === 'PM' && hour < 12) hour += 12;
       if (modifier === 'AM' && hour === 12) hour = 0;
       
       // If no modifier, we assume timeStr is already correct 24h, just pad it
       if (!modifier) {
         return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
       }
       return `${hour.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
    }

    return "00:00";
  };

  useEffect(() => {
    const initData = async () => {
        const [tRes, sRes] = await Promise.all([
            fetch('/api/times'),
            fetch('/api/settings')
        ]);
        
        const tData = await tRes.json();
        const sData = await sRes.json();

        // Normalize loaded times to strict "HH:MM" text format
        const normalizedTimes = tData.map((t: PrayerTime) => ({
            ...t,
            time: convertTo24Hour(t.time, t.ampm)
        }));

        setTimes(normalizedTimes);

        if (sData.funeralFilter) setFilterType(sData.funeralFilter);
        if (sData.timeFormat) setTimeFormat(sData.timeFormat);
    };

    initData();
  }, []);

  const handleTimeChange = (index: number, val: string) => {
    // 1. Allow user to type, but restrict length to 5 chars (HH:MM)
    if (val.length > 5) return;

    // 2. Simple character restriction (numbers and colon only)
    if (!/^[0-9:]*$/.test(val)) return;

    const newTimes = [...times];
    newTimes[index].time = val;
    
    // 3. Auto-calculate hidden AM/PM field for DB consistency
    // We try to parse the hour part if it exists
    const [h] = val.split(':');
    if (h && !isNaN(parseInt(h))) {
        const hour = parseInt(h);
        newTimes[index].ampm = (hour >= 12 && hour < 24) ? 'PM' : 'AM';
    }
    
    setTimes(newTimes);
  };

  // When user leaves the input, we format it nicely (e.g. "13:5" -> "13:05")
  const handleBlur = (index: number) => {
    const timeStr = times[index].time;
    if (!timeStr.includes(':')) return; // If invalid, leave it for user to fix
    
    let [h, m] = timeStr.split(':');
    
    // Default to '00' if missing
    if (!h) h = '00';
    if (!m) m = '00';
    
    // Pad with zeros
    const formatted = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    
    // Update state
    const newTimes = [...times];
    newTimes[index].time = formatted;
    setTimes(newTimes);
  };

  const saveData = async () => {
    // Validate before saving
    const isValid = times.every(t => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t.time));
    if (!isValid) {
        alert("Please ensure all times are in valid HH:MM 24-hour format (e.g. 13:30)");
        return;
    }

    setIsSaving(true);
    
    await fetch('/api/times', {
      method: 'POST',
      body: JSON.stringify(times),
    });

    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ 
          funeralFilter: filterType,
          timeFormat: timeFormat 
      }),
    });

    setIsSaving(false);
    alert('System Updated Successfully');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-800">Admin Panel</h2>
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 hover:text-emerald-600">
            ← Back to Display
          </button>
        </div>

        {/* --- SETTINGS SECTION --- */}
        <div className="mb-8 space-y-4">
            
            {/* Funeral Settings */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2">Upcoming Mayaats Display</h3>
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border border-gray-300 text-gray-700 rounded focus:outline-none focus:border-emerald-500"
                >
                    <option value="current_month">Show All in Current Month (Archive & Upcoming)</option>
                    <option value="next_30_days">Show Next 30 Days (Upcoming Only)</option>
                </select>
            </div>

            {/* Time Format Settings */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Main Screen Time Display</h3>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                        <input 
                            type="radio" 
                            name="timeFormat" 
                            value="12h" 
                            checked={timeFormat === '12h'}
                            onChange={(e) => setTimeFormat(e.target.value)}
                            className="accent-blue-600 w-5 h-5"
                        />
                        12 Hour (1:30 PM)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                        <input 
                            type="radio" 
                            name="timeFormat" 
                            value="24h" 
                            checked={timeFormat === '24h'}
                            onChange={(e) => setTimeFormat(e.target.value)}
                            className="accent-blue-600 w-5 h-5"
                        />
                        24 Hour (13:30)
                    </label>
                </div>
            </div>

        </div>

        <hr className="my-6" />

        <h3 className="font-bold text-gray-800 mb-4">Prayer Times (24h Format)</h3>
        <p className="text-sm text-gray-500 mb-4">Enter times as HH:MM (e.g. 13:45 or 05:20)</p>
        
        <div className="space-y-4">
          {times.map((prayer, index) => (
            <div key={prayer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="font-bold text-gray-700 w-1/3 text-lg">{prayer.name}</label>
              
              <input
                  type="text" 
                  inputMode="numeric"
                  placeholder="HH:MM"
                  value={prayer.time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  onBlur={() => handleBlur(index)}
                  className="border border-gray-300 text-gray-900 text-xl font-mono text-center rounded px-4 py-2 w-32 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
            </div>
          ))}
        </div>

        <button
          onClick={saveData}
          disabled={isSaving}
          className="w-full mt-8 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg"
        >
          {isSaving ? 'Saving...' : 'Save All Updates'}
        </button>
      </div>
    </div>
  );
}