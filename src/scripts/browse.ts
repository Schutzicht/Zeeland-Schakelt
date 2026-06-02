import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { onStoreChange, publicListings } from '../lib/store';
import { listingCardHTML, popupHTML } from '../lib/cardTemplate';
import { CATEGORY_MAP } from '../data/taxonomy';
import type { Listing } from '../lib/types';
import { debounce } from '../lib/util';
import { distanceKm } from '../lib/smart';
import { icon } from '../lib/icons';

interface FilterState {
  q: string;
  cat: string;
  town: string;
  price: string;
  avail: string;
  region: string;
  sort: string;
  near: boolean;
}

const state: FilterState = {
  q: '',
  cat: 'all',
  town: '',
  price: '',
  avail: '',
  region: '',
  sort: 'aanbevolen',
  near: false,
};

let userLoc: { lat: number; lng: number } | null = null;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;

const els = {
  search: $<HTMLInputElement>('zs-search'),
  town: $<HTMLSelectElement>('zs-town'),
  price: $<HTMLSelectElement>('zs-price'),
  avail: $<HTMLSelectElement>('zs-avail'),
  region: $<HTMLSelectElement>('zs-region'),
  sort: $<HTMLSelectElement>('zs-sort'),
  reset: $('zs-reset'),
  emptyReset: $('zs-empty-reset'),
  list: $('zs-list'),
  empty: $('zs-empty'),
  count: $('zs-count'),
  mapEl: $('zs-map'),
  listPanel: $('zs-list-panel'),
  mapPanel: $('zs-map-panel'),
  viewList: $('zs-view-list'),
  viewMap: $('zs-view-map'),
  near: $('zs-near'),
};

const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('.zs-chip'));

// ---------- initiële staat uit URL ----------
function readUrl() {
  const p = new URLSearchParams(window.location.search);
  state.q = p.get('q') ?? '';
  state.cat = p.get('cat') ?? 'all';
  state.town = p.get('town') ?? '';
  state.price = p.get('price') ?? '';
  state.avail = p.get('avail') ?? '';
  state.region = p.get('region') ?? '';
}

function syncControls() {
  if (els.search) els.search.value = state.q;
  if (els.town) els.town.value = state.town;
  if (els.price) els.price.value = state.price;
  if (els.avail) els.avail.value = state.avail;
  if (els.region) els.region.value = state.region;
  if (els.sort) els.sort.value = state.sort;
  setActiveChip(state.cat);
}

function setActiveChip(cat: string) {
  chips.forEach((chip) => {
    const active = chip.dataset.cat === cat;
    chip.classList.toggle('bg-sea-600', active);
    chip.classList.toggle('text-white', active);
    chip.classList.toggle('border-sea-600', active);
    chip.classList.toggle('bg-white', !active);
    chip.classList.toggle('text-ink-soft', !active);
    chip.classList.toggle('border-ink/15', !active);
  });
}

function setNearActive(on: boolean) {
  const b = els.near;
  if (!b) return;
  b.classList.toggle('bg-sea-600', on);
  b.classList.toggle('text-white', on);
  b.classList.toggle('border-sea-600', on);
  b.classList.toggle('bg-white', !on);
  b.classList.toggle('text-ink-soft', !on);
  b.classList.toggle('border-ink/15', !on);
}

// ---------- filteren ----------
function applyFilters(all: Listing[]): Listing[] {
  let res = all.filter((l) => {
    if (state.cat !== 'all' && l.category !== state.cat) return false;
    if (state.town && l.town !== state.town) return false;
    if (state.region && l.region !== state.region) return false;
    if (state.price === 'gratis' && !l.free) return false;
    if (state.price === 'betaald' && l.free) return false;
    if (state.avail === 'direct' && l.availability !== 'direct') return false;
    if (state.q) {
      const q = state.q.trim().toLowerCase();
      const hay = [
        l.title,
        l.provider,
        l.town,
        l.description,
        CATEGORY_MAP[l.category]?.label ?? '',
        ...(l.amenities || []),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (state.near && userLoc) {
    res = res.slice().sort((a, b) => distanceKm(userLoc!, a) - distanceKm(userLoc!, b));
  } else if (state.sort === 'prijs-op') {
    res = res.slice().sort((a, b) => a.priceValue - b.priceValue);
  } else if (state.sort === 'prijs-af') {
    res = res.slice().sort((a, b) => b.priceValue - a.priceValue);
  } else {
    res = res.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return res;
}

// ---------- kaart ----------
let map: L.Map | null = null;
let markerLayer: L.LayerGroup | null = null;

function pinIcon(category: string): L.DivIcon {
  const color = CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.color ?? '#155f9c';
  const html = `<div class="zs-pin"><svg width="30" height="38" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.7 0 1 6.7 1 15c0 10.5 15 25 15 25s15-14.5 15-25C31 6.7 24.3 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="15" r="6" fill="white"/>
    </svg></div>`;
  return L.divIcon({
    html,
    className: 'zs-pin-wrap',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

function initMap() {
  if (!els.mapEl || map) return;
  map = L.map(els.mapEl, {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true,
  }).setView([51.42, 3.78], 9);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap, &copy; CARTO',
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  // scroll-zoom pas activeren als de kaart focus krijgt (geen scroll-hijack)
  map.on('focus', () => map?.scrollWheelZoom.enable());
  map.on('blur', () => map?.scrollWheelZoom.disable());

  setTimeout(() => map?.invalidateSize(), 60);
}

function renderMarkers(list: Listing[]) {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();
  const pts: L.LatLngExpression[] = [];
  list.forEach((l) => {
    const m = L.marker([l.lat, l.lng], { icon: pinIcon(l.category) });
    m.bindPopup(popupHTML(l), { closeButton: false, maxWidth: 240 });
    m.addTo(markerLayer!);
    pts.push([l.lat, l.lng]);
  });
  if (pts.length) {
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 13 });
  }
}

// ---------- render ----------
function render() {
  const all = publicListings();
  const list = applyFilters(all);

  if (els.list) els.list.innerHTML = list.map(listingCardHTML).join('');

  // afstand-chips wanneer "dichtbij mij" aan staat
  if (els.list && state.near && userLoc) {
    els.list.querySelectorAll<HTMLElement>('[data-id]').forEach((card) => {
      const l = list.find((x) => x.id === card.dataset.id);
      if (!l) return;
      const d = distanceKm(userLoc!, l);
      const media = card.querySelector('div');
      if (!media) return;
      const chip = document.createElement('span');
      chip.className =
        'absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-sea-700 shadow-sm backdrop-blur';
      chip.innerHTML = `${icon('location', { size: 12 })} ${d.toFixed(1)} km`;
      media.appendChild(chip);
    });
  }

  if (els.empty) els.empty.classList.toggle('hidden', list.length > 0);
  if (els.count) {
    const base =
      list.length === 0
        ? 'Geen resultaten'
        : `${list.length} ${list.length === 1 ? 'plek' : 'plekken'} gevonden`;
    els.count.textContent = state.near && userLoc ? `${base} · gesorteerd op afstand` : base;
  }
  renderMarkers(list);
}

// ---------- view toggle (mobiel) ----------
function setView(view: 'list' | 'map') {
  const showMap = view === 'map';
  els.listPanel?.classList.toggle('hidden', showMap);
  els.mapPanel?.classList.toggle('hidden', !showMap);

  els.viewList?.classList.toggle('bg-sea-600', !showMap);
  els.viewList?.classList.toggle('text-white', !showMap);
  els.viewList?.classList.toggle('text-ink-soft', showMap);
  els.viewMap?.classList.toggle('bg-sea-600', showMap);
  els.viewMap?.classList.toggle('text-white', showMap);
  els.viewMap?.classList.toggle('text-ink-soft', !showMap);

  if (showMap) {
    initMap();
    setTimeout(() => {
      map?.invalidateSize();
      render();
    }, 60);
  }
}

// ---------- events ----------
function wire() {
  els.search?.addEventListener(
    'input',
    debounce(() => {
      state.q = els.search!.value;
      render();
    }, 180),
  );

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      state.cat = chip.dataset.cat ?? 'all';
      setActiveChip(state.cat);
      render();
    });
  });

  els.town?.addEventListener('change', () => {
    state.town = els.town!.value;
    render();
  });
  els.price?.addEventListener('change', () => {
    state.price = els.price!.value;
    render();
  });
  els.avail?.addEventListener('change', () => {
    state.avail = els.avail!.value;
    render();
  });
  els.region?.addEventListener('change', () => {
    state.region = els.region!.value;
    render();
  });
  els.sort?.addEventListener('change', () => {
    state.sort = els.sort!.value;
    render();
  });

  const reset = () => {
    state.q = '';
    state.cat = 'all';
    state.town = '';
    state.price = '';
    state.avail = '';
    state.region = '';
    state.sort = 'aanbevolen';
    state.near = false;
    setNearActive(false);
    syncControls();
    render();
  };
  els.reset?.addEventListener('click', reset);
  els.emptyReset?.addEventListener('click', reset);

  els.near?.addEventListener('click', () => {
    if (state.near) {
      state.near = false;
      setNearActive(false);
      render();
      return;
    }
    if (!navigator.geolocation) return;
    els.near?.classList.add('animate-pulse');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.near = true;
        els.near?.classList.remove('animate-pulse');
        setNearActive(true);
        render();
      },
      () => els.near?.classList.remove('animate-pulse'),
      { timeout: 8000 },
    );
  });

  els.viewList?.addEventListener('click', () => setView('list'));
  els.viewMap?.addEventListener('click', () => setView('map'));

  onStoreChange(render);
}

// ---------- start ----------
readUrl();
syncControls();
initMap();
wire();
render();
