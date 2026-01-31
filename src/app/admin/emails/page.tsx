'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { DEFAULT_WELCOME_TEXT } from '@/lib/emailTemplates/welcomeEmail';
import { DEFAULT_PROMO_CODE_TEXT } from '@/lib/emailTemplates/promoCodeEmail';
import { DEFAULT_PASSWORD_RESET_TEXT } from '@/lib/emailTemplates/passwordResetEmail';
import { DEFAULT_ORDER_CONFIRMATION_TEXT } from '@/lib/emailTemplates/orderConfirmation';
import { DEFAULT_NEW_ORDER_ADMIN_TEXT } from '@/lib/emailTemplates/newOrderAdmin';

const inputBase = 'w-full min-h-[160px] px-3 py-2 border border-gray-300 rounded-md';

type EmailTemplates = {
  welcomeText?: string;
  promoCodeText?: string;
  passwordResetText?: string;
  orderConfirmationText?: string;
  newOrderAdminText?: string;
};

type ResponseData = {
  success?: boolean;
  emailTemplates?: EmailTemplates;
  error?: string;
};

const TEMPLATE_CONFIG = [
  {
    key: 'welcomeText' as const,
    title: 'Email di benvenuto',
    description: 'Inviata quando un utente si registra al sito.',
    placeholders: ['{{name}}'],
  },
  {
    key: 'promoCodeText' as const,
    title: 'Email codice promozionale',
    description: 'Inviata quando viene assegnato un codice sconto.',
    placeholders: ['{{name}}', '{{code}}', '{{expiresIt}}', '{{expiresEn}}'],
  },
  {
    key: 'passwordResetText' as const,
    title: 'Email reset password',
    description: 'Inviata quando un utente richiede il reset della password.',
    placeholders: ['{{name}}', '{{resetUrl}}', '{{expiresInHours}}'],
  },
  {
    key: 'orderConfirmationText' as const,
    title: 'Email conferma ordine',
    description: 'Inviata dopo il pagamento dell’ordine.',
    placeholders: [
      '{{name}}',
      '{{orderId}}',
      '{{totalAmount}}',
      '{{deliveryPrice}}',
      '{{status}}',
      '{{products}}',
    ],
  },
  {
    key: 'newOrderAdminText' as const,
    title: 'Email admin nuovo ordine',
    description: 'Template per notifiche interne (se usato).',
    placeholders: ['{{orderId}}', '{{userEmail}}', '{{totalAmount}}', '{{products}}'],
  },
];

export default function AdminEmailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailTemplates>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/email-templates', { credentials: 'include' });
      const data: ResponseData = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Impossibile caricare i template');
      }
      setDraft(data.emailTemplates || {});
    } catch (e: any) {
      notify.error(e?.message || 'Impossibile caricare i template');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (key?: keyof EmailTemplates) => {
    setIsSaving(true);
    setSavingKey(key || null);
    try {
      const payload = key ? { [key]: draft[key] } : draft;
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ emailTemplates: payload }),
      });
      const data: ResponseData = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Salvataggio fallito');
      }
      notify.success('Salvato');
      setDraft(data.emailTemplates || {});
    } catch (e: any) {
      notify.error(e?.message || 'Salvataggio fallito');
    } finally {
      setIsSaving(false);
      setSavingKey(null);
    }
  };

  const renderPreview = (key: keyof EmailTemplates, value?: string) => {
    const textValue = value?.trim();
    if (textValue) return textValue;
    if (key === 'welcomeText') return DEFAULT_WELCOME_TEXT;
    if (key === 'promoCodeText') return DEFAULT_PROMO_CODE_TEXT;
    if (key === 'passwordResetText') return DEFAULT_PASSWORD_RESET_TEXT;
    if (key === 'orderConfirmationText') return DEFAULT_ORDER_CONFIRMATION_TEXT;
    if (key === 'newOrderAdminText') return DEFAULT_NEW_ORDER_ADMIN_TEXT;
    return '';
  };

  const placeholdersNote = useMemo(
    () =>
      'Usa solo testo semplice. Le variabili tra doppie graffe vengono sostituite automaticamente.',
    [],
  );

  if (isLoading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Email</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Email</h1>
        <p className="text-gray-600 mt-1">
          Modifica solo il testo. Il codice che inserisce dati dinamici resta nel progetto.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {TEMPLATE_CONFIG.map((item) => {
          const preview = renderPreview(item.key, draft[item.key]);
          const isEditing = Boolean(editing[item.key]);

          return (
            <AdminCard key={item.key} className="p-6 flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>

              <div
                className="rounded-xl border border-black/5 bg-white/70 p-4 text-sm text-gray-800 whitespace-pre-wrap cursor-pointer"
                onClick={() => {
                  setEditing((prev) => ({ ...prev, [item.key]: true }));
                  if (!draft[item.key]) {
                    setDraft((prev) => ({
                      ...prev,
                      [item.key]: renderPreview(item.key, prev[item.key]),
                    }));
                  }
                }}
              >
                {preview || '—'}
                {!isEditing && (
                  <div className="mt-3 text-xs text-blue-700 underline">Clicca per modificare</div>
                )}
              </div>

              {isEditing && (
                <>
                  <textarea
                    className={inputBase}
                    value={draft[item.key] || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [item.key]: e.target.value,
                      }))
                    }
                    placeholder="Lascia vuoto per usare il testo di default"
                  />

                  <div className="text-xs text-gray-500 leading-relaxed">
                    {placeholdersNote}
                    <div className="mt-1">
                      Variabili disponibili: {item.placeholders.join(', ')}
                    </div>
                  </div>
                </>
              )}

              <PrimaryButton
                className="px-6 py-3 text-base w-full"
                onClick={() => save(item.key)}
                loading={isSaving && savingKey === item.key}
              >
                Salva
              </PrimaryButton>

              <p className="text-xs text-gray-500 leading-relaxed">
                Se il campo è vuoto, verrà usato il testo di default incluso nel codice.
              </p>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
