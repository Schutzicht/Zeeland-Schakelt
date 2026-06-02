#!/usr/bin/env node
/**
 * Genereert src/lib/icons.ts uit Phosphor Icons.
 * duotone = merk/feature/categorie-iconen, bold = UI, fill = badges.
 * Draaien: node scripts/gen-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'node_modules', '@phosphor-icons', 'core', 'assets');

// myName -> [phosphor-basename, weight]
const MAP = {
  // duotone — merk / feature / categorie
  desk: ['laptop', 'duotone'],
  meeting: ['users-three', 'duotone'],
  bed: ['bed', 'duotone'],
  car: ['car', 'duotone'],
  checkCircle: ['check-circle', 'duotone'],
  clock: ['clock', 'duotone'],
  sparkle: ['sparkle', 'duotone'],
  route: ['path', 'duotone'],
  building: ['buildings', 'duotone'],
  calendar: ['calendar-dots', 'duotone'],
  users: ['users-three', 'duotone'],
  waves: ['waves', 'duotone'],
  hand: ['handshake', 'duotone'],
  shieldCheck: ['shield-check', 'duotone'],
  coffee: ['coffee', 'duotone'],
  info: ['info', 'duotone'],
  wifi: ['wifi-high', 'duotone'],
  // bold — UI
  map: ['map-trifold', 'bold'],
  list: ['list-bullets', 'bold'],
  search: ['magnifying-glass', 'bold'],
  filter: ['funnel', 'bold'],
  location: ['map-pin', 'bold'],
  check: ['check', 'bold'],
  arrowRight: ['arrow-right', 'bold'],
  arrowLeft: ['arrow-left', 'bold'],
  whatsapp: ['whatsapp-logo', 'bold'],
  euro: ['currency-eur', 'bold'],
  plus: ['plus', 'bold'],
  shield: ['shield', 'bold'],
  menu: ['list', 'bold'],
  close: ['x', 'bold'],
  chevronDown: ['caret-down', 'bold'],
  external: ['arrow-square-out', 'bold'],
  mail: ['envelope-simple', 'bold'],
  phone: ['phone', 'bold'],
  trash: ['trash', 'bold'],
  refresh: ['arrow-clockwise', 'bold'],
  star: ['star', 'fill'],
};

const icons = {};
const missing = [];
for (const [name, [base, weight]] of Object.entries(MAP)) {
  const file = path.join(ASSETS, weight, `${base}-${weight}.svg`);
  if (!fs.existsSync(file)) {
    missing.push(`${name} -> ${weight}/${base}-${weight}.svg`);
    continue;
  }
  let svg = fs.readFileSync(file, 'utf8');
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/\s+fill="#[0-9a-fA-F]+"/g, '')
    .trim();
  icons[name] = inner;
}

if (missing.length) {
  console.error('\x1b[31mONTBREKENDE iconen:\x1b[0m');
  missing.forEach((m) => console.error('  ' + m));
}

const out = `// AUTO-GEGENEREERD uit Phosphor Icons via scripts/gen-icons.mjs — niet handmatig editen.
// duotone = merk/feature/categorie, bold = UI, fill = badges. 256x256 viewBox, fill=currentColor.

export const ICONS: Record<string, string> = ${JSON.stringify(icons, null, 2)};

interface IconOpts {
  size?: number;
  cls?: string;
  stroke?: number;
}

/** Volledige <svg>-string (voor client-side templates). */
export function icon(name: string, opts: IconOpts = {}): string {
  const { size = 24, cls = '' } = opts;
  const inner = ICONS[name] ?? '';
  return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 256 256" fill="currentColor" class="\${cls}" aria-hidden="true">\${inner}</svg>\`;
}
`;

fs.writeFileSync(path.join(ROOT, 'src', 'lib', 'icons.ts'), out);
console.log(`\x1b[32mGeschreven:\x1b[0m src/lib/icons.ts (${Object.keys(icons).length} iconen, ${missing.length} ontbrekend)`);
