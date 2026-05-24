import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-white/5 rounded-2xl rotate-12" />
        <div className="absolute bottom-1/4 left-10 w-24 h-24 bg-white/5 rounded-2xl -rotate-12" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-8 shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Edlink LMS
          </h1>
          <p className="text-lg text-white/60 text-center max-w-md leading-relaxed">
            Platform pembelajaran digital modern dengan sistem manajemen peran
            yang terintegrasi
          </p>
          <div className="mt-12 flex items-center gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full" />
              <span>Role-Based Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full" />
              <span>Modern</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
