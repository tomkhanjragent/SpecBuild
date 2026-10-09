import React, { useState, useEffect } from 'react';
import { MemberStatus } from '../../types/app.types';
import { getPhotoSignedUrl } from '../../lib/storage';

interface AvatarProps {
  name: string;
  photoPath?: string | null;
  photoUrl?: string | null;
  status?: MemberStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

export function Avatar({
  name,
  photoPath,
  photoUrl,
  status,
  size = 'md',
  showStatus = false,
  className = '',
}: AvatarProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(photoUrl || null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (photoUrl) {
      setResolvedUrl(photoUrl);
      setImgError(false);
      return;
    }
    if (photoPath) {
      getPhotoSignedUrl(photoPath).then((url) => {
        if (isMounted && url) {
          setResolvedUrl(url);
          setImgError(false);
        }
      });
    } else {
      setResolvedUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [photoPath, photoUrl]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const sizeStyles = {
    xs: { box: 'w-6 h-6 text-[10px]', dot: 'w-2 h-2 ring-1' },
    sm: { box: 'w-8 h-8 text-xs', dot: 'w-2 h-2 ring-1.5' },
    md: { box: 'w-10 h-10 text-sm font-medium', dot: 'w-2.5 h-2.5 ring-2' },
    lg: { box: 'w-14 h-14 text-base font-semibold', dot: 'w-3 h-3 ring-2' },
    xl: { box: 'w-20 h-20 text-xl font-bold', dot: 'w-4 h-4 ring-2' },
  }[size];

  // Stable pleasant avatar background color based on name
  const colors = [
    'bg-blue-600/30 text-blue-300 border-blue-500/30',
    'bg-indigo-600/30 text-indigo-300 border-indigo-500/30',
    'bg-cyan-600/30 text-cyan-300 border-cyan-500/30',
    'bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
    'bg-violet-600/30 text-violet-300 border-violet-500/30',
    'bg-amber-600/30 text-amber-300 border-amber-500/30',
  ];
  const charCode = name.charCodeAt(0) || 0;
  const colorClass = colors[charCode % colors.length];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {resolvedUrl && !imgError ? (
        <img
          src={resolvedUrl}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeStyles.box} rounded-full object-cover border border-slate-700/60 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeStyles.box} ${colorClass} rounded-full border flex items-center justify-center font-display select-none shadow-xs`}
        >
          {initials}
        </div>
      )}

      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 ${sizeStyles.dot} ring-[#1E293B] rounded-full ${
            status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />
      )}
    </div>
  );
}
