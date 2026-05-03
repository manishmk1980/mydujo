import React, { ReactNode } from 'react';

interface AdminAuthCardProps {
  children: ReactNode;
  className?: string;
}

export default function AdminAuthCard({ children, className = '' }: AdminAuthCardProps) {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/40 backdrop-blur-2xl max-w-[460px] w-full p-8 ${className}`}>
      {children}
    </div>
  );
}