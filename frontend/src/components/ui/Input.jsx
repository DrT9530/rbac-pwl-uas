export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            className={`input-field resize-none ${Icon ? 'pl-10' : ''} ${
              error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''
            }`}
            rows={4}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            className={`input-field ${Icon ? 'pl-10' : ''} ${
              error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''
            }`}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={`input-field ${Icon ? 'pl-10' : ''} ${
              error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''
            }`}
            {...props}
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
