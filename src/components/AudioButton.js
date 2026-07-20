import React from 'react';

export const VolumeIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} stroke={color} />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const AudioButton = ({
  onClick,
  label = 'Nghe',
  showLabel = false,
  size = 18,
  className = '',
  style = {},
  title = 'Phát âm thanh',
}) => {
  return (
    <button
      type="button"
      className={`audio-modern-btn ${showLabel ? 'has-label' : 'icon-only'} ${className}`}
      onClick={(e) => {
        if (e) e.stopPropagation();
        if (onClick) onClick();
      }}
      title={title}
      style={style}
    >
      <VolumeIcon size={size} color="currentColor" />
      {showLabel && <span className="audio-modern-label">{label}</span>}
    </button>
  );
};

export default AudioButton;
