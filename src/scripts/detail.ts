import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getListing } from '../lib/store';
import { imageFor } from '../lib/cardTemplate';
import { CATEGORY_MAP, REGION_LABEL } from '../data/taxonomy';
import { icon } from '../lib/icons';
import { escapeHtml } from '../lib/util';
import type { Listing } from '../lib/types';

const detailEl = document.getElementById('zs-detail');
const notFoundEl = document.getElementById('zs-notfound');

function amenityRow(label: string): string {
  return `<li class="flex items-center gap-2 text-sm text-ink-soft">
    <span class="grid h-6 w-6 place-items-center rounded-md bg-aqua-500/12 text-aqua-600">${icon('check', {
      size: 14,
      stroke: 2.4,
    })}</span>${escapeHtml(label)}</li>`;
}

function contactButton(opts: {
  href: string;
  label: string;
  iconName: string;
  primary?: boolean;
  external?: boolean;
}): string {
  const base = opts.primary
    ? 'bg-sea-600 text-white hover:bg-sea-700'
    : 'border border-ink/15 text-ink-soft hover:bg-sea-50 hover:text-ink';
  const ext = opts.external ? 'target="_blank" rel="noopener"' : '';
  return `<a href="${escapeHtml(opts.href)}" ${ext} class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${base}">
    ${icon(opts.iconName, { size: 17 })} ${escapeHtml(opts.label)}
  </a>`;
}

function render(l: Listing) {
  const cat = CATEGORY_MAP[l.category];
  const img = escapeHtml(imageFor(l));
  document.title = `${l.title} — Zeeland Schakelt`;

  const pricePill = l.free
    ? `<span class="text-aqua-600">Gratis</span>`
    : `<span class="text-ink">${escapeHtml(l.price)}</span>`;

  const availChip =
    l.availability === 'direct'
      ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-aqua-500/12 px-3 py-1 text-sm font-semibold text-aqua-600">${icon(
          'check',
          { size: 15, stroke: 2.4 },
        )} Direct beschikbaar</span>`
      : `<span class="inline-flex items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1 text-sm font-semibold text-sea-700">${icon(
          'calendar',
          { size: 15 },
        )} ${escapeHtml(l.availabilityLabel)}</span>`;

  const capacityChip =
    typeof l.capacity === 'number'
      ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1 text-sm font-semibold text-sea-700">${icon(
          'users',
          { size: 15 },
        )} ${l.capacity} plekken</span>`
      : '';

  const amenities = (l.amenities || []).map(amenityRow).join('');

  const pendingBanner =
    l.status !== 'goedgekeurd'
      ? `<div class="mb-5 flex items-start gap-3 rounded-xl border border-coral-500/30 bg-coral-500/10 p-4 text-sm text-ink">
          <span class="mt-0.5 text-coral-600">${icon('info', { size: 18 })}</span>
          <div>Dit aanbod is nog in behandeling en nog niet openbaar zichtbaar. Je ziet het omdat je de directe link hebt.</div>
        </div>`
      : '';

  const buttons: string[] = [];
  if (l.website && l.website !== '#') {
    buttons.push(
      contactButton({
        href: l.website,
        label: 'Bekijk aanbieder',
        iconName: 'external',
        primary: true,
        external: true,
      }),
    );
  }
  buttons.push(
    contactButton({
      href: `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`,
      label: 'Plan route',
      iconName: 'route',
      primary: !(l.website && l.website !== '#'),
      external: true,
    }),
  );
  if (l.email) {
    buttons.push(contactButton({ href: `mailto:${l.email}`, label: 'Mail', iconName: 'mail' }));
  }
  if (l.phone) {
    buttons.push(
      contactButton({ href: `tel:${l.phone.replace(/\s/g, '')}`, label: l.phone, iconName: 'phone' }),
    );
  }

  detailEl!.innerHTML = `
    ${pendingBanner}
    <div class="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-card ring-1 ring-ink/[0.06] sm:aspect-[21/9]" style="background-color:${
      cat.tint
    }">
      <span class="absolute inset-0 grid place-items-center opacity-25" style="color:${cat.color}">${icon(cat.icon, {
        size: 96,
        stroke: 1,
      })}</span>
      <img src="${img}" alt="${escapeHtml(
        l.title,
      )}" decoding="async" onerror="this.remove()" class="absolute inset-0 h-full w-full object-cover" />
      <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/10"></span>
      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-bold backdrop-blur" style="color:${
          cat.color
        }">${icon(cat.icon, { size: 16 })} ${escapeHtml(cat.label)}</span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-sm font-semibold text-sea-700 backdrop-blur">${icon(
          'location',
          { size: 15 },
        )} ${escapeHtml(REGION_LABEL[l.region])}</span>
      </div>
    </div>

    <div class="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 class="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">${escapeHtml(
          l.title,
        )}</h1>
        <p class="mt-2 flex items-center gap-2 text-ink-soft">
          ${icon('building', { size: 18, cls: 'text-sea-500' })}
          <span class="font-semibold">${escapeHtml(l.provider)}</span>
          <span class="text-mist">&middot; ${escapeHtml(l.address)}</span>
        </p>

        <div class="mt-5 flex flex-wrap gap-2">${availChip}${capacityChip}</div>

        <div class="mt-7">
          <h2 class="font-display text-lg font-bold text-ink">Over deze plek</h2>
          <p class="mt-2 leading-relaxed text-ink-soft">${escapeHtml(l.description)}</p>
        </div>

        ${
          amenities
            ? `<div class="mt-7">
                <h2 class="font-display text-lg font-bold text-ink">Voorzieningen</h2>
                <ul class="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">${amenities}</ul>
              </div>`
            : ''
        }

        <div class="mt-7 rounded-2xl bg-foam p-5">
          <h2 class="flex items-center gap-2 font-display text-base font-bold text-ink">${icon('whatsapp', {
            size: 18,
            cls: 'text-aqua-600',
          })} Zoek je iets vergelijkbaars?</h2>
          <p class="mt-1 text-sm text-ink-soft">Plaats je vraag in de community, dan denken anderen met je mee.</p>
          <a href="/community" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-aqua-600 hover:text-aqua-700">
            Naar de community ${icon('arrowRight', { size: 15 })}
          </a>
        </div>
      </div>

      <aside class="lg:sticky lg:top-20 lg:self-start">
        <div class="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink/5">
          <div class="text-sm font-medium text-mist">Prijs</div>
          <div class="font-display text-2xl font-extrabold">${pricePill}</div>
          <div class="mt-4 grid gap-2.5">${buttons.join('')}</div>
        </div>
        <div id="zs-mini-map" class="mt-4 h-56 w-full overflow-hidden rounded-2xl shadow-card ring-1 ring-ink/10"></div>
      </aside>
    </div>
  `;

  initMiniMap(l);
}

function initMiniMap(l: Listing) {
  const el = document.getElementById('zs-mini-map');
  if (!el) return;
  const map = L.map(el, {
    scrollWheelZoom: false,
    zoomControl: false,
    dragging: false,
    doubleClickZoom: false,
    attributionControl: false,
  }).setView([l.lat, l.lng], 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  const color = CATEGORY_MAP[l.category]?.color ?? '#155f9c';
  const html = `<div class="zs-pin"><svg width="30" height="38" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.7 0 1 6.7 1 15c0 10.5 15 25 15 25s15-14.5 15-25C31 6.7 24.3 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="15" r="6" fill="white"/>
    </svg></div>`;
  L.marker([l.lat, l.lng], {
    icon: L.divIcon({ html, className: '', iconSize: [30, 38], iconAnchor: [15, 38] }),
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 60);
}

// ---------- start ----------
const id = new URLSearchParams(window.location.search).get('id') ?? '';
const listing = id ? getListing(id) : undefined;

if (!listing) {
  detailEl?.classList.add('hidden');
  notFoundEl?.classList.remove('hidden');
} else {
  render(listing);
}
