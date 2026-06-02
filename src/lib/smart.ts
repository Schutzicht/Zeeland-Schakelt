// Slimme rekenhelpers voor Schakelplan, dashboard en slim zoeken.
// Bewust deterministisch (geen Date.now/random in de kern) zodat de
// resultaten stabiel zijn; "live" jitter doen we apart in de UI.

import type { Listing } from './types';
import { TOWNS } from '../data/towns';

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Hemelsbrede afstand in km tussen twee punten. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Ruwe reistijd-schatting (auto, regionaal ~45 km/u gemiddeld). */
export function minutesFor(km: number): number {
  return Math.round((km / 45) * 60);
}

// Geschatte omweg per enkele rit tijdens de tunnelafsluiting (rondrijden i.p.v. tunnel).
export const TUNNEL_DETOUR = { km: 52, min: 46 };

/** Besparing per week door dicht bij huis te werken i.p.v. om de tunnel te rijden. */
export function weeklySavings(daysPerWeek: number) {
  const trips = Math.max(0, daysPerWeek) * 2; // heen + terug
  const km = Math.round(TUNNEL_DETOUR.km * trips);
  const min = Math.round(TUNNEL_DETOUR.min * trips);
  const co2 = Math.round(km * 0.17); // kg CO2, gemiddelde benzineauto
  return { km, min, co2, hours: +(min / 60).toFixed(1) };
}

export type OccupancyLevel = 'rustig' | 'gemiddeld' | 'druk';

/** Gesimuleerde bezetting per locatie (stabiel per id). */
export function occupancyFor(l: Listing): { pct: number; free: number; level: OccupancyLevel } | null {
  if (typeof l.capacity !== 'number') return null;
  const pct = 22 + (hashStr(l.id) % 64); // 22-85% bezet
  const free = Math.max(0, Math.round(l.capacity * (1 - pct / 100)));
  const level: OccupancyLevel = pct < 45 ? 'rustig' : pct < 72 ? 'gemiddeld' : 'druk';
  return { pct, free, level };
}

export const OCCUPANCY_META: Record<OccupancyLevel, { label: string; color: string; dot: string }> = {
  rustig: { label: 'Rustig', color: '#0c9290', dot: '#12b5b0' },
  gemiddeld: { label: 'Gemiddeld', color: '#b06d11', dot: '#f0a020' },
  druk: { label: 'Druk', color: '#c0492a', dot: '#fb6b49' },
};

/** Dichtstbijzijnde Zeeuwse plaats bij coördinaten (voor "gebruik mijn locatie"). */
export function nearestTown(lat: number, lng: number) {
  let best = TOWNS[0];
  let bestD = Infinity;
  for (const t of TOWNS) {
    const d = distanceKm({ lat, lng }, t);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

export function formatKm(km: number): string {
  return `${km} km`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} u ${m} min` : `${h} uur`;
}
