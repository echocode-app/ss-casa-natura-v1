export const DEV_LOCALE_KEY = 'dev-locale';

export function getDevLocale(): 'it' | 'en' {
  if (typeof window === 'undefined') return 'it';
  return (localStorage.getItem(DEV_LOCALE_KEY) as 'it' | 'en') || 'it';
}

export function setDevLocale(locale: 'it' | 'en') {
  localStorage.setItem(DEV_LOCALE_KEY, locale);
  window.location.reload();
}
