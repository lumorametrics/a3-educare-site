import { useState } from "react";
import ApplyNowModal from "../apply/ApplyNowModal";
import { withBase } from "../../lib/basePath";
import { EMAIL, PHONE_DISPLAY, PHONE_HREF, SOCIAL_URLS, whatsappChatUrl } from "../../lib/contact";
import { FacebookIcon, InstagramIcon, LinkedInIcon, Mail, Phone, WhatsAppIcon, XIcon } from "../ui/Icons";

const CURRENT_YEAR = new Date().getFullYear();

const columns = [
  ["Explore", [["Courses", "/courses"], ["Colleges", "/colleges"], ["States", "/states"], ["Study Abroad", "/study-abroad"]]],
  ["Resources", [["Blog", "/blog"], ["Scholarships", "/scholarships"], ["Services", "/services"], ["Gallery", "/gallery"]]],
  ["Company", [["About Us", "/about"], ["Contact", "/contact"], ["Registration", "/registration"], ["Apply Now"]]],
];

const legalLinks = [["Privacy Policy", "/privacy-policy"], ["Terms of Use", "/terms"]];

/** Social profiles come from SOCIAL_URLS in lib/contact.js; WhatsApp always works from the shared number. */
const socials = [
  ["Facebook", SOCIAL_URLS.facebook, FacebookIcon],
  ["Instagram", SOCIAL_URLS.instagram, InstagramIcon],
  ["LinkedIn", SOCIAL_URLS.linkedin, LinkedInIcon],
  ["X (Twitter)", SOCIAL_URLS.x, XIcon],
  ["WhatsApp", whatsappChatUrl(), WhatsAppIcon],
].filter(([, href]) => Boolean(href));

const iconButton = "grid size-10 place-items-center rounded-full border border-white/15 text-ink-200 transition-[translate,background-color,border-color,color] duration-300 ease-(--ease-out-soft) hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950 focus-visible:-translate-y-0.5";

export default function Footer() {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <footer className="relative bg-ink-900 text-ink-300">
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-brand-600 via-gold-400 to-brand-600" />

      <div className="shell grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 pt-14 pb-12 sm:grid-cols-3 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16 lg:grid-cols-[1.5fr_repeat(3,0.8fr)_1.3fr] lg:gap-x-12">
        <div className="col-span-2 max-w-sm sm:col-span-3 lg:col-span-1">
          <a className="inline-flex items-center gap-3" href="/">
            <span className="block rounded-xl bg-white px-4 py-2.5 shadow-card"><img src={withBase("/a3-educare-logo-wide-64.webp")} srcSet={`${withBase("/a3-educare-logo-wide-64.webp")} 1x, ${withBase("/a3-educare-logo-wide-128.webp")} 2x`} width="205" height="64" alt="A3 EduCare Hub & Research Academy" className="h-12 w-auto" loading="lazy" decoding="async" /></span>
          </a>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">Independent guidance on courses, colleges, and career pathways for Indian students — and students exploring study abroad.</p>
          <ul className="mt-5 flex flex-wrap gap-2.5" aria-label="Follow us">
            {socials.map(([label, href, Icon]) => (
              <li key={label}>
                <a href={href} {...(href === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" })} aria-label={label} title={label} className={iconButton}>
                  <Icon className="size-[1.125rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {columns.map(([heading, links]) => (
          <div key={heading}>
            <strong className="block text-sm font-semibold tracking-wide text-white">{heading}<span aria-hidden="true" className="mt-2 block h-0.5 w-6 rounded-full bg-gold-400" /></strong>
            <ul className="mt-4 flex flex-col gap-0.5">
              {links.map(([label, href]) => (
                <li key={label}>
                  {href
                    ? <a href={href} className="inline-block py-1.5 text-sm whitespace-nowrap text-ink-300 transition-colors duration-200 hover:text-gold-400">{label}</a>
                    : <button type="button" aria-haspopup="dialog" onClick={() => setApplyOpen(true)} className="cursor-pointer py-1.5 text-left text-sm text-ink-300 transition-colors duration-200 hover:text-gold-400">{label}</button>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <strong className="block text-sm font-semibold tracking-wide text-white">Get in touch<span aria-hidden="true" className="mt-2 block h-0.5 w-6 rounded-full bg-gold-400" /></strong>
          <ul className="mt-4 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:gap-x-10 lg:flex-col lg:gap-x-0">
            <li>
              <a href={`mailto:${EMAIL}`} className="group flex items-center gap-3 text-sm text-ink-200 transition-colors hover:text-gold-400">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600/25 text-brand-300 transition-colors group-hover:bg-gold-400 group-hover:text-ink-950"><Mail className="size-4" /></span>
                <span className="min-w-0 break-words">{EMAIL}</span>
              </a>
            </li>
            <li>
              <a href={PHONE_HREF} className="group flex items-center gap-3 text-sm text-ink-200 transition-colors hover:text-gold-400">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600/25 text-brand-300 transition-colors group-hover:bg-gold-400 group-hover:text-ink-950"><Phone className="size-4" /></span>
                <span>{PHONE_DISPLAY}</span>
              </a>
            </li>
            <li>
              <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-sm text-ink-200 transition-colors hover:text-gold-400">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600/25 text-brand-300 transition-colors group-hover:bg-gold-400 group-hover:text-ink-950"><WhatsAppIcon className="size-4" /></span>
                <span>Chat on WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-ink-950">
        <div className="shell flex flex-col items-center gap-3 py-3 pb-16 text-center text-sm sm:pb-3 lg:flex-row lg:justify-between lg:gap-6 lg:text-left">
          <p className="text-ink-300">© {CURRENT_YEAR} A3 EduCare Hub. All Rights Reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-0">
            {legalLinks.map(([label, href]) => <a key={label} href={href} className="py-1 text-ink-200 transition-colors duration-200 hover:text-gold-400">{label}</a>)}
          </nav>
          <p className="text-ink-300">Designed &amp; Developed by <strong className="font-semibold text-gold-400">Lumora Metrics</strong></p>
        </div>
      </div>
      <ApplyNowModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </footer>
  );
}
