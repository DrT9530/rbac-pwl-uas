import { ROLE_COLORS } from '../../utils/constants';
import { getRoleDisplayName } from '../../utils/permissions';

export default function Badge({ role, size = 'sm', className = '' }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.user;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border
        ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {getRoleDisplayName(role)}
    </span>
  );
}
