import React from 'react';
import logoImage from '../../assets/images/swahili_earn_logo_1791303181206.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-white shadow-md shadow-blue-500/20 border border-blue-100 flex-shrink-0 transition-transform duration-200 hover:scale-105 ${sizeClasses} ${className}`}
    >
      <img
        src={logoImage}
        alt="SWAHILI EARN Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
