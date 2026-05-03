import React, { ReactNode } from 'react';

interface AdminAuthShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export default function AdminAuthShell({ children, eyebrow, title, subtitle }: AdminAuthShellProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#070b16] text-white font-sans">
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        {/* Radial orange glow */}
        <div className="absolute top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-[color-mix(in_srgb,var(--admin-primary)_8%,transparent)] blur-3xl" />
        {/* Radial slate/blue glow */}
        <div className="absolute bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-slate-700/5 rounded-full blur-3xl" />
        {/* Subtle grid effect */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                            linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
        {/* Large faint MDPL watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[20vw] font-black tracking-widest uppercase font-display select-none">
            MDPL
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[460px] text-center">
          {eyebrow && (
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                {eyebrow}
              </span>
            </div>
          )}
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-3">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}