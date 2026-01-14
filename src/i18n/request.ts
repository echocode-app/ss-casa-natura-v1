import { getRequestConfig } from 'next-intl/server';
import { getDevLocale } from './devLocale';

import commonIt from '@/messages/common/it.json';
import commonEn from '@/messages/common/en.json';

import contattiIt from '@/messages/contatti/it.json';
import contattiEn from '@/messages/contatti/en.json';

import lineeIt from '@/messages/linee/it.json';
import lineeEn from '@/messages/linee/en.json';

import missionIt from '@/messages/mission/it.json';
import missionEn from '@/messages/mission/en.json';

import privacyIt from '@/messages/privacy/it.json';
import privacyEn from '@/messages/privacy/en.json';

import prodottiIt from '@/messages/prodotti/it.json';
import prodottiEn from '@/messages/prodotti/en.json';

import userIt from '@/messages/user/it.json';
import userEn from '@/messages/user/en.json';

import validationIt from '@/messages/validation/it.json';
import validationEn from '@/messages/validation/en.json';

import modalIt from '@/messages/modal/it.json';
import modalEn from '@/messages/modal/en.json';

import notFoundIt from '@/messages/notFound/it.json';
import notFoundEn from '@/messages/notFound/en.json';

import checkoutIt from '@/messages/checkout/it.json';
import checkoutEn from '@/messages/checkout/en.json';

export default getRequestConfig(async () => {
  const locale = getDevLocale();

  const messages =
    locale === 'en'
      ? {
          ...commonEn,
          contatti: contattiEn,
          linee: lineeEn,
          mission: missionEn,
          privacy: privacyEn,
          prodotti: prodottiEn,
          user: userEn,
          validation: validationEn,
          ...modalEn,
          notFound: notFoundEn,
          checkout: checkoutEn,
        }
      : {
          ...commonIt,
          contatti: contattiIt,
          linee: lineeIt,
          mission: missionIt,
          privacy: privacyIt,
          prodotti: prodottiIt,
          user: userIt,
          validation: validationIt,
          ...modalIt,
          notFound: notFoundIt,
          checkout: checkoutIt,
        };

  return {
    locale,
    messages,
  };
});
