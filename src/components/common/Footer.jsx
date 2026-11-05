import { useState } from "react";
import ApplyNowModal from "../apply/ApplyNowModal";
import { Mail } from "../ui/Icons";

const CURRENT_YEAR = new Date().getFullYear();

const columns = [
  ["Explore", [["Courses", "/courses"], ["Colleges", "/colleges"], ["States", "/states"], ["Study Abroad", "/study-abroad"]]],
  ["Resources", [["Blog", "/blog"], ["Scholarships", "/scholarships"], ["Services", "/services"], ["Gallery", "/gallery"]]],
  ["Company", [["About Us", "/about"], ["Contact", "/contact"], ["Registration", "/registration"], ["Apply Now"]]],
  ["Legal", [["Privacy Policy", "/privacy-policy"], ["Terms of Use", "/terms"], ["Image Credits", "/image-credits"]]],
];

export default function Footer() {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="shell grid grid-cols-1 gap-12 pt-16 pb-12 sm:pt-20 lg:grid-cols-[1.4fr_2fr] lg:gap-20">
        <div className="max-w-md">
          <a className="inline-flex items-center gap-3" href="/">
            <span className="block rounded-xl bg-white px-4 py-3"><img src="/a3-educare-logo-wide-64.webp" srcSet="/a3-educare-logo-wide-64.webp 1x, /a3-educare-logo-wide-128.webp 2x" width="205" height="64" alt="A3 EduCare Hub & Research Academy" className="h-14 w-auto" loading="lazy" decoding="async" /></span>

          </a>
          <p className="mt-5 text-sm leading-relaxed">Independent guidance on courses, colleges, and career pathways for Indian students — and students exploring study abroad.</p>
          <a href="mailto:hello@a3educarehub.in" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-gold-400">
            <Mail className="size-4" /> hello@a3educarehub.in
          </a>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map(([heading, links]) => (
            <div key={heading}>
              <strong className="text-xs font-semibold tracking-[0.16em] text-white uppercase">{heading}</strong>
              <ul className="mt-5 flex flex-col gap-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    {href
                      ? <a href={href} className="py-1.5 text-sm transition-colors duration-200 hover:text-white">{label}</a>
                      : <button type="button" aria-haspopup="dialog" onClick={() => setApplyOpen(true)} className="cursor-pointer py-1.5 text-left text-sm transition-colors duration-200 hover:text-white">{label}</button>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="shell border-t border-white/10 pt-6 pb-24 sm:pb-28">
        <p className="text-xs leading-relaxed text-ink-300">Course fees, cutoffs, rankings, and admission dates change frequently. Always confirm current details on the official college, university, or regulator website before making a decision.</p>
        <p className="mt-3 text-xs text-ink-300">© {CURRENT_YEAR} A3 EduCare Hub. All rights reserved.</p>
      </div>
      <ApplyNowModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </footer>
  );
}
