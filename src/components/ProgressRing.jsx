import React from 'react';

/**
 * Circular progress ring.
 * Props: value, max, size, stroke, color, label, sublabel
 */
export default function ProgressRing({
  value = 0,
  max = 100,
  size = 140,
  stroke = 12,
  color = '#52885b',
  trackColor = '#e3eee5',
  label,
  sublabel,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const offset = circumference * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <div className="text-2xl font-semibold text-slate-800">{label}</div>}
        {sublabel && <div className="text-xs text-slate-500 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
