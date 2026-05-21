import { Loader2, GraduationCap } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
          <span className="text-white/80 text-sm font-medium">{message}</span>
        </div>
        <p className="text-white/40 text-xs">Edlink LMS</p>
      </div>
    </div>
  );
}
