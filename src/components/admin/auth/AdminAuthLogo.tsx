import React from 'react';
import { Link } from 'react-router-dom';

interface AdminAuthLogoProps {
  className?: string;
  linkTo?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AdminAuthLogo({ className = '', linkTo = '/', size = 'md' }: AdminAuthLogoProps) {
  const sizeClasses = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-32',
  };

  return (
    <div className={`inline-flex justify-center mb-6 ${className}`}>
      <Link to={linkTo} className="inline-flex items-center justify-center">
        <div className="rounded-2xl bg-white/95 p-4 shadow-lg shadow-black/10">
          <img
            src="/brand/mdpl-logo.svg"
            alt="MDPL Admin"
            className={`${sizeClasses[size]} w-auto`}
          />
        </div>
      </Link>
    </div>
  );
}