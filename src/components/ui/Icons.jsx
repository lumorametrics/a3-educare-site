function Icon({ children, className = "size-4", strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const ArrowUpRight = (props) => <Icon {...props}><path d="M7 17 17 7M8 7h9v9" /></Icon>;
export const ArrowRight = (props) => <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
export const ArrowDown = (props) => <Icon {...props}><path d="M12 5v14M6 13l6 6 6-6" /></Icon>;
export const ChevronLeft = (props) => <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>;
export const ChevronDown = (props) => <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>;
export const ChevronRight =(props) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
export const Pause = (props) => <Icon {...props}><path d="M9 5v14M15 5v14" /></Icon>;
export const Play = (props) => <Icon {...props}><path d="M7 4.5v15l12-7.5z" /></Icon>;
export const Plus = (props) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>;
export const Close = (props) => <Icon {...props}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const Search = (props) => <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
export const Check = (props) => <Icon {...props}><path d="M20 6 9 17l-5-5" /></Icon>;
export const Clock = (props) => <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const Wallet = (props) => <Icon {...props}><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M21 9h-6a3 3 0 0 0 0 6h6z" /></Icon>;
export const MapPin = (props) => <Icon {...props}><path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Icon>;
export const Graduation = (props) => <Icon {...props}><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></Icon>;
export const Building = (props) => <Icon {...props}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01" /></Icon>;
export const Globe = (props) => <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Icon>;
export const Book = (props) => <Icon {...props}><path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" /></Icon>;
export const Sparkle = (props) => <Icon {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></Icon>;
export const Shield = (props) => <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const Award = (props) => <Icon {...props}><circle cx="12" cy="8" r="6" /><path d="M8.2 13.4 7 22l5-3 5 3-1.2-8.6" /></Icon>;
export const Phone = (props) => <Icon {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></Icon>;
export const Mail = (props) => <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>;
export const Users = (props) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
export const Briefcase = (props) => <Icon {...props}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M3 13h18" /></Icon>;
export const Compass = (props) => <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></Icon>;
export const MessageCircle = (props) => <Icon {...props}><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z" /></Icon>;
export const FileText = (props) => <Icon {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></Icon>;
export const Wrench = (props) => <Icon {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" /></Icon>;
export const Rocket = (props) => <Icon {...props}><path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z" /><path d="M12 15 9 12a22 22 0 0 1 2-4 12.9 12.9 0 0 1 11-6c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z" /><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" /></Icon>;
export const Banknote = (props) => <Icon {...props}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></Icon>;
export const Target = (props) => <Icon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Icon>;
export const Eye = (props) => <Icon {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const Mic = (props) => <Icon {...props}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" /></Icon>;
export const Sprout = (props) => <Icon {...props}><path d="M7 20h10M12 20v-8" /><path d="M12 12c0-3.5-2.5-6-7-6 0 3.5 2.5 6 7 6zM12 12c0-4 2.5-7 7-7 0 4-2.5 7-7 7z" /></Icon>;
export const Cpu = (props) => <Icon {...props}><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></Icon>;
export const Scale = (props) => <Icon {...props}><path d="M12 3v18M7 21h10M5 7h14" /><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" /></Icon>;
export const Stethoscope = (props) => <Icon {...props}><path d="M5 3v6a5 5 0 0 0 10 0V3" /><path d="M10 14v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="12" r="2" /></Icon>;
export const HeartPulse = (props) => <Icon {...props}><path d="M19.5 13.6 12 21l-7.5-7.4A5 5 0 1 1 12 7a5 5 0 1 1 7.5 6.6z" /><path d="M3.5 12h5l1.5-3 3 6 1.5-3h6" /></Icon>;
export const Microscope = (props) => <Icon {...props}><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2zM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" /></Icon>;
export const Pill = (props) => <Icon {...props}><path d="m10.5 20.5 10-10a5 5 0 1 0-7-7l-10 10a5 5 0 1 0 7 7zM8.5 8.5l7 7" /></Icon>;
export const ChefHat = (props) => <Icon {...props}><path d="M6 13.9A4 4 0 0 1 7.5 6a5 5 0 0 1 9 0A4 4 0 0 1 18 13.9V20H6z" /><path d="M6 17h12" /></Icon>;
export const ListChecks = (props) => <Icon {...props}><path d="m3 7 2 2 4-4M3 17l2 2 4-4M13 6h8M13 12h8M13 18h8" /></Icon>;
export const CalendarCheck = (props) => <Icon {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></Icon>;
export const Calculator = (props) => <Icon {...props}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4" /></Icon>;
export const LifeBuoy = (props) => <Icon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m4.9 4.9 4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3" /></Icon>;
export const ScrollText = (props) => <Icon {...props}><path d="M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4" /><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" /></Icon>;
export const Landmark = (props) => <Icon {...props}><path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z" /></Icon>;
export const BarChart = (props) => <Icon {...props}><path d="M3 3v18h18" /><path d="M8 17v-5M13 17V8M18 17v-9" /></Icon>;
export const Laptop = (props) => <Icon {...props}><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20l-2-4H4z" /></Icon>;
export const Newspaper = (props) => <Icon {...props}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9h4" /><path d="M10 6h8M10 10h8M10 14h8M10 18h4" /></Icon>;
export const MapFold = (props) => <Icon {...props}><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></Icon>;
export const BadgeCheck = (props) => <Icon {...props}><path d="M12 2.5 14.6 4l3 .2.8 2.9 2.1 2.1-1 2.8 1 2.8-2.1 2.1-.8 2.9-3 .2L12 21.5 9.4 20l-3-.2-.8-2.9-2.1-2.1 1-2.8-1-2.8 2.1-2.1.8-2.9 3-.2z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const Star = (props) => <Icon {...props}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" /></Icon>;
export const Handshake = (props) => <Icon {...props}><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2" /><path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1.4 1.4 0 0 1-2-2l2.8-2.8a5.8 5.8 0 0 1 7.5-.6l.5.4a3 3 0 0 0 2 .7H21v8h-2" /><path d="M3 4h1.3a3 3 0 0 1 2 .7l.5.4M3 4v8h2l4.5 4.5a1.4 1.4 0 0 0 2-2" /></Icon>;
export const Flag = (props) => <Icon {...props}><path d="M4 22V4M4 4h12l-2 4 2 4H4" /></Icon>;
export const LinkIcon =(props) => <Icon {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Icon>;

export const ShareIcon = (props) => <Icon {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></Icon>;
export const InstagramIcon = (props) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></Icon>;

/** Filled brand marks (Simple Icons paths). */
function BrandIcon({ children, className = "size-4" }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>;
}
export const FacebookIcon = (props) => <BrandIcon {...props}><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" /></BrandIcon>;
export const XIcon = (props) => <BrandIcon {...props}><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></BrandIcon>;
export const LinkedInIcon = (props) => <BrandIcon {...props}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></BrandIcon>;
export const WhatsAppIcon = (props) => <BrandIcon {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></BrandIcon>;

export const ImageIcon =(props) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></Icon>;
