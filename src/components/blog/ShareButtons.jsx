import { useEffect, useId, useState } from "react";
import { Close, FacebookIcon, InstagramIcon, LinkedInIcon, LinkIcon, ShareIcon, WhatsAppIcon, XIcon } from "../ui/Icons";

/** Link-based share targets. Plain URLs: no third-party scripts, nothing loads until clicked. */
function shareTargets(url, title) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { name: "Facebook", Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, hover: "hover:bg-[#1877F2]" },
    { name: "X", Icon: XIcon, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, hover: "hover:bg-black" },
    { name: "LinkedIn", Icon: LinkedInIcon, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, hover: "hover:bg-[#0A66C2]" },
    { name: "WhatsApp", Icon: WhatsAppIcon, href: `https://wa.me/?text=${t}%20${u}`, hover: "hover:bg-[#1DA851]" },
  ];
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (non-HTTPS page or blocked permission): try the legacy copy command.
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand?.("copy");
  field.remove();
  return Boolean(ok);
}

const ICON_BUTTON = "grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-[background-color,translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-transparent focus-visible:outline-offset-2 focus-visible:outline-white sm:size-11";

/**
 * "Share" button for the end of a blog post. Clicking it slides out the share icons
 * (sideways from `sm`, downwards on phones); clicking again or pressing Escape closes them.
 * Instagram has no web share URL: on phones it opens the system share sheet (which lists
 * Instagram when installed); elsewhere it copies the link and opens Instagram to paste it.
 */
export default function ShareButtons({ url, title }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(""); // message for the live region
  const panelId = useId();

  useEffect(() => {
    if (!status || status.startsWith("Copy this link")) return undefined;
    const timer = setTimeout(() => setStatus(""), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const copyLink = async () => {
    setStatus((await copyText(url)) ? "Link copied to clipboard." : `Copy this link: ${url}`);
  };

  const shareToInstagram = async () => {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return; // the visitor closed the share sheet
      }
    }
    const copied = await copyText(url);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    setStatus(copied ? "Link copied. Paste it into your Instagram story, post or message." : `Copy this link for Instagram: ${url}`);
  };

  const items = [
    ...shareTargets(url, title).map(({ name, Icon, href, hover }) => (
      <a key={name} className={`${ICON_BUTTON} ${hover}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${name} (opens in a new tab)`} title={`Share on ${name}`}>
        <Icon className="size-[1.125rem]" />
      </a>
    )),
    <button key="instagram" type="button" className={`${ICON_BUTTON} hover:bg-[linear-gradient(45deg,#f58529,#dd2a7b,#8134af)]`} onClick={shareToInstagram} aria-label="Share on Instagram" title="Share on Instagram">
      <InstagramIcon className="size-[1.125rem]" />
    </button>,
    <button key="copy" type="button" className={`${ICON_BUTTON} hover:bg-brand-600`} onClick={copyLink} aria-label="Copy link to this article" title="Copy link">
      <LinkIcon className="size-[1.125rem]" />
    </button>,
  ];

  return (
    <section
      aria-labelledby="share-heading"
      className="relative mt-12 max-w-3xl overflow-hidden rounded-2xl bg-ink-900 p-6 text-white shadow-lift sm:p-7"
      onKeyDown={(event) => { if (event.key === "Escape" && open) setOpen(false); }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="share-heading" className="text-lg font-semibold text-white">Found this helpful? Share it.</h2>
          <p className="mt-1 text-sm text-ink-200">Send this article to someone planning their next step.</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:flex-nowrap">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-medium transition-[background-color,color,box-shadow] duration-300 focus-visible:outline-offset-2 focus-visible:outline-white ${
              open ? "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15" : "bg-gold-400 text-ink-900 shadow-[0_8px_20px_-8px_var(--color-gold-500)] hover:bg-gold-300"
            }`}
          >
            <span className="relative grid size-4 place-items-center">
              <ShareIcon className={`absolute size-4 transition duration-300 ${open ? "scale-50 rotate-90 opacity-0" : "opacity-100"}`} />
              <Close className={`absolute size-4 transition duration-300 ${open ? "opacity-100" : "scale-50 -rotate-90 opacity-0"}`} />
            </span>
            {open ? "Close" : "Share"}
          </button>

          {/* Collapsible icon row: grows downwards on phones, sideways from `sm`. */}
          <div
            id={panelId}
            inert={!open}
            className={`grid basis-full transition-[grid-template-rows,grid-template-columns] duration-500 ease-(--ease-out-soft) sm:basis-auto ${
              open ? "grid-rows-[1fr] sm:grid-cols-[1fr]" : "grid-rows-[0fr] sm:grid-cols-[0fr] sm:grid-rows-[1fr]"
            }`}
          >
            <div className="overflow-hidden">
              <ul aria-label="Share options" className="flex flex-wrap gap-2 py-1 sm:gap-2.5 sm:flex-nowrap sm:pr-1 sm:pl-0.5">
                {items.map((item, index) => (
                  <li
                    key={item.key}
                    style={{ transitionDelay: open ? `${index * 45}ms` : "0ms" }}
                    className={`transition-[opacity,translate,scale] duration-300 ease-(--ease-out-soft) ${open ? "translate-x-0 scale-100 opacity-100" : "-translate-x-2 scale-75 opacity-0"}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p aria-live="polite" className="relative mt-3 text-sm empty:mt-0 break-all text-brand-300 sm:text-right">{status}</p>
    </section>
  );
}
