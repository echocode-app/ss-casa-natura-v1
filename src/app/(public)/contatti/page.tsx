import React from 'react';
import ContattiBanner from '@/components/sections/Contatti/ContattiBanner';
import ContattiForm from '@/components/sections/Contatti/ContattiForm';

export default function ContattiPage() {
  return (
    <main className="overflow-x-hidden">
      <ContattiBanner />
      <ContattiForm />
    </main>
  );
}
