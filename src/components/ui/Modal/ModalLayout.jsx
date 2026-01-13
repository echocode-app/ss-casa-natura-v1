'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ModalLayout({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background-overlay z-40" onClick={onClose} />

      {/* Modal container */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4"
        onClick={onClose}
      >
        <div
          className="bg-background-primary rounded-modal-sm md:rounded-modal-xl w-full max-w-[80%] md:max-w-[60%] lg:max-w-[680px] mx-auto p-2 md:p-4 xl:p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
