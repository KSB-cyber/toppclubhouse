import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'dark', size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const colorClasses = {
    light: 'text-white',
    dark: 'text-primary',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Image */}
      <img 
        src="/TOPP club house new logo.jpeg" 
        alt="TOPP Club House" 
        className={cn(sizeClasses[size], 'object-contain rounded-lg')}
      />
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            'font-display font-bold tracking-tight',
            textSizeClasses[size],
            colorClasses[variant]
          )}>
            TOPP
          </span>
          <span className={cn(
            'font-medium tracking-wide',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
            variant === 'light' ? 'text-accent' : 'text-accent'
          )}>
            club house
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
