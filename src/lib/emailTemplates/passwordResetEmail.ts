import { renderTemplate } from './renderTemplate';

interface PasswordResetEmailParams {
  name?: string;
  resetUrl: string;
  expiresInHours: number;
  overrideText?: string | null;
}

export const DEFAULT_PASSWORD_RESET_TEXT = `Ciao {{name}},

Abbiamo ricevuto una richiesta di reset della tua password.
Clicca qui per impostarne una nuova:
{{resetUrl}}

Il link scade tra {{expiresInHours}} ore. Se non hai richiesto tu il reset, ignora questa email.

Grazie,
Il team Casa Natura

---

Hello {{name}},

We received a request to reset your password.
Click here to set a new one:
{{resetUrl}}

This link expires in {{expiresInHours}} hours. If you did not request the reset, please ignore this email.

Thank you,
Casa Natura team
`;

export const passwordResetEmailTemplate = ({
  name,
  resetUrl,
  expiresInHours,
  overrideText,
}: PasswordResetEmailParams) => {
  const safeName = name?.trim() || 'Cliente';
  const template = overrideText?.trim() || DEFAULT_PASSWORD_RESET_TEXT;

  return renderTemplate(template, {
    name: safeName,
    resetUrl,
    expiresInHours: String(expiresInHours),
  });
};
