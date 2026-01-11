'use client';

import { useEffect, useState } from 'react';

interface FormErrorProps {
  message: string | null;
  className?: string;
}

export default function FormError({ message, className = '' }: FormErrorProps) {
  const [show, setShow] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
      const timer = setTimeout(() => setCurrentMessage(null), 300);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!currentMessage) return null;

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
        text-sm text-red-600 mt-1
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {currentMessage}
    </div>
  );
}
