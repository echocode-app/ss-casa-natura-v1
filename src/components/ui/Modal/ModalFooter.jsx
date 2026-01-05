'use client';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { useTranslations } from 'next-intl';

export default function ModalFooter({ type = 'register', onSubmit, onSwitch, onForgot }) {
  const t = useTranslations('modal.auth');

  return (
    <div className="flex flex-col items-center mt-6 w-full gap-4">
      {/* Submit Button */}
      <PrimaryButton
        type="submit"
        onClick={onSubmit}
        className="w-full lg:w-[clamp(280px,90%,620px)] py-4"
      >
        {type === 'register' ? t('form.register') : t('form.login')}
      </PrimaryButton>

      {/* Info / Privacy / Forgot password */}
      {type === 'register' ? (
        <p className="text-center text-[17px] font-light leading-[100%] mt-2">
          {t('footer.register.text1')}{' '}
          <span className="font-semibold cursor-pointer">{t('footer.register.privacy')}</span>
        </p>
      ) : (
        <p
          className="text-center text-[17px] font-light leading-[100%] mt-2 underline cursor-pointer"
          onClick={onForgot}
        >
          {t('footer.login.forgot')}
        </p>
      )}

      {/* Switch Auth */}
      <p className="text-center text-[17px] font-light leading-[100%] mt-2">
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
