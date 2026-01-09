'use client';
import { useState, useEffect } from 'react';

export default function PrimaryButton({
  children,
  onClick,
  className = '',
  type = 'button',
  delay = 500,
  disabled: externalDisabled = false,
}) {
  const [disabled, setDisabled] = useState(false);

  const isDisabled = disabled || externalDisabled;

  const handleClick = async (e) => {
    if (isDisabled) return;
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
      disabled={isDisabled}
      className={`
        bg-brand-accent
        text-black
        font-semibold
        text-[clamp(14px,2vw,22px)]
        rounded-[25px]
        transition-all duration-300
        hover:shadow-header 
        hover:opacity-90
        focus:outline-none 
        focus:shadow-header 
        focus:ring-0
        active:outline-none
        active:ring-0
        ${isDisabled ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
