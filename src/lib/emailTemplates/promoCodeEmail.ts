import { renderTemplate } from './renderTemplate';

interface PromoCodeEmailParams {
  name?: string;
  code: string;
  expiresAt?: Date | string;
  overrideText?: string | null;
}

function formatDate(date?: Date | string, locale = 'it-IT') {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString(locale);
  } catch {
    return '';
  }
}

export const DEFAULT_PROMO_CODE_TEXT = `Ciao {{name}},

Ecco il tuo codice promozionale:
{{code}}
{{expiresIt}}

Inserisci il codice al checkout per ottenere lo sconto.

Grazie,
Il team Casa Natura

---

Hello {{name}},

Here is your promo code:
{{code}}
{{expiresEn}}

Enter the code at checkout to get your discount.

Thank you,
Casa Natura team
`;

export const promoCodeEmailTemplate = ({
  name,
  code,
  expiresAt,
  overrideText,
}: PromoCodeEmailParams) => {
  const safeName = name?.trim() || 'Cliente';
  const expiryIt = formatDate(expiresAt, 'it-IT');
  const expiryEn = formatDate(expiresAt, 'en-US');
  const template = overrideText?.trim() || DEFAULT_PROMO_CODE_TEXT;

  return renderTemplate(template, {
    name: safeName,
    code,
    expiresIt: expiryIt ? `Valido fino al ${expiryIt}.` : '',
    expiresEn: expiryEn ? `Valid until ${expiryEn}.` : '',
  });
};
