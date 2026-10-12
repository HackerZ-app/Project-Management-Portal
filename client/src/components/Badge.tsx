import React from 'react';

/**
 * Enterprise Design System Badge Component
 * Aligned with Palantir, GitHub Primer, and Google Cloud Console design principles.
 * 
 * Rules:
 * 1. Borderless fills with high WCAG AA contrast.
 * 2. Strict pill shapes (`rounded-full`) for dynamic system states.
 * 3. Subtle rounded corners (`rounded-md`) for static categories/tech stack tags.
 * 4. Compact, tight padding (`px-2 py-0.5` or `px-2.5 py-0.5`) to keep text scannable.
 */

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  status?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export function getStatusVariant(statusText?: string): StatusVariant {
  if (!statusText) return 'neutral';
  const s = statusText.toLowerCase().trim();

  if (
    s.includes('approve') ||
    s.includes('complete') ||
    s.includes('publish') ||
    s.includes('accept') ||
    s.includes('clean') ||
    s.includes('pass') ||
    s.includes('eligible') ||
    s.includes('active') ||
    s.includes('verified')
  ) {
    return 'success';
  }

  if (
    s.includes('pending') ||
    s.includes('progress') ||
    s.includes('submit') ||
    s.includes('review') ||
    s.includes('waiting') ||
    s.includes('draft')
  ) {
    return 'warning';
  }

  if (
    s.includes('reject') ||
    s.includes('fail') ||
    s.includes('block') ||
    s.includes('expire') ||
    s.includes('action') ||
    s.includes('discip') ||
    s.includes('error')
  ) {
    return 'danger';
  }

  if (s.includes('assign') || s.includes('schedul') || s.includes('guide')) {
    return 'info';
  }

  return 'neutral';
}

const STATUS_STYLES: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-600',
  },
  danger: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-600',
  },
  neutral: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-600',
  },
};

/**
 * StatusBadge — Used for dynamic states (e.g. Approved, In Review, Pending, Rejected, Locked)
 * Strictly pill-shaped (rounded-full), borderless, with high-contrast text.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  status,
  showDot = false,
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const resolvedVariant = variant || (status ? getStatusVariant(status) : 'neutral');
  const style = STATUS_STYLES[resolvedVariant];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${style.bg} ${style.text} tracking-tight select-none ${className}`}
      {...props}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      {children || status}
    </span>
  );
};

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * CategoryBadge / TechBadge — Used for static metadata, tech stacks, domains, skills
 * Subtle rounded corners (`rounded-md`), neutral low-contrast palette, borderless.
 */
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium bg-slate-100 text-slate-700 ${sizeClasses} tracking-tight select-none ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export interface RoleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: 'student' | 'faculty' | 'coordinator' | 'admin' | string;
  size?: 'sm' | 'md';
  className?: string;
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
  },
  coordinator: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
  },
  faculty: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  student: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  },
};

/**
 * RoleBadge — Used for user role markers
 * Subtle solid accent tint with zero loud borders, tight padding, rounded-md corners.
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className = '',
  ...props
}) => {
  const normRole = (role || 'student').toLowerCase();
  const style = ROLE_STYLES[normRole] || ROLE_STYLES.student;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold capitalize ${sizeClasses} ${style.bg} ${style.text} tracking-tight select-none ${className}`}
      {...props}
    >
      {normRole}
    </span>
  );
};

export default StatusBadge;
