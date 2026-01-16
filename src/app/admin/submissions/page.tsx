'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';

type Status = 'new' | 'resolved' | 'rejected';

type Submission = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: Status;
  createdAt: string;
};

type ListResponse = {
  success?: boolean;
  items?: Submission[];
  total?: number;
  error?: string;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/admin/contact-submissions', window.location.origin);
      url.searchParams.set('limit', '100');
      if (query.trim()) url.searchParams.set('q', query.trim());
      if (status !== 'all') url.searchParams.set('status', status);

      const res = await fetch(url.toString(), { credentials: 'include' });
      const data: ListResponse = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.error || 'Impossibile caricare le richieste');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      notify.error(e?.message || 'Impossibile caricare le richieste');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    // API already filters, but keep it robust for client-only changes.
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const s = (it.status || 'new') as Status;
      if (status !== 'all' && s !== status) return false;
      if (!q) return true;
      return (
        it.email.toLowerCase().includes(q) ||
        it.name.toLowerCase().includes(q) ||
        it.subject.toLowerCase().includes(q)
      );
    });
  }, [items, query, status]);

  const setItemStatus = async (id: string, next: Status) => {
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/contact-submissions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Aggiornamento fallito');
      notify.success('Aggiornato');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Aggiornamento fallito');
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Richieste contatto</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Richieste contatto</h1>
          <p className="text-gray-600 mt-1">Gestisci richieste e stato (nuova/risolta/rifiutata)</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Aggiorna
          </PrimaryButton>
        </div>
      </div>

      <AdminCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cerca</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Email, nome o oggetto…"
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={inputBase}
            >
              <option value="all">Tutti</option>
              <option value="new">Nuove</option>
              <option value="resolved">Risolte</option>
              <option value="rejected">Rifiutate</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Applica
          </PrimaryButton>
        </div>
      </AdminCard>

      <AdminCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 font-semibold">Elenco ({filtered.length})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 bg-white/60">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Contatto</th>
                <th className="px-5 py-3">Oggetto</th>
                <th className="px-5 py-3">Stato</th>
                <th className="px-5 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const s = (it.status || 'new') as Status;
                const isOpen = !!expanded[it._id];
                return (
                  <Fragment key={it._id}>
                    <tr key={it._id} className="border-t border-black/5">
                      <td className="px-5 py-3 whitespace-nowrap">
                        {new Date(it.createdAt).toLocaleString('it-IT')}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-gray-900">{it.name}</div>
                        <div className="text-gray-600 break-words">{it.email}</div>
                        {it.phone ? <div className="text-gray-600">{it.phone}</div> : null}
                      </td>
                      <td className="px-5 py-3">{it.subject}</td>
                      <td className="px-5 py-3">
                        <select
                          value={s}
                          onChange={(e) => setItemStatus(it._id, e.target.value as Status)}
                          className="px-2 py-1 border border-gray-300 rounded"
                          disabled={!!saving[it._id]}
                        >
                          <option value="new">Nuova</option>
                          <option value="resolved">Risolta</option>
                          <option value="rejected">Rifiutata</option>
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          className="text-blue-700 hover:underline"
                          onClick={() => setExpanded((p) => ({ ...p, [it._id]: !p[it._id] }))}
                        >
                          {isOpen ? 'Nascondi' : 'Mostra'}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr key={`${it._id}_msg`} className="border-t border-black/5 bg-white/40">
                        <td className="px-5 py-3" colSpan={5}>
                          <div className="text-gray-700 whitespace-pre-wrap">{it.message}</div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
