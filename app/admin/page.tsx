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
  // New State for Settings
  const [filterType, setFilterType] = useState('current_month');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch Times
    fetch('/api/times')
      .then((res) => res.json())
      .then((data) => setTimes(data));

    // Fetch Settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.funeralFilter) setFilterType(data.funeralFilter);
      });
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

  const saveData = async () => {
    setIsSaving(true);
    
    // Save Times
    await fetch('/api/times', {
      method: 'POST',
      body: JSON.stringify(times),
    });

    // Save Settings
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ funeralFilter: filterType }),
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

        {/* --- FUNERAL SETTINGS SECTION --- */}
        <div className="mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <h3 className="font-bold text-emerald-900 mb-2">Upcoming Mayaats Display</h3>
          <p className="text-sm text-emerald-700 mb-3">Choose which records to display on the main screen.</p>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 border border-gray-300 text-gray-500 rounded focus:outline-none focus:border-emerald-500"
          >
            <option value="current_month">Show All in Current Month (Archive & Upcoming)</option>
            <option value="next_30_days">Show Next 30 Days (Upcoming Only)</option>
          </select>
        </div>

        <hr className="my-6" />

        <h3 className="font-bold text-gray-800 mb-4">Prayer Times</h3>
        <div className="space-y-4">
          {times.map((prayer, index) => (
            <div key={prayer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <label className="font-semibold text-gray-700 w-24">{prayer.name}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prayer.time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="border border-gray-300 text-gray-700 rounded px-3 py-2 w-24 text-center focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={prayer.ampm}
                  onChange={(e) => handleAmPmChange(index, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-2 bg-white text-gray-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveData}
          disabled={isSaving}
          className="w-full mt-8 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save All Updates'}
        </button>
      </div>
    </div>
  );
}