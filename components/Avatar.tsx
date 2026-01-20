'use client';

import { cn, getInitials, stringToColor } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Avatar component displays a user's profile image or initials
 * Falls back to initials with a consistent color based on the name
 */
export function Avatar({ name, image, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const imageSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  if (image) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex-shrink-0',
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={image}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover"
        />
      </div>
    );
  }

  const initials = getInitials(name);
  const bgColor = stringToColor(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white flex-shrink-0',
        sizeClasses[size],
        bgColor,
        className
      )}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}
