import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-accent-500 hover:bg-accent-600 text-white shadow-sm shadow-accent-500/25 active:scale-[0.98]',
  secondary:
    'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm active:scale-[0.98]',
  danger:
    'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/25 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-600 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 
        ${variants[variant]} ${sizes[size]} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}
