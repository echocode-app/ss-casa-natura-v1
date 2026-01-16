'use client';

import AdminCard from '@/components/admin/AdminCard';

export default function AdminSubmissionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Richieste contatto</h1>
        <p className="text-gray-600">Messaggi dal form contatti (in sviluppo).</p>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Nota</div>
        <div className="mt-2 text-sm text-gray-700">
          Qui arriverà una lista con ricerca/filtri e pagina dettaglio.
        </div>
        <div className="mt-4 text-sm text-gray-700">
          Endpoint: <span className="font-semibold">/api/admin/contact-submissions</span>
        </div>
      </AdminCard>
    </div>
  );
}
