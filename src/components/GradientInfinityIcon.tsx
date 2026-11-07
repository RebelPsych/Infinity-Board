import React from 'react';

interface GradientInfinityIconProps {
  className?: string;
  size?: number;
}

export const GradientInfinityIcon: React.FC<GradientInfinityIconProps> = ({
  className = 'w-5 h-5',
  size = 22,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="infinityBluePurplePinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />    {/* Electric Blue */}
          <stop offset="50%" stopColor="#c084fc" />   {/* Purple in the middle */}
          <stop offset="100%" stopColor="#f472b6" />  {/* Vibrant Pink */}
        </linearGradient>
      </defs>
      <path
        d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
        stroke="url(#infinityBluePurplePinkGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
