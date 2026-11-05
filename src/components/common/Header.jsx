import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "../ui/Icons";
import ApplyNowModal from "../apply/ApplyNowModal";
import { getApplyFormPage } from "../../services/wordpress";

const menuItems = [
  { key: "courses", label: "Courses", href: "/courses", match: /^\/(courses?|course-directory)(\/|$)/ },
  { key: "colleges", label: "Colleges", href: "/colleges", match: /^\/colleges/ },
  { key: "states", label: "States", href: "/states", match: /^\/states?(\/|$)/ },
  { key: "studyAbroad", label: "Study Abroad", href: "/study-abroad", match: /^\/study-abroad/ },
  { key: "blog", label: "Blog", href: "/blog", match: /^\/blog/ },
  { key: "scholarships", label: "Scholarships", href: "/scholarships", match: /^\/scholarships(\/|$)/ },
  { key: "registration", label: "Registration", href: "/registration", match: /^\/registration(\/|$)/ },
];

// Starts the form request on hover/focus so the popup usually opens with the form already there.
const prefetchApplyForm = () => { getApplyFormPage().catch(() => {}); };

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const openedFromMenu = useRef(false);
  const pathname = window.location.pathname;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function openApply(fromMenu) {
    openedFromMenu.current = fromMenu;
    setMenuOpen(false);
    setApplyOpen(true);
  }

  function closeApply() {
    setApplyOpen(false);
    // The drawer button that opened the popup is hidden by now, so focus returns to the menu toggle.
    if (openedFromMenu.current) menuButtonRef.current?.focus();
  }

  return (
    <>
    <header className="sticky top-0 z-50">
      {/* The blur lives on its own layer: backdrop-filter on <header> would trap the fixed mobile drawer inside it */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || menuOpen ? "border-sand-200/80 bg-white/85 shadow-[0_8px_30px_-20px_rgb(15_34_56/0.35)] backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      />
      <div className="shell flex h-16 items-center justify-between gap-6 sm:h-20">
        <a className="group flex shrink-0 items-center gap-2.5" href="/" onClick={closeMenu}>
          <img className="h-12 w-auto sm:h-14" src="/a3-educare-logo-wide-64.webp" srcSet="/a3-educare-logo-wide-64.webp 1x, /a3-educare-logo-wide-128.webp 2x" width="205" height="64" alt="A3 EduCare Hub & Research Academy" />

        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {menuItems.map((item) => {
            const active = item.match?.test(pathname);
            return (
              <a
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative rounded-full px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 xl:px-4 ${
                  active ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2 -bottom-0.5 h-0.5 origin-left xl:inset-x-4 rounded-full bg-brand-600 transition-transform duration-300 ease-(--ease-out-soft) ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-dark hidden px-5 py-2.5 sm:inline-flex" aria-haspopup="dialog" onClick={() => openApply(false)} onPointerEnter={prefetchApplyForm} onFocus={prefetchApplyForm}>
            Apply Now <ArrowUpRight />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="relative grid size-11 place-items-center rounded-full border border-sand-200 bg-white transition hover:border-ink-300 lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span className={`absolute h-0.5 w-5 rounded bg-ink-900 transition duration-300 ${menuOpen ? "rotate-45" : "-translate-y-1.5"}`} />
            <span className={`absolute h-0.5 w-5 rounded bg-ink-900 transition duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`absolute h-0.5 w-5 rounded bg-ink-900 transition duration-300 ${menuOpen ? "-rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-300 sm:top-20 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <nav
        id="mobile-nav"
        aria-label="Mobile navigation"
        inert={!menuOpen}
        className={`fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-sand-200 bg-white px-5 pt-4 pb-8 shadow-lift transition duration-400 ease-(--ease-out-soft) sm:top-20 sm:px-8 lg:hidden ${
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <ul className="flex flex-col">
          {menuItems.map((item, index) => {
            const active = item.match?.test(pathname);
            return (
              <li key={item.key} style={{ transitionDelay: menuOpen ? `${index * 40}ms` : "0ms" }} className={`transition duration-400 ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
                <a
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-sand-100 py-4 font-display text-2xl transition-colors ${active ? "text-brand-700" : "text-ink-900 hover:text-brand-700"}`}
                >
                  {item.label}
                  <ArrowUpRight className="size-5 text-ink-300" />
                </a>
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn btn-primary mt-6 w-full" aria-haspopup="dialog" onClick={() => openApply(true)}>
          Apply Now <ArrowUpRight />
        </button>
      </nav>
    </header>
    <ApplyNowModal open={applyOpen} onClose={closeApply} />
    </>
  );
}
