import { z } from 'zod';

/**
 * Common passwords list (top 100 most common)
 * In production, use a larger list or external service
 */
const COMMON_PASSWORDS = new Set([
  '123456',
  'password',
  '12345678',
  'qwerty',
  '123456789',
  '12345',
  '1234',
  '111111',
  '1234567',
  'dragon',
  '123123',
  'baseball',
  'abc123',
  'football',
  'monkey',
  'letmein',
  '696969',
  'shadow',
  'master',
  '666666',
  'qwertyuiop',
  '123321',
  'mustang',
  '1234567890',
  'michael',
  '654321',
  'pussy',
  'superman',
  '1qaz2wsx',
  '7777777',
  'fuckyou',
  '121212',
  '000000',
  'qazwsx',
  '123qwe',
  'killer',
  'trustno1',
  'jordan',
  'jennifer',
  'zxcvbnm',
  'asdfgh',
  'hunter',
  'buster',
  'soccer',
  'harley',
  'batman',
  'andrew',
  'tigger',
  'sunshine',
  'iloveyou',
  'fuckme',
  '2000',
  'charlie',
  'robert',
  'thomas',
  'hockey',
  'ranger',
  'daniel',
  'starwars',
  'klaster',
  '112233',
  'george',
  'asshole',
  'computer',
  'michelle',
  'jessica',
  'pepper',
  '1111',
  'zxcvbn',
  '555555',
  '11111111',
  '131313',
  'freedom',
  '777777',
  'pass',
  'fuck',
  'maggie',
  '159753',
  'aaaaaa',
  'ginger',
  'princess',
  'joshua',
  'cheese',
  'amanda',
  'summer',
  'love',
  'ashley',
  '6969',
  'nicole',
  'chelsea',
  'biteme',
  'matthew',
  'access',
  'yankees',
  '987654321',
  'dallas',
  'austin',
  'thunder',
  'taylor',
  'matrix',
]);

/**
 * Enhanced password validation schema
 * Returns localization keys instead of hardcoded messages
 * Use with getTranslations('validation') in API routes
 */
export const createStrongPasswordSchema = () =>
  z
    .string()
    .min(12, 'passwordMinLength12')
    .max(128, 'passwordMaxLength')
    .regex(/[A-Z]/, 'passwordUppercase')
    .regex(/[a-z]/, 'passwordLowercase')
    .regex(/[0-9]/, 'passwordNumber')
    .regex(/[^A-Za-z0-9]/, 'passwordSpecialChar')
    .refine((pwd) => !COMMON_PASSWORDS.has(pwd.toLowerCase()), {
      message: 'passwordTooCommon',
    })
    .refine((pwd) => !/(.)\1{2,}/.test(pwd), {
      message: 'passwordRepeatingChars',
    })
    .refine(
      (pwd) => {
        const sequences = ['abc', '123', 'qwe', 'xyz'];
        const lowerPwd = pwd.toLowerCase();
        return !sequences.some((seq) => lowerPwd.includes(seq));
      },
      {
        message: 'passwordSequential',
      },
    );

/**
 * Standard password schema (for backward compatibility)
 * Used in registration
 */
export const createPasswordSchema = () =>
  z
    .string()
    .min(8, 'passwordMinLength')
    .max(128, 'passwordMaxLength')
    .regex(/[A-Z]/, 'passwordUppercase')
    .regex(/[a-z]/, 'passwordLowercase')
    .regex(/[0-9]/, 'passwordNumber')
    .refine((pwd) => !COMMON_PASSWORDS.has(pwd.toLowerCase()), {
      message: 'passwordTooCommon',
    });

/**
 * Validate password doesn't contain user info
 * Returns localization key
 */
export function validatePasswordAgainstUserInfo(
  password: string,
  userInfo: { email?: string; name?: string; surname?: string },
): { valid: boolean; messageKey?: string } {
  const lowerPwd = password.toLowerCase();

  if (userInfo.email) {
    const emailParts = userInfo.email.toLowerCase().split('@')[0];
    if (emailParts && lowerPwd.includes(emailParts)) {
      return {
        valid: false,
        messageKey: 'passwordContainsEmail',
      };
    }
  }

  if (userInfo.name && lowerPwd.includes(userInfo.name.toLowerCase())) {
    return {
      valid: false,
      messageKey: 'passwordContainsName',
    };
  }

  if (userInfo.surname && lowerPwd.includes(userInfo.surname.toLowerCase())) {
    return {
      valid: false,
      messageKey: 'passwordContainsSurname',
    };
  }

  return { valid: true };
}

/**
 * Calculate password strength score (0-4)
 * Returns localization keys for feedback
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedbackKeys: string[];
} {
  let score = 0;
  const feedbackKeys: string[] = [];

  if (password.length >= 12) score++;
  else feedbackKeys.push('passwordMinLength12');

  if (password.length >= 16) score++;

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  else feedbackKeys.push('passwordUppercase');

  if (/[0-9]/.test(password)) score++;
  else feedbackKeys.push('passwordNumber');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedbackKeys.push('passwordSpecialChar');

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    score = Math.max(0, score - 2);
    feedbackKeys.push('passwordTooCommon');
  }

  return {
    score: Math.min(4, score),
    feedbackKeys,
  };
}
