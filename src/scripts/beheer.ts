import {
  counts,
  deleteListing,
  getSubmissions,
  onStoreChange,
  publicListings,
  resetDemo,
  setStatus,
} from '../lib/store';
import { CATEGORY_MAP } from '../data/taxonomy';
import { icon } from '../lib/icons';
import { escapeHtml, formatDateNL } from '../lib/util';
import type { Listing, ListingStatus } from '../lib/types';

type Tab = 'wachtrij' | 'goedgekeurd' | 'afgewezen' | 'alle';
let activeTab: Tab = 'wachtrij';

const statsEl = document.getElementById('zs-stats');
const listEl = document.getElementById('zs-admin-list');
const emptyEl = document.getElementById('zs-admin-empty');
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.zs-tab'));

function statBadge(status: ListingStatus): string {
  if (status === 'goedgekeurd') {
    return `<span class="inline-flex items-center gap-1 rounded-full bg-aqua-500/15 px-2.5 py-1 text-xs font-semibold text-aqua-600">${icon(
      'check',
      { size: 13, stroke: 2.4 },
    )} Live</span>`;
  }
  if (status === 'afgewezen') {
    return `<span class="inline-flex items-center gap-1 rounded-full bg-ink/8 px-2.5 py-1 text-xs font-semibold text-mist">${icon(
      'close',
      { size: 13 },
    )} Afgewezen</span>`;
  }
  return `<span class="inline-flex items-center gap-1 rounded-full bg-coral-500/12 px-2.5 py-1 text-xs font-semibold text-coral-600">${icon(
    'clock',
    { size: 13 },
  )} In wachtrij</span>`;
}

function actionBtn(action: string, id: string, label: string, iconName: string, variant: 'primary' | 'ghost' | 'danger'): string {
  const styles: Record<string, string> = {
    primary: 'bg-aqua-500 text-white hover:bg-aqua-600',
    ghost: 'border border-ink/15 text-ink-soft hover:bg-sea-50 hover:text-ink',
    danger: 'border border-ink/15 text-mist hover:border-coral-400 hover:text-coral-600',
  };
  return `<button type="button" data-action="${action}" data-id="${escapeHtml(id)}" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${styles[variant]}">${icon(
    iconName,
    { size: 15 },
  )} ${escapeHtml(label)}</button>`;
}

function adminCard(l: Listing): string {
  const cat = CATEGORY_MAP[l.category];
  const actions: string[] = [];
  if (l.status === 'wachtrij') {
    actions.push(actionBtn('approve', l.id, 'Goedkeuren', 'check', 'primary'));
    actions.push(actionBtn('reject', l.id, 'Afwijzen', 'close', 'ghost'));
  } else if (l.status === 'goedgekeurd') {
    actions.push(actionBtn('reject', l.id, 'Offline halen', 'close', 'ghost'));
  } else {
    actions.push(actionBtn('approve', l.id, 'Alsnog goedkeuren', 'check', 'primary'));
  }
  actions.push(
    `<a href="/plek?id=${encodeURIComponent(l.id)}" class="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-sea-50 hover:text-ink">${icon(
      'external',
      { size: 15 },
    )} Bekijk</a>`,
  );
  actions.push(actionBtn('delete', l.id, 'Verwijder', 'trash', 'danger'));

  const amenities = (l.amenities || [])
    .slice(0, 5)
    .map(
      (a) =>
        `<span class="rounded-md bg-sea-50 px-2 py-0.5 text-[11px] font-medium text-sea-700">${escapeHtml(a)}</span>`,
    )
    .join('');

  return `
  <div class="rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink/5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style="background:${
          cat.tint
        };color:${cat.color}">${icon(cat.icon, { size: 14 })} ${escapeHtml(cat.short)}</span>
        ${statBadge(l.status)}
      </div>
      <span class="text-xs text-mist">${l.submittedAt ? 'Ingediend ' + escapeHtml(formatDateNL(l.submittedAt)) : ''}</span>
    </div>

    <h3 class="mt-3 font-display text-lg font-bold text-ink">${escapeHtml(l.title)}</h3>
    <p class="text-sm text-ink-soft">${escapeHtml(l.provider)} &middot; ${escapeHtml(l.town)} &middot; <span class="font-semibold text-sea-700">${escapeHtml(
      l.price,
    )}</span></p>
    <p class="mt-2 line-clamp-2 text-sm text-mist">${escapeHtml(l.description)}</p>
    ${amenities ? `<div class="mt-2 flex flex-wrap gap-1.5">${amenities}</div>` : ''}

    <div class="mt-4 flex flex-wrap gap-2">${actions.join('')}</div>
  </div>`;
}

function statCard(label: string, value: number, color: string, iconName: string): string {
  return `<div class="rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink/5">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-mist">${escapeHtml(label)}</span>
      <span style="color:${color}">${icon(iconName, { size: 18 })}</span>
    </div>
    <div class="mt-1 font-display text-3xl font-extrabold" style="color:${color}">${value}</div>
  </div>`;
}

function renderStats() {
  if (!statsEl) return;
  const c = counts();
  statsEl.innerHTML = [
    statCard('In wachtrij', c.wachtrij, '#e9522f', 'clock'),
    statCard('Goedgekeurd', c.goedgekeurd, '#0c9290', 'check'),
    statCard('Afgewezen', c.afgewezen, '#6b8199', 'close'),
    statCard('Publiek zichtbaar', c.publiekTotaal, '#155f9c', 'map'),
  ].join('');
}

function renderTabCounts() {
  const subs = getSubmissions();
  const map: Record<Tab, number> = {
    wachtrij: subs.filter((s) => s.status === 'wachtrij').length,
    goedgekeurd: subs.filter((s) => s.status === 'goedgekeurd').length,
    afgewezen: subs.filter((s) => s.status === 'afgewezen').length,
    alle: subs.length,
  };
  (Object.keys(map) as Tab[]).forEach((t) => {
    const el = document.querySelector(`[data-tabcount="${t}"]`);
    if (el) el.textContent = String(map[t]);
  });
}

function renderList() {
  if (!listEl) return;
  const subs = getSubmissions().slice().sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  const filtered = activeTab === 'alle' ? subs : subs.filter((s) => s.status === activeTab);

  listEl.innerHTML = filtered.map(adminCard).join('');
  emptyEl?.classList.toggle('hidden', filtered.length > 0);
}

function renderAll() {
  renderStats();
  renderTabCounts();
  renderList();
}

function setTab(tab: Tab) {
  activeTab = tab;
  tabs.forEach((t) => {
    const active = t.dataset.tab === tab;
    t.classList.toggle('border-sea-600', active);
    t.classList.toggle('text-sea-700', active);
    t.classList.toggle('border-transparent', !active);
    t.classList.toggle('text-mist', !active);
  });
  renderList();
}

// ---------- events ----------
tabs.forEach((t) => t.addEventListener('click', () => setTab(t.dataset.tab as Tab)));

listEl?.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
  if (!btn) return;
  const id = btn.dataset.id!;
  const action = btn.dataset.action!;
  if (action === 'approve') setStatus(id, 'goedgekeurd');
  else if (action === 'reject') setStatus(id, 'afgewezen');
  else if (action === 'delete') {
    if (confirm('Dit aanbod definitief verwijderen?')) deleteListing(id);
  }
});

document.getElementById('zs-reset-demo')?.addEventListener('click', () => {
  if (confirm('Alle ingezonden aanbod uit deze demo wissen? De vaste voorbeeldplekken blijven staan.')) {
    resetDemo();
  }
});

onStoreChange(renderAll);

// ---------- start ----------
setTab('wachtrij');
renderAll();
