'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CartItem from './CartItem.tsx';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';
import { useCart } from '@/contexts/CartContext';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

export default function CartDropdown({ parentRef, isOpen, onClose }) {
  const { items, updateItem, removeItem, isLoading } = useCart();
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [dropdownWidth, setDropdownWidth] = useState('90vw');
  const containerRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const showOverlay = useSmoothLoading(isLoading, 120, 220);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!parentRef?.current) return;

    const updatePosition = () => {
      const rect = parentRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [parentRef, isOpen]);

  useLayoutEffect(() => {
    const updateWidth = () => {
      const w = window.innerWidth;
      if (w >= 1540) setDropdownWidth('800px');
      else if (w >= 1024) setDropdownWidth('600px');
      else if (w >= 768) setDropdownWidth('70vw');
      else if (w >= 500) setDropdownWidth('80vw');
      else setDropdownWidth('90vw');
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const increase = async (id) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setIsUpdating(id);
      try {
        await updateItem(id, item.quantity + 1);
      } finally {
        setIsUpdating(null);
      }
    }
  };

  const decrease = async (id) => {
    const item = items.find((i) => i.id === id);
    if (item && item.quantity > 1) {
      setIsUpdating(id);
      try {
        await updateItem(id, item.quantity - 1);
      } finally {
        setIsUpdating(null);
      }
    }
  };

  const handleRemove = async (id) => {
    setIsUpdating(id);
    try {
      await removeItem(id);
    } finally {
      setIsUpdating(null);
    }
  };

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed z-[1050] transition-opacity duration-300"
      style={{
        top: coords.top,
        right: coords.right,
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
      }}
      onMouseLeave={() => window.innerWidth >= 1024 && onClose()}
    >
      <div
        className="relative bg-white flex flex-col max-h-[80vh] overflow-y-auto"
        style={{
          boxShadow:
            '0px 2px 4.9px -1px rgba(0, 0, 0, 0.25), inset 0 5px 5.2px -3px rgba(0,0,0,0.25)',
          width: dropdownWidth,
        }}
      >
        {showOverlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <Spinner size="md" />
          </div>
        )}

        <div className="overflow-y-auto max-h-[50vw] flex-1 py-3 px-1 md:py-4 flex flex-col gap-2 md:gap-4">
          {items.length === 0 ? (
            <CartEmpty />
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                isUpdating={isUpdating === item.id}
                onIncrease={() => increase(item.id)}
                onDecrease={() => decrease(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            ))
          )}
        </div>

        {items.length > 0 && <CartFooter items={items} />}
      </div>
    </div>,
    document.body,
  );
}
