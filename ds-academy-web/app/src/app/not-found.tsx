import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="text-center">
        <p className="text-[64px] font-extrabold leading-none text-navy/15">404</p>
        <h1 className="mt-2 text-[22px] font-bold text-navy">This page does not exist</h1>
        <p className="mt-2 text-[14px] text-mut">
          The link may be old, or the page may have been renamed.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn px-5 py-2.5">
            Go to the home page
          </Link>
          <Link href="/contact" className="btn btn-ghost px-5 py-2.5">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
