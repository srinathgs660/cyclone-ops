import React from 'react';

const RiskBadge = ({ level, score, size = 'sm' }) => {
  const norm = (level || '').toUpperCase();

  const styles = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/40',
    VERY_HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-950/40',
    HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/40',
    MODERATE: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-950/40',
    LOW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
  };

  const dots = {
    CRITICAL: 'bg-rose-500',
    VERY_HIGH: 'bg-orange-500',
    HIGH: 'bg-amber-500',
    MODERATE: 'bg-yellow-500',
    LOW: 'bg-emerald-500'
  };

  const currentStyle = styles[norm] || styles.MODERATE;
  const dotColor = dots[norm] || dots.MODERATE;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono font-bold uppercase tracking-wider shadow-sm ${currentStyle} ${size === 'lg' ? 'text-sm px-3.5 py-1' : 'text-xs'}`}>
      <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
      {norm}
      {score !== undefined && <span className="opacity-80">({score})</span>}
    </span>
  );
};

export default RiskBadge;
