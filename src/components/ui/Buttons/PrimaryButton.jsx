'use client';
import { useState } from 'react';

export default function PrimaryButton({
  children,
  onClick,
  className = '',
  type = 'button',
  delay = 500,
}) {
  const [disabled, setDisabled] = useState(false);

  const handleClick = async (e) => {
    if (disabled) return;
    setDisabled(true);

    if (onClick) {
      await onClick(e);
    }

    setTimeout(() => {
      setDisabled(false);
    }, delay);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`
        bg-brand-accent
        text-black
        font-semibold
        text-[clamp(12px,1.5vw,22px)]
        rounded-[25px]
        transition-all duration-300
        hover:shadow-header 
        hover:opacity-90
        focus:outline-none 
        focus:shadow-header 
        focus:ring-0
        active:outline-none
        active:ring-0
        ${disabled ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
