// app/lib/store.ts

// DEFAULT PRAYER TIMES
const defaultTimes = [
  { id: 'fajr', name: 'Fajr', time: '05:30', ampm: 'AM' },
  { id: 'dhuhr', name: 'Dhuhr', time: '01:15', ampm: 'PM' },
  { id: 'asr', name: 'Asr', time: '04:45', ampm: 'PM' },
  { id: 'maghrib', name: 'Maghrib', time: '07:10', ampm: 'PM' },
  { id: 'isha', name: 'Isha', time: '08:45', ampm: 'PM' },
  { id: 'jummah', name: 'Jummah', time: '01:30', ampm: 'PM' },
];

// In a real app, you would replace this variable with a Database call.
// Note: In Vercel serverless, this variable resets when the server sleeps.
let currentTimes = [...defaultTimes];

export const getTimes = async () => {
  return currentTimes;
};

export const updateTimes = async (newTimes: typeof defaultTimes) => {
  currentTimes = newTimes;
  return currentTimes;
};