'use client';

import AdminCard from '@/components/admin/AdminCard';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Impostazioni</h1>
        <p className="text-gray-600 mt-1">
          Questa sezione sarà disponibile nella prossima versione.
        </p>
      </div>

      <AdminCard className="p-5">
        <div className="text-gray-700">
          Per ora, le impostazioni della PromoBar sono disponibili in{' '}
          <span className="font-semibold">Promozioni</span>.
        </div>
      </AdminCard>
    </div>
  );
}
