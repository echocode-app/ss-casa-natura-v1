'use client';
import React, { useState } from 'react';
import Promocode from '@/components/ui/Form/Promocode';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';
import notify from '@/lib/notify';

export default function PromocodeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      notify.error('Per favore inserisci la tua email!');
      return;
    }

    if (!isValidEmail(email)) {
      notify.error('Inserisci un indirizzo email valido!');
      return;
    }

    setLoading(true);

    try {
      // API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
      notify.success('Email inviata con successo!');
    } catch {
      notify.error('Errore durante l’invio. Riprova!');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-center text-[clamp(16px,2vw,24px)] font-semibold">
        Attendi il tuo codice promozionale nella tua email!
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto"
    >
      <Promocode
        value={email}
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Inserisci la tua email"
        className="flex-1"
      />

      <PrimaryButton
        type="submit"
        disabled={loading || !email || !isValidEmail(email)}
        className="px-10 lg:px-16 xl:px-20 py-3 md:py-4 lg:py-5 text-center"
      >
        {loading ? <Spinner size="sm" colorScheme="accent" /> : 'Iscriviti'}
      </PrimaryButton>
    </form>
  );
}
