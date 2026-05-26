export const Icon = {
  Home: (p = {}) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z"/>
    </svg>
  ),
  Shop: (p = {}) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h14l-1 13H6L5 7z"/>
      <path d="M9 7V5a3 3 0 016 0v2"/>
    </svg>
  ),
  Card: (p = {}) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2.5"/>
      <path d="M3 11h18"/>
      <path d="M7 16h3"/>
    </svg>
  ),
  User: (p = {}) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.5"/>
      <path d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"/>
    </svg>
  ),
  Search: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
    </svg>
  ),
  Bell: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16V11a6 6 0 1112 0v5l1.5 2H4.5L6 16z"/>
      <path d="M10 20a2 2 0 004 0"/>
    </svg>
  ),
  Cart: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.5 12.5a2 2 0 002 1.5h8.5a2 2 0 002-1.5L21 8H6"/>
      <circle cx="9" cy="21" r="1.2"/><circle cx="18" cy="21" r="1.2"/>
    </svg>
  ),
  Camera: (p = {}) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h3l2-3h8l2 3h3v11H3V8z"/>
      <circle cx="12" cy="13" r="3.5"/>
    </svg>
  ),
  Droplet: (p = {}) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 7 6 12a6 6 0 01-12 0c0-5 6-12 6-12z"/>
    </svg>
  ),
  Sun: (p = {}) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.5"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/>
    </svg>
  ),
  Thermo: (p = {}) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/>
    </svg>
  ),
  Sparkle: (p = {}) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9L12 3zM19 15l.7 1.7L21 17l-1.3.3L19 19l-.7-1.7L17 17l1.3-.3L19 15z"/>
    </svg>
  ),
  Play: (p = {}) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l12 7-12 7V5z"/></svg>
  ),
  Plus: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.8} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  Chevron: (p = {}) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
  ),
  ArrowLeft: (p = {}) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
  ),
  Heart: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill={p.fill||'none'} stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>
    </svg>
  ),
  Settings: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19 12a7 7 0 00-.15-1.4l2-1.5-2-3.4-2.3.8a7 7 0 00-2.4-1.4L13.7 3h-3.4l-.45 2.1a7 7 0 00-2.4 1.4l-2.3-.8-2 3.4 2 1.5A7 7 0 005 12c0 .5.05.95.15 1.4l-2 1.5 2 3.4 2.3-.8a7 7 0 002.4 1.4L10.3 21h3.4l.45-2.1a7 7 0 002.4-1.4l2.3.8 2-3.4-2-1.5c.1-.45.15-.9.15-1.4z"/>
    </svg>
  ),
  Share: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/>
      <path d="M8.5 11l7-4M8.5 13l7 4"/>
    </svg>
  ),
  Leaf: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14-1 0-1-1-1-1z"/><path d="M5 19L14 10"/>
    </svg>
  ),
  Ticket: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9V7h16v2a2 2 0 100 4v4H4v-4a2 2 0 100-4z"/><path d="M10 7v10" strokeDasharray="1.5 2.5"/>
    </svg>
  ),
  QR: (p = {}) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.weight||1.5}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="16" y="16" width="3" height="3"/><rect x="14" y="14" width="2" height="2"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/>
    </svg>
  ),
};

export function SelvaLeaf({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3.2 C 9.2 5.6, 7.8 8.8, 7.8 12.4 L 12 13 L 16.2 12.4 C 16.2 8.8, 14.8 5.6, 12 3.2 Z" fill={color}/>
      <path d="M12 13 L 12 21" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22 12.2c0-.7-.07-1.4-.18-2H12v3.8h5.6a4.8 4.8 0 01-2.07 3.13v2.6h3.34C20.85 17.9 22 15.3 22 12.2z"/>
      <path fill="#34A853" d="M12 22c2.8 0 5.16-.93 6.87-2.5L15.53 17a6 6 0 01-9-3.16H3.06v2.66A10 10 0 0012 22z"/>
      <path fill="#FBBC04" d="M6.53 13.84A6 6 0 016.2 12c0-.64.12-1.26.33-1.84V7.5H3.06A10 10 0 002 12c0 1.6.38 3.13 1.06 4.5l3.47-2.66z"/>
      <path fill="#EA4335" d="M12 6.4c1.52 0 2.88.52 3.96 1.54l2.96-2.96A10 10 0 003.06 7.5l3.47 2.66A6 6 0 0112 6.4z"/>
    </svg>
  );
}

export function AppleA() {
  return (
    <svg width="14" height="16" viewBox="0 0 24 24" fill="#1A1A1A">
      <path d="M17.05 12.5c0-3 2.45-4.4 2.55-4.5-1.4-2-3.55-2.3-4.3-2.3-1.85-.2-3.6 1.1-4.55 1.1s-2.4-1.05-3.95-1.05c-2 .05-3.9 1.2-4.95 3-2.1 3.65-.55 9 1.5 12 1 1.45 2.2 3.1 3.75 3.05 1.5-.05 2.05-.95 3.85-.95s2.3.95 3.9.95c1.6-.05 2.6-1.5 3.55-2.95 1.1-1.7 1.55-3.35 1.6-3.45-.05 0-3-.95-3-3.9zM14 4.05c.8-.95 1.35-2.3 1.2-3.65-1.15.05-2.55.75-3.4 1.7-.75.85-1.4 2.2-1.25 3.5 1.3.1 2.6-.6 3.45-1.55z"/>
    </svg>
  );
}
