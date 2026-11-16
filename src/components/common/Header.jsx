import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Shield } from "../ui/Icons";
import ApplyNowModal from "../apply/ApplyNowModal";
import { stripBase, withBase } from "../../lib/basePath";
import { toPlainText } from "../../lib/text";
import { getApplyFormPage, getCourseCategories, getPosts } from "../../services/wordpress";
import { NAV_SECTIONS } from "./navigation";
import { APPLY_FORM_EVENT } from "../../lib/applyForm";

// Starts the form request on hover/focus so the popup usually opens with the form already there.
const prefetchApplyForm = () => { getApplyFormPage().catch(() => {}); };

const HOVER_OPEN_MS = 60;
const HOVER_CLOSE_MS = 180;

/** A leaf link is "current" only when it points at this exact page (anchors and ?form links never are). */
const isCurrent = (href, pathname) => !/[#?]/.test(href) && (href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(href));

/* ---------------------------------------------------------------------------------------------- */
/* Feature areas of the mega panels                                                                */

function CredentialsFeature({ onNavigate }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-ink-900 p-6 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-brand-600/40 blur-3xl" />
      <div className="relative">
        <span className="grid size-10 place-items-center rounded-xl bg-gold-400 text-ink-900"><Shield className="size-5" /></span>
        <p className="mt-4 font-display text-lg font-semibold">Guiding students since 2014</p>
        <p className="mt-1.5 text-sm text-ink-200">ISO 9001:2015 certified · MSME registered · Operated by Puja Social Empowerment Foundation.</p>
      </div>
      <a href="/about" onClick={onNavigate} className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-white">
        Read our story <ArrowRight className="size-4" />
      </a>
    </div>
  );
}

function StreamsFeature({ categories, onNavigate }) {
  const popular = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 6);
  return (
    <div className="flex h-full flex-col gap-4">
      {popular.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-ink-400 uppercase">Popular streams</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {popular.map((category) => (
              <li key={category.id}>
                <a href={`/courses/${encodeURIComponent(category.slug)}`} onClick={onNavigate} className="inline-flex rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm text-ink-700 transition-colors hover:border-brand-600 hover:text-brand-700" dangerouslySetInnerHTML={{ __html: category.name }} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <a href="/contact" onClick={onNavigate} className="group relative mt-auto overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 to-brand-800 p-5 text-white">
        <p className="font-display text-base font-semibold">Not sure which path fits?</p>
        <p className="mt-1 text-sm text-brand-50/85">Talk it through with an advisor first.</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400">Book free counselling <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
      </a>
    </div>
  );
}

function PostsFeature({ posts, onNavigate }) {
  if (posts === null) {
    return <div aria-hidden="true" className="flex flex-col gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-sand-100" />)}</div>;
  }
  if (!posts.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.16em] text-ink-400 uppercase">Latest updates</p>
      <ul className="mt-2 divide-y divide-sand-200">
        {posts.slice(0, 3).map((post) => (
          <li key={post.id}>
            <a href={`/blog/${post.slug || post.id}`} onClick={onNavigate} className="group flex items-start justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="line-clamp-1 text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{toPlainText(post.title?.rendered)}</span>
                {post.date && <span className="mt-0.5 block text-xs text-ink-400">{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </span>
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-700" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PartnerFeature({ onNavigate }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gold-300 bg-gold-100 p-6">
      <div>
        <p className="font-display text-lg font-semibold text-ink-900">Grow with A3</p>
        <p className="mt-1.5 text-sm text-ink-700">Work alongside an education consultancy that has guided students and families since 2014.</p>
      </div>
      <a href="/registration" onClick={onNavigate} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-brand-700">
        All registration options <ArrowRight className="size-4" />
      </a>
    </div>
  );
}

function Feature({ section, data, onNavigate }) {
  if (section.feature === "credentials") return <CredentialsFeature onNavigate={onNavigate} />;
  if (section.feature === "streams") return <StreamsFeature categories={data.categories} onNavigate={onNavigate} />;
  if (section.feature === "posts") return <PostsFeature posts={data.posts} onNavigate={onNavigate} />;
  if (section.feature === "partner") return <PartnerFeature onNavigate={onNavigate} />;
  return null;
}

function NavItem({ item, pathname, onNavigate, compact = false }) {
  const current = isCurrent(item.href, pathname);
  const { Icon } = item;
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={`group flex items-start gap-3.5 rounded-2xl transition-colors duration-200 ${compact ? "p-2.5" : "p-3"} ${current ? "bg-brand-50" : "hover:bg-sand-50"}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${current ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white"}`}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-semibold ${current ? "text-brand-800" : "text-ink-900"}`}>{item.label}</span>
        <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-500">{item.text}</span>
      </span>
    </a>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null); // desktop mega panel
  const [expanded, setExpanded] = useState(null); // mobile accordion section
  const [data, setData] = useState({ categories: [], posts: null });
  const loaded = useRef({});
  const hoverTimer = useRef(0);
  const headerRef = useRef(null);
  const triggerRefs = useRef({});
  const menuButtonRef = useRef(null);
  const openedFromMenu = useRef(false);
  const pathname = stripBase(window.location.pathname);

  // WordPress data for the feature areas, requested once, the first time a menu that shows it opens.
  const loadFor = useCallback((key) => {
    if ((key === "study" || key === null) && !loaded.current.categories) {
      loaded.current.categories = true;
      getCourseCategories().then((categories) => setData((d) => ({ ...d, categories })), () => {});
    }
    if ((key === "resources" || key === null) && !loaded.current.posts) {
      loaded.current.posts = true;
      getPosts().then((posts) => setData((d) => ({ ...d, posts })), () => setData((d) => ({ ...d, posts: [] })));
    }
  }, []);

  const openPanel = useCallback((key) => {
    clearTimeout(hoverTimer.current);
    loadFor(key);
    setOpenKey(key);
  }, [loadFor]);
  const closePanels = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setOpenKey(null);
  }, []);

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

  // Desktop panels close on an outside click or Escape (focus returns to the trigger).
  useEffect(() => {
    if (!openKey) return undefined;
    const onPointer = (event) => { if (!headerRef.current?.contains(event.target)) closePanels(); };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      triggerRefs.current[openKey]?.focus();
      closePanels();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey, closePanels]);

  // Other components open this same Apply Now popup through openApplyForm() (lib/applyForm.js).
  useEffect(() => {
    const onOpenApply = () => {
      openedFromMenu.current = false;
      setMenuOpen(false);
      setOpenKey(null);
      setApplyOpen(true);
    };
    window.addEventListener(APPLY_FORM_EVENT, onOpenApply);
    return () => window.removeEventListener(APPLY_FORM_EVENT, onOpenApply);
  }, []);

  // Any navigation closes every menu.
  useEffect(() => {
    setOpenKey(null);
    setMenuOpen(false);
  }, [pathname]);

  const hoverOpen = (key) => (event) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => openPanel(key), openKey ? 0 : HOVER_OPEN_MS);
  };
  const hoverClose = (event) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenKey(null), HOVER_CLOSE_MS);
  };

  function closeMenu() {
    setMenuOpen(false);
    closePanels();
  }

  function toggleDrawer() {
    setMenuOpen((current) => {
      if (!current) loadFor(null);
      return !current;
    });
  }

  function openApply(fromMenu) {
    openedFromMenu.current = fromMenu;
    setMenuOpen(false);
    closePanels();
    setApplyOpen(true);
  }

  function closeApply() {
    setApplyOpen(false);
    // The drawer button that opened the popup is hidden by now, so focus returns to the menu toggle.
    if (openedFromMenu.current) menuButtonRef.current?.focus();
  }

  const solid = scrolled || menuOpen || openKey;

  return (
    <>
    <header ref={headerRef} className="sticky top-0 z-50">
      {/* The blur lives on its own layer: backdrop-filter on <header> would trap the fixed mobile drawer inside it */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          solid ? "border-sand-200/80 bg-white/90 shadow-[0_8px_30px_-20px_rgb(15_34_56/0.35)] backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      />
      <div className="shell flex h-16 items-center justify-between gap-6 sm:h-20">
        <a className="group flex shrink-0 items-center gap-2.5" href="/" onClick={closeMenu}>
          <img className="h-12 w-auto sm:h-14" src={withBase("/a3-educare-logo-wide-64.webp")} srcSet={`${withBase("/a3-educare-logo-wide-64.webp")} 1x, ${withBase("/a3-educare-logo-wide-128.webp")} 2x`} width="205" height="64" alt="A3 EduCare Hub & Research Academy" />
        </a>

        {/* Desktop navigation from 1280px; below that the drawer takes over so the row never crowds. */}
        <nav className="hidden items-center gap-0.5 xl:flex 2xl:gap-1" aria-label="Main navigation">
          {NAV_SECTIONS.map((section) => {
            const active = section.match.test(pathname);
            const underline = (on) => (
              <span aria-hidden="true" className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-600 transition-transform duration-300 ease-(--ease-out-soft) ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            );
            if (!section.columns) {
              return (
                <a key={section.key} href={section.href} aria-current={active ? "page" : undefined} onClick={closePanels}
                  className={`group relative rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${active ? "text-ink-900" : "text-ink-500 hover:text-ink-900"}`}>
                  {section.label}{underline(active)}
                </a>
              );
            }
            const isOpen = openKey === section.key;
            return (
              <button
                key={section.key}
                ref={(node) => { triggerRefs.current[section.key] = node; }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`nav-panel-${section.key}`}
                onClick={() => (isOpen ? closePanels() : openPanel(section.key))}
                onPointerEnter={hoverOpen(section.key)}
                onPointerLeave={hoverClose}
                className={`group relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${active || isOpen ? "text-ink-900" : "text-ink-500 hover:text-ink-900"}`}
              >
                {section.label}
                <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                {underline(active)}
              </button>
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
            className="relative grid size-11 place-items-center rounded-full border border-sand-200 bg-white transition hover:border-ink-300 xl:hidden"
            onClick={toggleDrawer}
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

      {/* Desktop mega panels: full container width under the header row, each with its own column layout. */}
      {NAV_SECTIONS.filter((section) => section.columns).map((section) => {
        const isOpen = openKey === section.key;
        return (
          <div
            key={section.key}
            id={`nav-panel-${section.key}`}
            inert={!isOpen}
            onPointerEnter={hoverOpen(section.key)}
            onPointerLeave={hoverClose}
            className={`absolute inset-x-0 top-full hidden pt-2 transition duration-250 ease-(--ease-out-soft) xl:block ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
          >
            <div className="shell">
              <div
                className={`grid gap-6 rounded-[1.75rem] border border-sand-200 bg-white p-6 shadow-[0_30px_60px_-30px_rgb(15_34_56/0.35)] ${section.columns.length > 1 ? "" : "mx-auto max-w-3xl"}`}
                style={{ gridTemplateColumns: `repeat(${section.columns.length}, minmax(0, 1fr)) ${section.columns.length > 1 ? "minmax(0, 0.95fr)" : "minmax(0, 1.25fr)"}` }}
              >
                {section.columns.map((column) => (
                  <div key={column.heading}>
                    <p className="px-3 text-xs font-semibold tracking-[0.16em] text-ink-400 uppercase">{column.heading}</p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {column.items.map((item) => <li key={item.href}><NavItem item={item} pathname={pathname} onNavigate={closePanels} /></li>)}
                    </ul>
                  </div>
                ))}
                <div className="border-l border-sand-200 pl-6"><Feature section={section} data={data} onNavigate={closePanels} /></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-300 sm:top-20 xl:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <nav
        id="mobile-nav"
        aria-label="Mobile navigation"
        inert={!menuOpen}
        className={`fixed inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-sand-200 bg-white px-5 pt-2 pb-8 shadow-lift transition duration-400 ease-(--ease-out-soft) sm:top-20 sm:max-h-[calc(100dvh-5rem)] sm:px-8 xl:hidden ${
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <ul className="mx-auto flex max-w-2xl flex-col">
          {NAV_SECTIONS.map((section) => {
            const active = section.match.test(pathname);
            if (!section.columns) {
              return (
                <li key={section.key}>
                  <a href={section.href} onClick={closeMenu} aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between border-b border-sand-100 py-4 font-display text-xl transition-colors ${active ? "text-brand-700" : "text-ink-900 hover:text-brand-700"}`}>
                    {section.label}
                    <ArrowUpRight className="size-5 text-ink-300" />
                  </a>
                </li>
              );
            }
            const isOpen = expanded === section.key;
            return (
              <li key={section.key} className="border-b border-sand-100">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`m-panel-${section.key}`}
                  onClick={() => setExpanded(isOpen ? null : section.key)}
                  className={`flex w-full items-center justify-between py-4 text-left font-display text-xl transition-colors ${active ? "text-brand-700" : "text-ink-900"}`}
                >
                  {section.label}
                  <span className={`grid size-8 place-items-center rounded-full border transition-[transform,background-color,border-color] duration-300 ${isOpen ? "rotate-180 border-brand-600 bg-brand-600 text-white" : "border-sand-200 text-ink-500"}`}><ChevronDown className="size-4" /></span>
                </button>
                {/* Grid-rows trick animates the accordion height smoothly without measuring. */}
                <div id={`m-panel-${section.key}`} inert={!isOpen} className={`grid transition-[grid-template-rows] duration-400 ease-(--ease-out-soft) ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <ul className="grid grid-cols-1 gap-1 pb-4 sm:grid-cols-2">
                      {section.columns.flatMap((column) => column.items).map((item) => (
                        <li key={item.href}><NavItem item={item} pathname={pathname} onNavigate={closeMenu} compact /></li>
                      ))}
                    </ul>
                    {section.feature === "posts" && <div className="pb-4"><PostsFeature posts={data.posts} onNavigate={closeMenu} /></div>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn btn-primary mx-auto mt-6 flex w-full max-w-2xl" aria-haspopup="dialog" onClick={() => openApply(true)}>
          Apply Now <ArrowUpRight />
        </button>
      </nav>
    </header>
    <ApplyNowModal open={applyOpen} onClose={closeApply} />
    </>
  );
}
