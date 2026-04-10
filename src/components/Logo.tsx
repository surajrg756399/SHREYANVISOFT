import React from 'react';

export default function Logo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 450" 
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.25" />
        </filter>

        <radialGradient id="ballRed" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FF7676" />
          <stop offset="100%" stopColor="#B71C1C" />
        </radialGradient>
        <radialGradient id="ballGreen" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5EFA93" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
        <radialGradient id="ballBlue" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#64C1FF" />
          <stop offset="100%" stopColor="#0D47A1" />
        </radialGradient>
        <radialGradient id="ballYellow" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#F57F17" />
        </radialGradient>

        <linearGradient id="textRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF4B4B" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>
        <linearGradient id="textGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
        <linearGradient id="textBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#29B6F6" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id="textGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFCA28" />
          <stop offset="100%" stopColor="#F9A825" />
        </linearGradient>
        <linearGradient id="textSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#757575" />
        </linearGradient>
      </defs>

      <rect width="800" height="450" fill="#FFFFFF" />

      <text x="400" y="210" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="100" fontWeight="900" textAnchor="middle" filter="url(#shadow)">
        <tspan fill="#E53935">S</tspan>
        <tspan fill="#43A047">H</tspan>
        <tspan fill="#1E88E5">R</tspan>
        <tspan fill="#FFB300">E</tspan>
        <tspan fill="#E53935">Y</tspan>
        <tspan fill="#43A047">A</tspan>
        <tspan fill="#1E88E5">N</tspan>
        <tspan fill="#FFB300">V</tspan>
        <tspan fill="#E53935">I</tspan>
      </text>

      <text x="400" y="320" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="100" fontWeight="900" textAnchor="middle" filter="url(#shadow)">
        <tspan fill="#1E88E5">SOFT</tspan><tspan fill="#546E7A" fontSize="40" baselineShift="super">™</tspan>
      </text>
    </svg>
  );
}
