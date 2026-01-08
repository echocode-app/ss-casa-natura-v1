'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CartItem from './CartItem';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';

export default function CartDropdown({ parentRef, isOpen, onClose, items: initialItems = [] }) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const containerRef = useRef(null);
  const [items, setItems] = useState(initialItems);
  const [dropdownWidth, setDropdownWidth] = useState('90vw');

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
    return () => window.removeEventListener('resize', updatePosition);
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

  const increase = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  const decrease = (id) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i)),
    );
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

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
      className="fixed z-[9999] transition-opacity duration-300"
      style={{
        top: coords.top,
        right: coords.right,
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 1024) onClose();
      }}
    >
      <div
        className="
          bg-white
          flex flex-col
          max-h-[80vh]
          overflow-hidden
        "
        style={{
          boxShadow:
            '0px 2px 4.9px -1px rgba(0, 0, 0, 0.25), inset 0 5px 5.2px -3px rgba(0,0,0,0.25)',
          width: dropdownWidth,
        }}
      >
        <div className="flex-1 overflow-y-auto py-3 px-1 md:py-5 flex flex-col gap-2 md:gap-5">
          {items.length === 0 ? (
            <CartEmpty />
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={() => increase(item.id)}
                onDecrease={() => decrease(item.id)}
                onRemove={() => remove(item.id)}
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
