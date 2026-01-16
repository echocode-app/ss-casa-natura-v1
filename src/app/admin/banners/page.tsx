'use client';

import AdminCard from '@/components/admin/AdminCard';

export default function AdminBannersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Banner Hero</h1>
        <p className="text-gray-600">Gestione banner in homepage (in sviluppo).</p>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Cosa puoi fare qui</div>
        <div className="mt-2 text-sm text-gray-700">
          Questa sezione verrà semplificata con una lista + modifica rapida (immagine, titolo,
          testo, link, attivo, ordine).
        </div>
        <div className="mt-4 text-sm text-gray-700">
          Endpoint: <span className="font-semibold">/api/admin/hero-banners</span>
        </div>
      </AdminCard>
    </div>
  );
}
