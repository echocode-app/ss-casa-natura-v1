'use client';
import React from 'react';

export default function Promocode({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  name = '',
  className = '',
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
  w-full
  p-5 md:px-7
  lg:py-7 lg:pl-10

  rounded-[49px]
  border border-transparent
  bg-white

  text-text-primary text-[clamp(14px,1.5vw,20px)]
  placeholder:text-text-gray

  outline-none
  transition-all duration-300 ease-out

  focus:border-gray-300

  max-w-[720px] max-h-[100px]
  ${className}
`}
    />
  );
}
