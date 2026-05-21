const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback based on current browser URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  // If we are accessing via local network IP (e.g. 192.168.x.x)
  if (/^[0-9.]+$/.test(hostname)) {
    return `http://${hostname}:3000/api`;
  }
  // Default fallback for deployment
  return 'http://localhost:3000/api';
};

export const API_URL = getApiUrl();

export const GLOBAL_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'campus_admin', label: 'Campus Admin' },
  { value: 'it_support', label: 'IT Support' },
  { value: 'user', label: 'User' },
];

export const COURSE_ROLES = [
  { value: 'dosen', label: 'Dosen' },
  { value: 'asdos', label: 'Asisten Dosen' },
  { value: 'mahasiswa', label: 'Mahasiswa' },
];

export const ROLE_COLORS = {
  super_admin: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  campus_admin: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  it_support: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200',
  },
  dosen: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  mahasiswa: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    border: 'border-sky-200',
  },
  asdos: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  user: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
    border: 'border-gray-200',
  },
};
