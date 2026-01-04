export const DEV_LOCALE_KEY = 'dev-locale';

export function getDevLocale(): 'it' | 'en' {
  return process.env.NEXT_PUBLIC_DEV_LOCALE === 'en' ? 'en' : 'it';
}

export function setDevLocale(locale: 'it' | 'en') {
  localStorage.setItem(DEV_LOCALE_KEY, locale);
  window.location.reload();
}
