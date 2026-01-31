import { renderTemplate } from './renderTemplate';

interface WelcomeEmailParams {
  name: string;
  overrideText?: string | null;
}

export const DEFAULT_WELCOME_TEXT = `Ciao {{name}},

Benvenuto in Casa Natura! Siamo felici di averti con noi.
Scopri i nostri prodotti naturali e le linee profumate per la tua casa.

Se hai bisogno di aiuto, rispondi pure a questa email.

Grazie,
Il team Casa Natura

---

Hello {{name}},

Welcome to Casa Natura! We are happy to have you with us.
Discover our natural products and fragrant lines for your home.

If you need help, feel free to reply to this email.

Thank you,
Casa Natura team
`;

export const welcomeEmailTemplate = ({ name, overrideText }: WelcomeEmailParams) => {
  const safeName = name?.trim() || 'Cliente';
  const template = overrideText?.trim() || DEFAULT_WELCOME_TEXT;
  return renderTemplate(template, { name: safeName });
};
