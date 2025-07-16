'use client';

import { Button } from '@/components/ui/button';
import Google from '@/public/assets/google.svg';
import { handleGoogleSignIn } from '@/server/actions/auth';

export default function GoogleSign() {
  return (
    <form action={handleGoogleSignIn}>
      <Button
        type="submit"
        variant="ghost"
        size="login"
        className="w-full cursor-pointer flex items-center justify-center gap-2 mt-2"
      >
        <Google />
        Continue with Google
      </Button>
    </form>
  );
}
