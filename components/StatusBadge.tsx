'use client';

import { FeatureRequestStatus, STATUS_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: FeatureRequestStatus;
  className?: string;
}

/**
 * StatusBadge displays the current status of a feature request
 * with appropriate colors and styling based on the status type
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        'status-badge',
        config.bgColor,
        config.color,
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
