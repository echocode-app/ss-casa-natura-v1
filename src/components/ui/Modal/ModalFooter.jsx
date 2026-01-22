'use client';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { useTranslations } from 'next-intl';

export default function ModalFooter({ type = 'register', onSwitch, onForgot, loading = false }) {
  const t = useTranslations('modal.auth');
  const tCommon = useTranslations();

  return (
    <div className="flex flex-col items-center mt-4 lg:mt-8 w-full gap-4 lg:gap-5">
      {/* Submit Button */}
      <PrimaryButton
        type="submit"
        disabled={loading}
        className="min-w-[140px] lg:min-w-[220px] px-6 py-3 lg:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? tCommon('loading')
          : type === 'register'
            ? t('form.register')
            : type === 'login'
              ? t('form.login')
              : t('form.forgot')}
      </PrimaryButton>

      {/* Info / Privacy / Forgot password */}
      {type === 'register' && (
        <p className="text-center text-[clamp(12px,3vw,17px)] font-light leading-[100%]">
          {t('footer.register.text1')}{' '}
          <a href="/privacy-policy" className="font-semibold underline">
            {t('footer.register.privacy')}
          </a>
        </p>
      )}

      {type === 'login' && (
        <p
          className="text-center text-[clamp(12px,3vw,17px)] font-light leading-[100%] underline cursor-pointer"
          onClick={onForgot}
        >
          {t('footer.login.forgot')}
        </p>
      )}

      {/* Switch Auth */}
      <p className="text-center text-[clamp(12px,2vw,17px)] font-light leading-[100%]">
        {type === 'register' ? (
          <>
            {t('footer.register.text2')}{' '}
            <span
              className="font-semibold underline cursor-pointer"
              onClick={() => onSwitch('login')}
            >
              {t('footer.register.switch')}
            </span>
          </>
        ) : (
          <>
            {t('footer.login.text2')}{' '}
            <span
              className="font-semibold underline cursor-pointer"
              onClick={() => onSwitch('register')}
            >
              {t('footer.login.switch')}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
