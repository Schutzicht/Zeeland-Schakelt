import type { CategoryId } from '../lib/types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  short: string;
  /** community-kanaal waar deze categorie bij hoort */
  channel: 'Werken' | 'Overnachten' | 'Carpoolen';
  /** kleurpaar voor kaart-pin en kaartje (achtergrond / tekst) */
  color: string;
  tint: string;
  icon: string; // sleutel in icons.ts
  image: string; // categorie-fallbackbeeld
  blurb: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'werkplek',
    label: 'Werkplek & flexplek',
    short: 'Werkplek',
    channel: 'Werken',
    color: '#155f9c',
    tint: '#eaf4fb',
    icon: 'desk',
    image: '/images/zeeland-schakelt/generated/cat-werkplek.png',
    blurb: 'Flexplekken en kantoren dicht bij huis.',
  },
  {
    id: 'vergaderruimte',
    label: 'Vergader- & projectruimte',
    short: 'Vergaderen',
    channel: 'Werken',
    color: '#0c9290',
    tint: '#e2f6f4',
    icon: 'meeting',
    image: '/images/zeeland-schakelt/generated/cat-vergaderruimte.png',
    blurb: 'Ruimtes om samen te werken of af te spreken.',
  },
  {
    id: 'carpool',
    label: 'Carpool & mobiliteit',
    short: 'Mobiliteit',
    channel: 'Carpoolen',
    color: '#e9522f',
    tint: '#fdeee8',
    icon: 'car',
    image: '/images/zeeland-schakelt/generated/cat-carpool.png',
    blurb: 'Reis slim samen: carpool, shuttle en veer.',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>;

export const AMENITIES: string[] = [
  'Wifi',
  'Koffie & thee',
  'Gratis parkeren',
  'OV op loopafstand',
  'Vergaderruimte',
  'Stilteplek',
  'Keuken',
  'Rolstoeltoegankelijk',
  'Lockers',
  'Buiten werken',
  'Avond toegankelijk',
  'Kinderopvang nabij',
];

export const REGION_LABEL: Record<'noord' | 'zuid', string> = {
  noord: 'Walcheren / Bevelanden',
  zuid: 'Zeeuws-Vlaanderen',
};
