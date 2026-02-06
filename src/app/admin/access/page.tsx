'use client';

// Superadmin-only admin access management UI.
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import {
  ADMIN_ASSIGNABLE_SECTIONS,
  DEFAULT_ADMIN_SECTIONS,
  AdminSection,
} from '@/lib/admin/access';

type AdminEntry = {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  role?: string;
  adminSections?: string[];
};

type AccessResponse = {
  success?: boolean;
  admins?: AdminEntry[];
  maxAdmins?: number;
  availableSections?: AdminSection[];
  error?: string;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

const SECTION_META: Record<
  Exclude<AdminSection, 'access'>,
  { label: string; description: string }
> = {
  dashboard: {
    label: 'Dashboard',
    description: 'Statistiche e panoramica principale.',
  },
  orders: {
    label: 'Ordini',
    description: 'Gestione e dettaglio ordini.',
  },
  products: {
    label: 'Prodotti',
    description: 'Catalogo prodotti, varianti e giacenze.',
  },
  'hero-banners': {
    label: 'Banner Hero',
    description: 'Impostazione banner principali.',
  },
  promotions: {
    label: 'Promozioni',
    description: 'PromoBar e promozioni attive.',
  },
  shipping: {
    label: 'Spedizione',
    description: 'Tariffe e impostazioni di spedizione.',
  },
  submissions: {
    label: 'Richieste contatto',
    description: 'Messaggi ricevuti dal sito.',
  },
  emails: {
    label: 'Email',
    description: 'Testi email transazionali e promozionali.',
  },
  docs: {
    label: 'Documentazione',
    description: 'Accesso alla documentazione interna del progetto.',
  },
};

export default function AdminAccessPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'superadmin';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [maxAdmins, setMaxAdmins] = useState(3);
  const [availableSections, setAvailableSections] = useState<AdminSection[]>(
    Array.from(ADMIN_ASSIGNABLE_SECTIONS) as AdminSection[],
  );
  const [email, setEmail] = useState('');
  const [sections, setSections] = useState<string[]>(
    DEFAULT_ADMIN_SECTIONS.filter((s) => s !== 'access'),
  );

  const sortedAdmins = useMemo(
    () => [...admins].sort((a, b) => a.email.localeCompare(b.email)),
    [admins],
  );

  const formatSections = (list: string[] | undefined) => {
    if (!list || list.length === 0) return '—';
    return list
      .map((key) => key.trim())
      .filter(Boolean)
      .map((key) => SECTION_META[key as Exclude<AdminSection, 'access'>]?.label || key)
      .join(', ');
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/access', { credentials: 'include' });
      const data: AccessResponse = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Impossibile caricare gli accessi');
      }
      setAdmins(data.admins || []);
      setMaxAdmins(data.maxAdmins || 3);
      if (data.availableSections?.length) {
        setAvailableSections(data.availableSections);
      }
    } catch (e: any) {
      notify.error(e?.message || 'Impossibile caricare gli accessi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleSection = (key: string) => {
    setSections((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handleGrant = async () => {
    if (!canManage) {
      notify.error('Solo il superadmin può gestire gli accessi.');
      return;
    }

    const payload = {
      email: email.trim().toLowerCase(),
      sections,
    };

    if (!payload.email) {
      notify.error('Inserisci un’email valida.');
      return;
    }

    if (payload.sections.length === 0) {
      notify.error('Seleziona almeno una sezione.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/access', {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Salvataggio fallito');
      }
      notify.success('Accesso aggiornato.');
      await load();
      setEmail('');
    } catch (e: any) {
      notify.error(e?.message || 'Salvataggio fallito');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async (targetEmail: string) => {
    if (!canManage) {
      notify.error('Solo il superadmin può gestire gli accessi.');
      return;
    }

    const confirmed = window.confirm(`Revocare l’accesso per ${targetEmail}?`);
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/access', {
        method: 'DELETE',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Revoca fallita');
      }
      notify.success('Accesso revocato.');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Revoca fallita');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Gestione accessi</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Gestione accessi</h1>
        <p className="text-gray-600 mt-1">
          Il superadmin può concedere o revocare l’accesso alle sezioni dell’admin.
        </p>
      </div>

      <AdminCard className="p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email utente</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="email@dominio.it"
            disabled={!canManage || isSaving}
          />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Sezioni disponibili</div>
          <div className="flex flex-col gap-3">
            {availableSections
              .filter((key) => key !== 'access')
              .map((key) => {
                const meta = SECTION_META[key as Exclude<AdminSection, 'access'>];
                const checked = sections.includes(key);
                return (
                  <label key={key} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSection(key)}
                      disabled={!canManage || isSaving}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        {meta?.label || key}
                      </span>
                      <span className="block text-xs text-gray-500 leading-relaxed">
                        {meta?.description || 'Sezione amministrativa.'}
                      </span>
                    </span>
                  </label>
                );
              })}
          </div>
        </div>

        <PrimaryButton
          className="px-6 py-3 text-base w-full"
          onClick={handleGrant}
          loading={isSaving}
          disabled={!canManage}
        >
          Concedi/aggiorna accesso
        </PrimaryButton>

        <p className="text-xs text-gray-500 leading-relaxed">
          L’email deve essere già registrata sul sito. Massimo {maxAdmins} admin attivi. La sezione
          Gestione accessi resta riservata a superadmin e developer.
        </p>

        {!canManage && (
          <p className="text-xs text-amber-600">
            Accesso in sola lettura: solo il superadmin può modificare i permessi.
          </p>
        )}
      </AdminCard>

      <AdminCard className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin attivi</h2>
          <div className="text-xs text-gray-500">
            {admins.length} / {maxAdmins}
          </div>
        </div>
        {sortedAdmins.length === 0 ? (
          <div className="mt-3 text-gray-600">Nessun admin aggiuntivo.</div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {sortedAdmins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-[18px] border border-black/5 bg-white/70 px-4 py-3"
              >
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{admin.email}</div>
                    <div className="text-xs text-gray-500">
                      {(admin.name || admin.surname) &&
                        `${admin.name || ''} ${admin.surname || ''}`.trim()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevoke(admin.email)}
                    disabled={!canManage || isSaving}
                    className={`mt-2 md:mt-0 text-xs font-semibold px-3 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors ${
                      !canManage || isSaving ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    Revoca accesso
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Sezioni: {formatSections(admin.adminSections)}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          Ogni admin vede solo le sezioni selezionate. Per modificare i permessi, reinserisci la
          stessa email e aggiorna le sezioni.
        </p>
      </AdminCard>
    </div>
  );
}
