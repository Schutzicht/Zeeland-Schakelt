// Datalaag voor de demo. Seed-data komt uit de code; nieuwe inzendingen
// worden in localStorage bewaard. Alle UI praat uitsluitend met deze functies,
// zodat de opslag later vervangen kan worden door een echte database
// (bijv. Supabase) zonder dat de pagina's aangepast hoeven te worden.

import { SEED_LISTINGS } from '../data/listings';
import { coordsForTown } from '../data/towns';
import type { Listing, ListingStatus, NewListingInput } from './types';
import { uid } from './util';

const KEY = 'zs_submissions_v1';
export const STORE_EVENT = 'zs:store-changed';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readSubmissions(): Listing[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Listing[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubmissions(list: Listing[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

/** Alleen de via het platform aangemelde records (alle statussen). */
export function getSubmissions(): Listing[] {
  return readSubmissions();
}

/** Seed + inzendingen samen, alle statussen. */
export function allListings(): Listing[] {
  return [...SEED_LISTINGS, ...readSubmissions()];
}

/** Wat publiek zichtbaar is: alleen goedgekeurd. */
export function publicListings(): Listing[] {
  return allListings().filter((l) => l.status === 'goedgekeurd');
}

export function getListing(id: string): Listing | undefined {
  return allListings().find((l) => l.id === id);
}

export function addListing(input: NewListingInput): Listing {
  const subs = readSubmissions();
  const { lat, lng, region } = coordsForTown(input.town, input.title + input.provider);
  const listing: Listing = {
    ...input,
    id: uid(),
    lat,
    lng,
    region,
    free: input.priceValue === 0,
    status: 'wachtrij',
    submittedAt: new Date().toISOString(),
    userSubmitted: true,
  };
  subs.push(listing);
  writeSubmissions(subs);
  return listing;
}

export function setStatus(id: string, status: ListingStatus): void {
  const subs = readSubmissions();
  const idx = subs.findIndex((l) => l.id === id);
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], status };
    writeSubmissions(subs);
  }
}

export function deleteListing(id: string): void {
  writeSubmissions(readSubmissions().filter((l) => l.id !== id));
}

export function resetDemo(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export interface StoreCounts {
  wachtrij: number;
  goedgekeurd: number;
  afgewezen: number;
  publiekTotaal: number;
}

export function counts(): StoreCounts {
  const subs = readSubmissions();
  return {
    wachtrij: subs.filter((s) => s.status === 'wachtrij').length,
    goedgekeurd: subs.filter((s) => s.status === 'goedgekeurd').length,
    afgewezen: subs.filter((s) => s.status === 'afgewezen').length,
    publiekTotaal: publicListings().length,
  };
}

export function onStoreChange(fn: () => void): void {
  if (typeof window === 'undefined') return;
  window.addEventListener(STORE_EVENT, fn);
  // ook over tabs/vensters heen
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) fn();
  });
}
