'use client';

import AdminCard from '@/components/admin/AdminCard';

export default function AdminPromotionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Promozioni</h1>
        <p className="text-gray-600">Gestione codici sconto e promo (in sviluppo).</p>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Nota</div>
        <div className="mt-2 text-sm text-gray-700">
          Questa pagina verrà resa più semplice: elenco codici, attivazione/disattivazione e
          validità.
        </div>
        <div className="mt-4 text-sm text-gray-700">
          Endpoint: <span className="font-semibold">/api/admin/promocodes</span>
        </div>
      </AdminCard>
    </div>
  );
}
