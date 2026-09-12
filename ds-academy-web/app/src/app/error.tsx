'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <div className="text-4xl">⚠️</div>
        <h1 className="mt-3 text-[20px] font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 text-[14px] leading-6 text-mut">
          The page could not be loaded. Try again — if it keeps happening, please call the office.
        </p>

        <button onClick={reset} className="btn mt-6 px-5 py-2.5">
          Try again
        </button>

        {error.digest ? (
          <p className="mt-4 text-[11.5px] text-mut/70">Reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
