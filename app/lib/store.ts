// app/lib/store.ts

export type PrayerTime = {
  id: string;
  name: string;
  time: string;
  ampm: string;
};

// 1. Define the data
const defaultTimes: PrayerTime[] = [
  { id: 'fajr', name: 'Fajr', time: '05:30', ampm: 'AM' },
  { id: 'dhuhr', name: 'Dhuhr', time: '01:15', ampm: 'PM' },
  { id: 'asr', name: 'Asr', time: '04:45', ampm: 'PM' },
  { id: 'maghrib', name: 'Maghrib', time: '07:10', ampm: 'PM' },
  { id: 'isha', name: 'Isha', time: '08:45', ampm: 'PM' },
  { id: 'jummah', name: 'Jummah', time: '01:30', ampm: 'PM' },
];

export type AppSettings = {
  funeralFilter: 'current_month' | 'next_30_days';
};

// 2. Initialize variables
let currentTimes: PrayerTime[] = [...defaultTimes];
let settings: AppSettings = {
  funeralFilter: 'current_month',
};

// 3. Export Functions

export const getTimes = async () => {
  return currentTimes;
};

export const updateTimes = async (newTimes: PrayerTime[]) => {
  currentTimes = newTimes;
  return currentTimes;
};

export const getSettings = async (): Promise<AppSettings> => {
  return settings;
};

export const updateSettings = async (newSettings: AppSettings): Promise<AppSettings> => {
  settings = newSettings;
  return settings;
};