'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  size = 'medium',
  position = 'top',
  className = '',
  contentClassName = '',
  disabled = false
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  // Size mappings for consistent tooltip sizing
  const sizeClasses = {
    small: 'tooltip-sm',
    medium: 'tooltip-md', 
    large: 'tooltip-lg'
  };

  // Position mappings for DaisyUI tooltip directions
  const positionClasses = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right'
  };

  // Content width classes for different sizes
  const contentWidthClasses = {
    small: 'max-w-xs',
    medium: 'max-w-sm',
    large: 'max-w-md'
  };

  return (
    <div 
      className={cn(
        'tooltip',
        positionClasses[position],
        sizeClasses[size],
        'z-[9999]', // Ensure tooltip appears above all other content
        className
      )}
      data-tip={content}
      data-testid="tooltip-wrapper"
      style={{ zIndex: 9999 }} // Inline style as backup
    >
      {children}
    </div>
  );
}

// Enhanced tooltip with custom styling for complex content
export interface TooltipEnhancedProps {
  content: React.ReactNode;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  showArrow?: boolean;
}

export function TooltipEnhanced({
  content,
  children,
  size = 'medium',
  position = 'top',
  className = '',
  contentClassName = '',
  disabled = false,
  showArrow = true
}: TooltipEnhancedProps) {
  if (disabled) {
    return <>{children}</>;
  }

  // Size-based padding and text sizes
  const sizeStyles = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  // Position-based arrow styles
  const arrowStyles = {
    top: 'after:border-t-base-content after:border-t-4 after:border-x-transparent after:border-x-4 after:border-b-0 after:top-full after:left-1/2 after:-translate-x-1/2',
    bottom: 'after:border-b-base-content after:border-b-4 after:border-x-transparent after:border-x-4 after:border-t-0 after:bottom-full after:left-1/2 after:-translate-x-1/2',
    left: 'after:border-l-base-content after:border-l-4 after:border-y-transparent after:border-y-4 after:border-r-0 after:left-full after:top-1/2 after:-translate-y-1/2',
    right: 'after:border-r-base-content after:border-r-4 after:border-y-transparent after:border-y-4 after:border-l-0 after:right-full after:top-1/2 after:-translate-y-1/2'
  };

  return (
    <div className={cn('relative inline-block group', className)}>
      {children}
      
      {/* Custom tooltip content */}
      <div 
        className={cn(
          'absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200',
          'bg-base-content text-base-100 rounded-lg shadow-lg',
          'whitespace-nowrap pointer-events-none',
          'z-[9999]', // Ensure tooltip appears above all other content
          sizeStyles[size],
          showArrow && 'after:content-[""] after:absolute after:w-0 after:h-0',
          showArrow && arrowStyles[position],
          // Position the tooltip
          position === 'top' && 'bottom-full mb-2 left-1/2 -translate-x-1/2',
          position === 'bottom' && 'top-full mt-2 left-1/2 -translate-x-1/2',
          position === 'left' && 'right-full mr-2 top-1/2 -translate-y-1/2',
          position === 'right' && 'left-full ml-2 top-1/2 -translate-y-1/2',
          contentClassName
        )}
        style={{ zIndex: 9999 }} // Inline style as backup
        data-testid="tooltip-content"
      >
        {content}
      </div>
    </div>
  );
}

// Pre-configured tooltip variants for common use cases
export function TooltipSmall({ content, children, position = 'top', ...props }: Omit<TooltipProps, 'size'>) {
  return (
    <Tooltip content={content} size="small" position={position} {...props}>
      {children}
    </Tooltip>
  );
}

export function TooltipMedium({ content, children, position = 'top', ...props }: Omit<TooltipProps, 'size'>) {
  return (
    <Tooltip content={content} size="medium" position={position} {...props}>
      {children}
    </Tooltip>
  );
}

export function TooltipLarge({ content, children, position = 'top', ...props }: Omit<TooltipProps, 'size'>) {
  return (
    <Tooltip content={content} size="large" position={position} {...props}>
      {children}
    </Tooltip>
  );
}

// Info tooltip with question mark icon
export function TooltipInfo({ content, size = 'medium', position = 'top', className = '', ...props }: TooltipProps) {
  return (
    <Tooltip content={content} size={size} position={position} className={className} {...props}>
      <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-base-300 text-base-content hover:bg-base-200 transition-colors cursor-help">
        <span className="text-xs">?</span>
      </div>
    </Tooltip>
  );
}

// Compatibility exports for shadcn-ui style usage
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const TooltipTrigger = ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: any }) => (
  <div {...props}>{children}</div>
);
export const TooltipContent = ({ children, side, className, ...props }: { 
  children: React.ReactNode; 
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  [key: string]: any 
}) => (
  <div className={cn('bg-base-content text-base-100 rounded-lg p-2 text-sm shadow-lg', className)} {...props}>
    {children}
  </div>
);