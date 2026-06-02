import { publicListings } from '../lib/store';
import { listingCardHTML, listingHref, imageFor } from '../lib/cardTemplate';
import { CATEGORY_MAP, REGION_LABEL } from '../data/taxonomy';
import { TOWN_MAP, TOWNS } from '../data/towns';
import { distanceKm, nearestTown, weeklySavings, formatDuration } from '../lib/smart';
import { icon } from '../lib/icons';
import { escapeHtml } from '../lib/util';
import type { CategoryId, Listing } from '../lib/types';

const $ = (id: string) => document.getElementById(id);

// ---------------- gedeeld ----------------
function recommend(opts: {
  homeTown: string;
  needs: CategoryId[];
  free?: boolean;
  limit?: number;
}): Listing[] {
  const home = TOWN_MAP[opts.homeTown];
  let list = publicListings().filter((l) => opts.needs.includes(l.category));
  if (opts.free) list = list.filter((l) => l.free);
  const scored = list.map((l) => {
    let score = home ? distanceKm(home, l) : 0;
    if (home && l.region === home.region) score -= 60; // sterke voorkeur: zelfde kant (geen tunnel)
    if (l.featured) score -= 4;
    return { l, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.map((x) => x.l).slice(0, opts.limit ?? 3);
}

function recRow(l: Listing): string {
  const cat = CATEGORY_MAP[l.category];
  return `<a href="${listingHref(l)}" class="group flex items-center gap-3 rounded-xl border border-ink/10 p-2.5 transition hover:border-sea-300 hover:bg-sea-50/40">
    <span class="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg" style="background:${cat.tint}">
      <img src="${escapeHtml(imageFor(l))}" alt="" loading="lazy" onerror="this.remove()" class="absolute inset-0 h-full w-full object-cover" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-semibold text-ink">${escapeHtml(l.title)}</span>
      <span class="block truncate text-xs text-mist">${escapeHtml(l.provider)} &middot; ${escapeHtml(l.town)} &middot; ${escapeHtml(l.price)}</span>
    </span>
    <span class="text-sea-600 transition group-hover:translate-x-0.5">${icon('arrowRight', { size: 16 })}</span>
  </a>`;
}

function animateValue(el: HTMLElement, to: number, suffix = '') {
  const dur = 850;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString('nl-NL') + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------------- tabs ----------------
let greeted = false;
function setTab(tab: 'planner' | 'chat') {
  const planner = tab === 'planner';
  $('tab-planner')?.classList.toggle('hidden', !planner);
  $('tab-chat')?.classList.toggle('hidden', planner);
  for (const [id, on] of [
    ['tab-btn-planner', planner],
    ['tab-btn-chat', !planner],
  ] as const) {
    const b = $(id);
    if (!b) continue;
    b.classList.toggle('bg-white', on);
    b.classList.toggle('text-sea-700', on);
    b.classList.toggle('shadow-sm', on);
    b.classList.toggle('text-white', !on && id === 'tab-btn-planner');
    b.classList.toggle('text-white/80', !on);
  }
  if (!planner && !greeted) {
    greeted = true;
    pushMsg(
      'bot',
      'Hoi! Ik ben je reismaatje. Vertel me waar je woont en werkt, dan zoek ik plekken en ritten dichtbij. Bijvoorbeeld: <span class="font-medium text-ink">"ik woon in Terneuzen en werk in Goes, 3 dagen"</span>.',
    );
  }
}

// ---------------- planner ----------------
const state = { home: '', work: '', days: 3, needs: new Set<CategoryId>(), free: false };

function initPlanner() {
  const homeSel = $('plan-home') as HTMLSelectElement | null;
  const workSel = $('plan-work') as HTMLSelectElement | null;
  homeSel?.addEventListener('change', () => (state.home = homeSel.value));
  workSel?.addEventListener('change', () => (state.work = workSel.value));

  // dagen
  const dayBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.zs-daybtn'));
  const setDays = (d: number) => {
    state.days = d;
    dayBtns.forEach((b) => b.setAttribute('data-active', String(Number(b.dataset.days) === d)));
  };
  dayBtns.forEach((b) => b.addEventListener('click', () => setDays(Number(b.dataset.days))));
  setDays(3);

  // behoefte
  document.querySelectorAll<HTMLButtonElement>('.zs-needchip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.need as CategoryId;
      if (state.needs.has(id)) state.needs.delete(id);
      else state.needs.add(id);
      chip.setAttribute('data-active', String(state.needs.has(id)));
    });
  });

  // gratis
  ($('plan-free') as HTMLInputElement | null)?.addEventListener('change', (e) => {
    state.free = (e.target as HTMLInputElement).checked;
  });

  // locatie
  $('plan-geo')?.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    const btn = $('plan-geo')!;
    btn.classList.add('animate-pulse');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const t = nearestTown(pos.coords.latitude, pos.coords.longitude);
        if (homeSel) homeSel.value = t.name;
        state.home = t.name;
        btn.classList.remove('animate-pulse');
      },
      () => btn.classList.remove('animate-pulse'),
      { timeout: 8000 },
    );
  });

  $('plan-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.home) {
      homeSel?.focus();
      homeSel?.classList.add('ring-2', 'ring-coral-400');
      setTimeout(() => homeSel?.classList.remove('ring-2', 'ring-coral-400'), 1500);
      return;
    }
    renderPlan();
  });
}

function renderPlan() {
  const home = TOWN_MAP[state.home];
  const work = state.work ? TOWN_MAP[state.work] : null;
  const crosses = !!work && work.region !== home.region;
  const needs = state.needs.size ? [...state.needs] : (['werkplek'] as CategoryId[]);
  const recs = recommend({ homeTown: state.home, needs: needs.filter((n) => n !== 'carpool'), free: state.free, limit: 3 });
  const carpool = recommend({ homeTown: state.home, needs: ['carpool'], limit: 2 });
  const sav = weeklySavings(state.days);

  const situation = work
    ? `Je woont in <b>${escapeHtml(home.name)}</b> en werkt in <b>${escapeHtml(work.name)}</b>.`
    : `Je woont in <b>${escapeHtml(home.name)}</b>.`;
  const crossLine = crosses
    ? `Normaal steek je hiervoor de Westerscheldetunnel over. Tijdens de afsluiting kun je dat ${state.days}x per week vermijden.`
    : work
      ? 'Goed nieuws: je hoeft de tunnel niet over. Dichtbij werken scheelt alsnog reistijd.'
      : 'We zoeken plekken zo dicht mogelijk bij huis.';

  const savingsCard = crosses
    ? `<div class="overflow-hidden rounded-3xl bg-gradient-to-br from-sea-700 to-aqua-600 p-6 text-white sm:p-8">
        <p class="zs-eyebrow" style="color:rgba(255,255,255,0.85)">Jouw besparing per week</p>
        <div class="mt-4 grid grid-cols-3 gap-4">
          <div><div class="font-display text-3xl font-extrabold sm:text-4xl" data-count="${sav.min}" data-suffix=" min">0</div><div class="mt-1 text-sm text-white/80">reistijd</div></div>
          <div><div class="font-display text-3xl font-extrabold sm:text-4xl" data-count="${sav.km}" data-suffix=" km">0</div><div class="mt-1 text-sm text-white/80">minder rijden</div></div>
          <div><div class="font-display text-3xl font-extrabold sm:text-4xl" data-count="${sav.co2}" data-suffix=" kg">0</div><div class="mt-1 text-sm text-white/80">CO2</div></div>
        </div>
        <p class="mt-4 text-sm text-white/70">Schatting o.b.v. ${state.days} kantoordagen en het omrijden om de tunnel (heen en terug).</p>
      </div>`
    : `<div class="rounded-3xl bg-foam p-6 sm:p-8">
        <p class="flex items-center gap-2 font-display text-lg font-bold text-ink">${icon('checkCircle', { size: 20, cls: 'text-aqua-600' })} ${escapeHtml(crossLine)}</p>
      </div>`;

  const mobility =
    crosses || needs.includes('carpool')
      ? `<div class="mt-6">
          <h3 class="font-display text-lg font-bold text-ink">Slim de overkant bereiken</h3>
          <p class="mt-1 text-sm text-mist">Moet je toch oversteken? Deel de rit of pak het veer.</p>
          <div class="mt-3 grid gap-2.5">${carpool.map(recRow).join('') || '<p class="text-sm text-mist">Geen ritten gevonden, plaats je vraag in de community.</p>'}</div>
        </div>`
      : '';

  const result = $('plan-result')!;
  result.innerHTML = `
    <div class="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/[0.06] sm:p-8">
      <div class="flex items-center gap-2">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-sea-600 text-white">${icon('route', { size: 18 })}</span>
        <h2 class="font-display text-2xl font-extrabold tracking-tight text-ink">Jouw schakelplan</h2>
      </div>
      <p class="mt-3 text-ink-soft">${situation} ${escapeHtml(crossLine)}</p>

      <div class="mt-6">${savingsCard}</div>

      <div class="mt-7">
        <h3 class="font-display text-lg font-bold text-ink">Aanbevolen dichtbij huis</h3>
        <p class="mt-1 text-sm text-mist">In ${escapeHtml(REGION_LABEL[home.region])}, zodat je niet hoeft over te steken.</p>
        <div class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">${recs.map(listingCardHTML).join('') || '<p class="text-sm text-mist">Niets gevonden, pas je voorkeuren aan.</p>'}</div>
      </div>

      ${mobility}

      <div class="mt-7 flex flex-wrap items-center gap-3 border-t border-ink/[0.06] pt-5">
        <button id="plan-save" type="button" class="inline-flex items-center gap-1.5 rounded-xl bg-sea-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-700">${icon('check', { size: 16, stroke: 2.4 })} Bewaar mijn plan</button>
        <a href="/community" class="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-sea-50">${icon('whatsapp', { size: 16 })} Vraag in de community</a>
        <span id="plan-saved" class="hidden text-sm font-medium text-aqua-600">Bewaard op dit apparaat.</span>
      </div>
    </div>`;

  result.classList.remove('hidden');
  result.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    animateValue(el, Number(el.dataset.count), el.dataset.suffix ?? '');
  });
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });

  $('plan-save')?.addEventListener('click', () => {
    try {
      localStorage.setItem('zs_plan', JSON.stringify({ ...state, needs: [...state.needs] }));
    } catch {}
    $('plan-saved')?.classList.remove('hidden');
  });
}

// ---------------- chat ----------------
function pushMsg(who: 'user' | 'bot', html: string, cardsHtml = '') {
  const log = $('chat-log');
  if (!log) return;
  const wrap = document.createElement('div');
  if (who === 'user') {
    wrap.className = 'flex justify-end';
    wrap.innerHTML = `<div class="max-w-[85%] rounded-2xl rounded-br-md bg-sea-600 px-4 py-2.5 text-sm text-white">${html}</div>`;
  } else {
    wrap.className = 'flex items-start gap-2.5';
    wrap.innerHTML = `<span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sea-500 to-aqua-500 text-white">${icon('sparkle', { size: 16 })}</span>
      <div class="max-w-[88%]"><div class="rounded-2xl rounded-tl-md bg-foam px-4 py-2.5 text-sm leading-relaxed text-ink">${html}</div>${cardsHtml ? `<div class="mt-2.5 grid gap-2">${cardsHtml}</div>` : ''}</div>`;
  }
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}

const ctx = { home: '', work: '', needs: [] as CategoryId[], free: false };

const NEED_WORDS: Record<CategoryId, string[]> = {
  werkplek: ['werkplek', 'flex', 'kantoor', 'werken', 'bureau'],
  vergaderruimte: ['vergader', 'meeting', 'overleg', 'projectruimte'],
  overnachting: ['overnacht', 'slapen', 'hotel', 'verblijf', 'bed', 'b&b', 'nacht'],
  carpool: ['carpool', 'meerij', 'meerijden', 'rit', 'veer', 'shuttle', 'rijden'],
};

function parse(text: string) {
  const lower = text.toLowerCase();
  const found: { name: string; idx: number }[] = [];
  for (const t of TOWNS) {
    const idx = lower.indexOf(t.name.toLowerCase());
    if (idx >= 0) found.push({ name: t.name, idx });
  }
  found.sort((a, b) => a.idx - b.idx);
  const needs: CategoryId[] = [];
  (Object.keys(NEED_WORDS) as CategoryId[]).forEach((c) => {
    if (NEED_WORDS[c].some((w) => lower.includes(w))) needs.push(c);
  });
  const daysM = lower.match(/(\d+)\s*(?:dag|dgn|x)/);
  return {
    towns: found.map((f) => f.name),
    needs,
    free: /gratis|gratis|kosteloos/.test(lower),
    days: daysM ? Number(daysM[1]) : undefined,
  };
}

function advise(text: string) {
  const p = parse(text);
  if (p.towns[0]) ctx.home = p.towns[0];
  if (p.towns[1]) ctx.work = p.towns[1];
  if (p.needs.length) ctx.needs = p.needs;
  if (p.free) ctx.free = true;

  if (!ctx.home && !ctx.needs.length) {
    pushMsg('bot', 'Vertel me in welke plaats je woont (en eventueel werkt), dan ga ik voor je zoeken. Bijvoorbeeld: "ik woon in Hulst".');
    return;
  }

  const needs = ctx.needs.length ? ctx.needs : (['werkplek'] as CategoryId[]);
  const homeName = ctx.home || TOWNS[0].name;
  const home = TOWN_MAP[homeName];
  const work = ctx.work ? TOWN_MAP[ctx.work] : null;
  const crosses = !!work && work.region !== home.region;

  const recs = recommend({ homeTown: homeName, needs: needs.filter((n) => n !== 'carpool'), free: ctx.free, limit: 3 });
  const carpool = needs.includes('carpool') || crosses ? recommend({ homeTown: homeName, needs: ['carpool'], limit: 2 }) : [];
  const all = [...recs, ...carpool];

  let text2 = '';
  if (all.length) {
    const needLabel = needs.map((n) => CATEGORY_MAP[n].short.toLowerCase()).join(' en ');
    text2 = `Op basis van <b>${escapeHtml(homeName)}</b>${work ? ` &rarr; ${escapeHtml(work.name)}` : ''} vond ik dit aanbod (${escapeHtml(needLabel)})${ctx.free ? ', gratis' : ''}, zo dicht mogelijk bij huis:`;
    if (crosses) {
      const sav = weeklySavings(3);
      text2 += ` Werk je 3 dagen dichtbij, dan scheelt dat zo'n <b>${formatDuration(sav.min)}</b> en <b>${sav.km} km</b> per week aan omrijden.`;
    }
  } else {
    text2 = `Ik vond hier nog niets passends voor. Probeer een andere plaats of zet je vraag in de community.`;
  }
  pushMsg('bot', text2, all.map(recRow).join(''));
}

function initChat() {
  $('chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('chat-input') as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;
    pushMsg('user', escapeHtml(text));
    input.value = '';
    setTimeout(() => advise(text), 250);
  });
  document.querySelectorAll<HTMLButtonElement>('.chat-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const input = $('chat-input') as HTMLInputElement;
      input.value = chip.textContent?.trim() ?? '';
      $('chat-form')?.dispatchEvent(new Event('submit'));
    });
  });
}

// ---------------- start ----------------
$('tab-btn-planner')?.addEventListener('click', () => setTab('planner'));
$('tab-btn-chat')?.addEventListener('click', () => setTab('chat'));
setTab('planner');
initPlanner();
initChat();
