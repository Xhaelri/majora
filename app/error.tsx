'use client';

import { useTranslations } from 'next-intl';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations('Error');

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-3xl font-bold">{t('title') || "Something went wrong."}</h1>
      <p className="text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
      >
        {t('retry') || "Try Again"}
      </button>
    </div>
  );
}
