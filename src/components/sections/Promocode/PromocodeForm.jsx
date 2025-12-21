'use client';
import React, { useState } from 'react';
import Promocode from '@/components/ui/Form/Promocode';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function PromocodeForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('Email submitted:', email);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-4 lg:gap-6 w-full max-w-lg mx-auto"
    >
      <Promocode
        value={email}
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Inserisci la tua email"
        className="
        flex-1"
      />

      <PrimaryButton
        type="submit"
        className="
        px-6 md:px-10 lg:px-16 xl:px-20
        py-3 md:py-4 lg:py-5
        text-center"
      >
        Iscriviti
      </PrimaryButton>
    </form>
  );
}
