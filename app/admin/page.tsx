// app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type PrayerTime = {
  id: string;
  name: string;
  time: string;
  ampm: string;
};

export default function Admin() {
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/times')
      .then((res) => res.json())
      .then((data) => setTimes(data));
  }, []);

  const handleTimeChange = (index: number, val: string) => {
    const newTimes = [...times];
    newTimes[index].time = val;
    setTimes(newTimes);
  };
  
  const handleAmPmChange = (index: number, val: string) => {
    const newTimes = [...times];
    newTimes[index].ampm = val;
    setTimes(newTimes);
  };

  const saveTimes = async () => {
    setIsSaving(true);
    await fetch('/api/times', {
      method: 'POST',
      body: JSON.stringify(times),
    });
    setIsSaving(false);
    alert('Times Updated Successfully');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-800">Update Times</h2>
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-emerald-600"
          >
            ← Back to Display
          </button>
        </div>

        <div className="space-y-4">
          {times.map((prayer, index) => (
            <div key={prayer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <label className="font-semibold text-gray-700 w-24">{prayer.name}</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prayer.time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-24 text-center focus:outline-none focus:border-emerald-500"
                  placeholder="00:00"
                />
                <select
                  value={prayer.ampm}
                  onChange={(e) => handleAmPmChange(index, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-2 bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveTimes}
          disabled={isSaving}
          className="w-full mt-8 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Updates'}
        </button>
      </div>
    </div>
  );
}