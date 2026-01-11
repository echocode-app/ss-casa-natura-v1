'use client';
import { useState } from 'react';
import Spinner from '@/components/ui/Spinner/Spinner';

export default function PrimaryButton({
  children,
  onClick,
  className = '',
  type = 'button',
  delay = 500,
  disabled: externalDisabled = false,
  loading = false,
}) {
  const [disabled, setDisabled] = useState(false);

  const isDisabled = disabled || externalDisabled || loading;

  const handleClick = async (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    // For submit buttons, don't prevent default or set disabled state
    if (type === 'submit') {
      if (onClick) {
        await onClick(e);
      }
      return;
    }

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
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" colorScheme="muted" className="!w-5 !h-5 !border-[2px]" />
          <span className="opacity-0 absolute">{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
