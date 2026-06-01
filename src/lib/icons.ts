// Inline SVG-iconen (line-stijl, 24x24). Bewust geen emoji's.
// De waarde is de binnenkant van de <svg>; consumers (Icon.astro en de
// client-renderers) wikkelen er een <svg> omheen via icon().

export const ICONS: Record<string, string> = {
  desk: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/>',
  meeting:
    '<path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3"/><path d="M22 19v-1a4 4 0 0 0-3-3.87"/><path d="M16 4.1a4 4 0 0 1 0 6.8"/>',
  bed: '<path d="M3 18V6"/><path d="M3 11h13a4 4 0 0 1 4 4v3"/><path d="M3 15h18"/><circle cx="7.5" cy="8.5" r="1.6"/>',
  car: '<path d="M5 13l1.6-4.3A2 2 0 0 1 8.5 7.4h7a2 2 0 0 1 1.9 1.3L19 13"/><path d="M4 13h16v4h-2.2"/><path d="M6.2 17H4v-4"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/>',
  map: '<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  filter: '<path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/>',
  location: '<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.4 12 2.5 2.5 4.7-4.9"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  whatsapp:
    '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.6 8.7c.15-.4.32-.4.5-.4l.45.01c.15 0 .35-.02.53.42l.65 1.6c.06.15.1.32-.01.5l-.4.55c-.1.13-.2.27-.05.5.45.74 1.05 1.3 1.75 1.72.23.13.37.11.5-.03l.55-.6c.13-.14.27-.1.45-.04l1.55.74c.18.09.3.13.34.2.05.36-.02.86-.27 1.18-.32.32-.86.5-1.45.4-1.6-.3-3.05-1.05-4.2-2.2-.85-.95-1.45-2.05-1.7-3.15-.06-.4.02-.78.21-1.07Z" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  euro: '<path d="M17.5 6.5A6 6 0 1 0 17.5 17.5"/><path d="M5 10.5h8"/><path d="M5 13.5h8"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/>',
  coffee: '<path d="M5 8h12v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M8 3.5v1.5"/><path d="M12 3.5v1.5"/>',
  parking: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  shield: '<path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6l7-3Z"/>',
  shieldCheck:
    '<path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6l7-3Z"/><path d="m9 11.5 2 2 4-4"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  sparkle: '<path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3Z"/>',
  route:
    '<circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 19H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6h.01"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  phone:
    '<path d="M6 3.5h3l1.6 4-2 1.4a11 11 0 0 0 4.5 4.5l1.4-2 4 1.6V18a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4 5.5a2 2 0 0 1 2-2Z"/>',
  building:
    '<path d="M4 21V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15"/><path d="M15 11h4a1 1 0 0 1 1 1v9"/><path d="M8 8h.01M11.5 8h.01M8 12h.01M11.5 12h.01M8 16h.01M11.5 16h.01"/><path d="M3 21h18"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  users: '<path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3"/><path d="M22 19v-1a4 4 0 0 0-3-3.87"/><path d="M16 4.1a4 4 0 0 1 0 6.8"/>',
  waves: '<path d="M2 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v4h-4"/>',
  hand: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M15 11V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.2-3l-2.1-3.6a1.5 1.5 0 0 1 2.5-1.6L9 12"/>',
  star: '<path d="M12 3.5l2.5 5 5.5.8-4 3.9 1 5.5-4.9-2.6L7.7 21.7l1-5.5-4-3.9 5.5-.8Z"/>',
};

interface IconOpts {
  size?: number;
  cls?: string;
  stroke?: number;
}

/** Geef een volledige <svg>-string terug (voor gebruik in client-side templates). */
export function icon(name: string, opts: IconOpts = {}): string {
  const { size = 24, cls = '', stroke = 1.7 } = opts;
  const inner = ICONS[name] ?? '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${inner}</svg>`;
}
