import { getRequestConfig } from 'next-intl/server';
import itMessages from '../messages/it.json';
import enMessages from '../messages/en.json';

export default getRequestConfig(async ({}) => {
  const devLocale = typeof window !== 'undefined' ? localStorage.getItem('dev-locale') : null;
  const locale = devLocale === 'en' ? 'en' : 'it';

  const messages = locale === 'en' ? enMessages : itMessages;

  return {
    locale,
    messages,
  };
});
