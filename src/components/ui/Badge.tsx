import React from 'react';
import { MemberStatus } from '../../types/app.types';

interface BadgeProps {
  status?: MemberStatus;
  role?: 'admin' | 'staff';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ status, role, children, className = '', size = 'md' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (status === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {children || 'Active'}
      </span>
    );
  }

  if (status === 'no_work') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        {children || 'No Work'}
      </span>
    );
  }

  if (role === 'admin') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 ${sizeClasses} ${className}`}
      >
        Admin
      </span>
    );
  }

  if (role === 'staff') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40 ${sizeClasses} ${className}`}
      >
        Staff
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}
