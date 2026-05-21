export default function Card({
  children,
  className = '',
  header,
  footer,
  hover = false,
  padding = true,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-100">{header}</div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
