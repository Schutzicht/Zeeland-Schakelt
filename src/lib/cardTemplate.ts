// Eén kaart-template, gebruikt door zowel server-gerenderde secties
// (home) als de client-side browse-pagina en kaart-popups.

import { CATEGORY_MAP, REGION_LABEL } from '../data/taxonomy';
import { icon } from './icons';
import type { Listing } from './types';
import { escapeHtml } from './util';

export function listingHref(l: Listing): string {
  return `/plek?id=${encodeURIComponent(l.id)}`;
}

/** Editorial beeld voor een aanbod. Seeds hebben een eigen beeld op id,
 *  gebruikersinzendingen vallen terug op het categorie-beeld. */
export function imageFor(l: Listing): string {
  if (l.image) return l.image;
  if (!l.userSubmitted) return `/images/zeeland-schakelt/generated/${l.id}.png`;
  return CATEGORY_MAP[l.category].image;
}

function pricePill(l: Listing): string {
  if (l.free) {
    return `<span class="inline-flex items-center rounded-full bg-aqua-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">Gratis</span>`;
  }
  return `<span class="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur">${escapeHtml(
    l.price,
  )}</span>`;
}

export function listingCardHTML(l: Listing): string {
  const cat = CATEGORY_MAP[l.category];
  const title = escapeHtml(l.title);
  const provider = escapeHtml(l.provider);
  const town = escapeHtml(l.town);
  const desc = escapeHtml(l.description);
  const img = escapeHtml(imageFor(l));

  const directChip =
    l.availability === 'direct'
      ? `<span class="inline-flex items-center gap-1 text-xs font-semibold text-aqua-600">${icon('check', {
          size: 14,
          stroke: 2.4,
        })} Direct beschikbaar</span>`
      : `<span class="inline-flex items-center gap-1 text-xs font-medium text-mist">${icon('calendar', {
          size: 14,
        })} ${escapeHtml(l.availabilityLabel)}</span>`;

  const capacity =
    typeof l.capacity === 'number'
      ? `<span class="inline-flex items-center gap-1 text-xs text-mist">${icon('users', {
          size: 14,
        })} ${l.capacity}</span>`
      : '';

  const featuredBadge = l.featured
    ? `<span class="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">${icon(
        'star',
        { size: 12 },
      )} Uitgelicht</span>`
    : '';

  return `
  <a href="${listingHref(l)}" data-id="${escapeHtml(
    l.id,
  )}" class="zs-card group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-ink/[0.06] shadow-card transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-float focus-visible:-translate-y-1.5">
    <div class="relative aspect-[3/2] overflow-hidden" style="background-color:${cat.tint}">
      <span class="absolute inset-0 grid place-items-center opacity-25" style="color:${cat.color}">${icon(
        cat.icon,
        { size: 64, stroke: 1.2 },
      )}</span>
      <img src="${img}" alt="${title}" loading="lazy" decoding="async" onerror="this.remove()" class="absolute inset-0 h-full w-full object-cover transition duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]" />
      <span class="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/30 to-transparent"></span>
      <span class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold backdrop-blur" style="color:${
        cat.color
      }">${icon(cat.icon, { size: 14 })} ${escapeHtml(cat.short)}</span>
      <span class="absolute right-3 top-3">${pricePill(l)}</span>
      ${featuredBadge}
    </div>
    <div class="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
      <p class="flex items-center gap-1.5 text-xs font-medium text-mist">
        ${icon('location', { size: 14, cls: 'text-sea-400 shrink-0' })} ${town} &middot; ${escapeHtml(
          REGION_LABEL[l.region],
        )}
      </p>
      <h3 class="font-display text-lg font-bold leading-snug text-ink">${title}</h3>
      <p class="-mt-0.5 text-sm font-medium text-ink-soft">${provider}</p>
      <p class="line-clamp-2 text-sm text-mist">${desc}</p>
      <div class="mt-2 flex items-center justify-between gap-2 border-t border-ink/[0.06] pt-3">
        <div class="flex items-center gap-3">${directChip}${capacity}</div>
        <span class="inline-flex items-center gap-1 text-sm font-semibold text-sea-600 transition group-hover:gap-1.5">
          Bekijk ${icon('arrowRight', { size: 16 })}
        </span>
      </div>
    </div>
  </a>`;
}

/** Compacte variant met beeld voor kaart-popups. */
export function popupHTML(l: Listing): string {
  const cat = CATEGORY_MAP[l.category];
  const img = escapeHtml(imageFor(l));
  return `
  <a href="${listingHref(l)}" class="block">
    <div class="relative h-28 overflow-hidden" style="background-color:${cat.tint}">
      <img src="${img}" alt="" loading="lazy" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
      <span style="position:absolute;left:8px;top:8px;background:rgba(255,255,255,0.92);color:${
        cat.color
      };font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px">${escapeHtml(cat.short)}</span>
    </div>
    <div class="p-3">
      <div style="font-family:var(--font-display);font-weight:700;color:#0b2a43;font-size:14px;line-height:1.3;margin-bottom:2px">${escapeHtml(
        l.title,
      )}</div>
      <div style="color:#6b8199;font-size:12px;margin-bottom:6px">${escapeHtml(l.provider)} &middot; ${escapeHtml(
        l.town,
      )}</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-weight:700;color:#155f9c;font-size:12px">${escapeHtml(l.price)}</span>
        <span style="color:#155f9c;font-size:12px;font-weight:600">Bekijk &rarr;</span>
      </div>
    </div>
  </a>`;
}
