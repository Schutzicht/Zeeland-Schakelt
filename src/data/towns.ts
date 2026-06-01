import type { Region } from '../lib/types';

export interface Town {
  name: string;
  lat: number;
  lng: number;
  region: Region;
}

// Zeeuwse plaatsen met centroïde-coördinaten.
// region: 'noord' = Walcheren / Zuid-Beveland / Schouwen-Duiveland
//         'zuid'  = Zeeuws-Vlaanderen (de overkant van de tunnel)
export const TOWNS: Town[] = [
  { name: 'Vlissingen', lat: 51.4426, lng: 3.5736, region: 'noord' },
  { name: 'Middelburg', lat: 51.4988, lng: 3.6136, region: 'noord' },
  { name: 'Goes', lat: 51.5045, lng: 3.8884, region: 'noord' },
  { name: 'Kapelle', lat: 51.4856, lng: 3.9606, region: 'noord' },
  { name: 'Heinkenszand', lat: 51.5008, lng: 3.8128, region: 'noord' },
  { name: 'Kruiningen', lat: 51.4628, lng: 4.0136, region: 'noord' },
  { name: 'Domburg', lat: 51.5642, lng: 3.4969, region: 'noord' },
  { name: 'Oostkapelle', lat: 51.5556, lng: 3.5417, region: 'noord' },
  { name: 'Zierikzee', lat: 51.65, lng: 3.9167, region: 'noord' },
  { name: 'Terneuzen', lat: 51.3349, lng: 3.829, region: 'zuid' },
  { name: 'Hulst', lat: 51.2806, lng: 4.0556, region: 'zuid' },
  { name: 'Oostburg', lat: 51.3331, lng: 3.4994, region: 'zuid' },
  { name: 'Breskens', lat: 51.3958, lng: 3.5575, region: 'zuid' },
  { name: 'Cadzand', lat: 51.3686, lng: 3.4036, region: 'zuid' },
  { name: 'Sluis', lat: 51.3083, lng: 3.3878, region: 'zuid' },
  { name: 'Axel', lat: 51.2667, lng: 3.9078, region: 'zuid' },
];

export const TOWN_MAP: Record<string, Town> = Object.fromEntries(
  TOWNS.map((t) => [t.name, t]),
);

/** Geef coördinaten voor een plaats, met kleine deterministische spreiding
 *  zodat losse markers op dezelfde plaats niet exact overlappen. */
export function coordsForTown(town: string, seed = ''): { lat: number; lng: number; region: Region } {
  const t = TOWN_MAP[town] ?? TOWNS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  const offLat = ((h % 100) / 100 - 0.5) * 0.012;
  const offLng = (((h >> 4) % 100) / 100 - 0.5) * 0.018;
  return { lat: t.lat + offLat, lng: t.lng + offLng, region: t.region };
}
