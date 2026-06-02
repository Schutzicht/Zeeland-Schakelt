import { icon } from '../lib/icons';
import { CATEGORIES } from '../data/taxonomy';
import { TOWNS } from '../data/towns';

function animateValue(el: HTMLElement, to: number, suffix: string) {
  const dur = 1100;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString('nl-NL') + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
const current = new Map<HTMLElement, number>();
counters.forEach((el) => {
  const to = Number(el.dataset.count);
  current.set(el, to);
  animateValue(el, to, el.dataset.suffix ?? '');
});

// "live" laten oplopen
const liveEls = counters.filter((el) => el.dataset.live === '1');
setInterval(() => {
  liveEls.forEach((el) => {
    const suffix = el.dataset.suffix ?? '';
    const inc = suffix.includes('km') ? Math.floor(Math.random() * 380 + 90) : Math.random() < 0.55 ? 1 : 0;
    if (!inc) return;
    const v = (current.get(el) ?? 0) + inc;
    current.set(el, v);
    el.textContent = v.toLocaleString('nl-NL') + suffix;
    el.classList.add('zs-bump');
    setTimeout(() => el.classList.remove('zs-bump'), 420);
  });
}, 3500);

// live activiteit-feed
const feed = document.getElementById('zs-feed');
const TEMPLATES: ((t: string, c: string) => string)[] = [
  (t, c) => `Nieuw aanbod (${c}) geplaatst in ${t}`,
  (t) => `Werkplek gezocht in ${t}`,
  (t) => `Carpool-match gemaakt richting ${t}`,
  (t) => `Iemand uit ${t} maakte een schakelplan`,
  (t) => `Plek gereserveerd in ${t}`,
];
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

function addFeed() {
  if (!feed) return;
  const t = pick(TOWNS).name;
  const c = pick(CATEGORIES).short.toLowerCase();
  const text = pick(TEMPLATES)(t, c);
  const row = document.createElement('div');
  row.className = 'zs-rise flex items-center gap-2.5 text-sm';
  row.innerHTML = `<span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sea-50 text-sea-600">${icon(
    'sparkle',
    { size: 14 },
  )}</span><span class="text-ink-soft">${text}</span><span class="ml-auto font-mono text-xs text-mist">zojuist</span>`;
  feed.prepend(row);
  while (feed.children.length > 6) feed.removeChild(feed.lastChild as Node);
}

for (let i = 0; i < 4; i++) addFeed();
setInterval(addFeed, 3800);
