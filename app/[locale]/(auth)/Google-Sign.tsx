'use client';

import { Button } from '@/components/ui/button';
import Google from '@/public/assets/google.svg';
import { handleGoogleSignIn } from '@/server/actions/auth';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GoogleSign() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSignup = pathname.includes('signup');
  const t = useTranslations(isSignup ? 'auth.signup' : 'auth.signin');

  const handleSubmit = async (formData: FormData) => {
    // Add callbackUrl to form data if it exists
    const callbackUrl = searchParams.get('callbackUrl');
    if (callbackUrl) {
      formData.append('callbackUrl', callbackUrl);
    }
    await handleGoogleSignIn(formData);
  };

  return (
    <form action={handleSubmit}>
      <Button
        type="submit"
        variant="ghost"
        size="login"
        className="w-full cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        <Google />
        {t('continueWithGoogle')}
      </Button>
    </form>
  );
}