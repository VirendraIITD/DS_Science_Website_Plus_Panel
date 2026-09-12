/** Click-to-chat button (PRD §8), pinned bottom-right on every public page. */
export function WhatsAppFab({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ok text-2xl text-white shadow-pop transition hover:brightness-110"
    >
      <span aria-hidden>💬</span>
    </a>
  );
}
