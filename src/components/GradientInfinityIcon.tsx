import React from 'react';

interface GradientInfinityIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const GradientInfinityIcon: React.FC<GradientInfinityIconProps> = ({
  className = 'w-5 h-5',
  size = 22,
  color = '#b989f8',
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
      <path
        d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
        stroke={color}
        strokeWidth="2.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
