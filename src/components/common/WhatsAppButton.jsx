import { WhatsAppIcon } from "../ui/Icons";
import { whatsappChatUrl } from "../../lib/contact";

/**
 * Floating "Chat on WhatsApp" button, bottom-left on every page (the back-to-top button
 * is bottom-right). It opens a chat with the pre-filled message from lib/contact.js.
 * z-40 keeps it under the header's mobile menu (z-50) and the gallery lightbox (z-60).
 */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappChatUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-40 block rounded-full motion-safe:animate-fade-up motion-safe:[animation-delay:800ms] sm:bottom-6 sm:left-6"
    >
      <span className="grid size-14 place-items-center rounded-full bg-[#1DA851] text-white shadow-[0_10px_28px_-8px_rgb(29_168_81/0.7)] ring-4 ring-white/70 transition-[background-color,translate,scale] duration-300 ease-(--ease-out-soft) group-hover:-translate-y-0.5 group-hover:bg-[#168C42] group-active:scale-95">
        <WhatsAppIcon className="size-7" />
      </span>
      {/* Label on hover/focus for mouse and keyboard users; touch devices get the icon only. Positioned
          absolutely so the link's clickable area stays the round button, not the invisible label. */}
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-full ml-3 hidden -translate-x-2 -translate-y-1/2 rounded-full bg-ink-900 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lift transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
