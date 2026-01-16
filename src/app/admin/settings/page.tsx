'use client';

import AdminCard from '@/components/admin/AdminCard';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Impostazioni</h1>
        <p className="text-gray-600">Impostazioni del sito (in sviluppo).</p>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Cosa verrà aggiunto</div>
        <div className="mt-2 text-sm text-gray-700">
          Configurazioni principali (es. contatti, banner, SEO) con un editor semplice e
          salvataggio.
        </div>
        <div className="mt-4 text-sm text-gray-700">
          Endpoint: <span className="font-semibold">/api/site-settings</span>
        </div>
      </AdminCard>
    </div>
  );
}
