import { addListing } from '../lib/store';
import { CATEGORY_MAP } from '../data/taxonomy';
import { icon } from '../lib/icons';
import { escapeHtml } from '../lib/util';
import type { CategoryId, NewListingInput } from '../lib/types';

const form = document.getElementById('zs-form') as HTMLFormElement | null;
const formWrap = document.getElementById('zs-form-wrap');
const success = document.getElementById('zs-success');
const summary = document.getElementById('zs-success-summary');
const errorBox = document.getElementById('zs-error');

const priceFields = document.getElementById('zs-price-fields');
const amountField = document.getElementById('zs-amount-field');
const dateField = document.getElementById('zs-date-field');
const perSelect = document.getElementById('zs-per') as HTMLSelectElement | null;

if (form) {
  // ---- veld-toggles ----
  form.querySelectorAll<HTMLInputElement>('input[name="pricetype"]').forEach((r) => {
    r.addEventListener('change', () => {
      const betaald = getRadio('pricetype') === 'betaald';
      priceFields?.classList.toggle('hidden', !betaald);
      priceFields?.classList.toggle('flex', betaald);
    });
  });

  perSelect?.addEventListener('change', () => {
    amountField?.classList.toggle('hidden', perSelect.value === 'aanvraag');
  });

  form.querySelectorAll<HTMLInputElement>('input[name="availtype"]').forEach((r) => {
    r.addEventListener('change', () => {
      dateField?.classList.toggle('hidden', getRadio('availtype') !== 'datum');
    });
  });

  form.addEventListener('submit', onSubmit);

  document.getElementById('zs-again')?.addEventListener('click', resetForm);
}

function getRadio(name: string): string {
  return (form?.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null)?.value ?? '';
}

function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? '';
}

function formatEuro(n: number): string {
  if (Number.isInteger(n)) return `€${n},-`;
  return '€' + n.toFixed(2).replace('.', ',');
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function showError(msg: string) {
  if (!errorBox) return;
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function onSubmit(e: Event) {
  e.preventDefault();
  errorBox?.classList.add('hidden');

  const category = getRadio('category') as CategoryId;
  const title = val('zs-title');
  const provider = val('zs-provider');
  const town = val('zs-town');
  const address = val('zs-address');
  const description = val('zs-desc');
  const website = val('zs-website');
  const email = val('zs-email');
  const phone = val('zs-phone');

  if (!title || !provider || !town || !description) {
    showError('Vul de verplichte velden in: titel, aanbieder, plaats en omschrijving.');
    return;
  }
  if (!website && !email && !phone) {
    showError('Vul minimaal één contactmogelijkheid in (website, e-mail of telefoon).');
    return;
  }

  // prijs
  let price = 'Gratis';
  let priceValue = 0;
  if (getRadio('pricetype') === 'betaald') {
    const per = perSelect?.value ?? 'dag';
    if (per === 'aanvraag') {
      price = 'Op aanvraag';
      priceValue = 1;
    } else {
      const amount = parseFloat(val('zs-amount').replace(',', '.'));
      if (!amount || amount <= 0) {
        showError('Vul een geldig bedrag in, of kies "Op aanvraag".');
        return;
      }
      price = `${formatEuro(amount)} p/${per}`;
      priceValue = amount;
    }
  }

  // beschikbaarheid
  let availability: 'direct' | 'datum' = 'direct';
  let availabilityLabel = 'Direct beschikbaar';
  if (getRadio('availtype') === 'datum') {
    const date = val('zs-date');
    if (!date) {
      showError('Kies een datum vanaf wanneer het beschikbaar is.');
      return;
    }
    availability = 'datum';
    availabilityLabel = `Beschikbaar vanaf ${formatDateShort(date)}`;
  }

  // capaciteit
  const capRaw = val('zs-capacity');
  const capacity = capRaw ? Math.max(1, parseInt(capRaw, 10)) : undefined;

  // voorzieningen
  const amenities = Array.from(
    form!.querySelectorAll<HTMLInputElement>('input[name="amenity"]:checked'),
  ).map((c) => c.value);

  const input: NewListingInput = {
    title,
    provider,
    category,
    description,
    town,
    address: address || town,
    price,
    priceValue,
    availability,
    availabilityLabel,
    capacity,
    amenities,
    website: website || undefined,
    email: email || undefined,
    phone: phone || undefined,
  };

  addListing(input);
  showSuccess(input);
}

function showSuccess(input: NewListingInput) {
  const cat = CATEGORY_MAP[input.category];
  if (summary) {
    summary.innerHTML = `
      <div class="rounded-2xl border border-ink/10 bg-shell p-4 text-left">
        <div class="flex items-center justify-between gap-3">
          <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style="background:${
            cat.tint
          };color:${cat.color}">${icon(cat.icon, { size: 14 })} ${escapeHtml(cat.short)}</span>
          <span class="inline-flex items-center gap-1 rounded-full bg-coral-500/12 px-2.5 py-1 text-xs font-semibold text-coral-600">${icon(
            'clock',
            { size: 13 },
          )} In de wachtrij</span>
        </div>
        <div class="mt-3 font-display font-bold text-ink">${escapeHtml(input.title)}</div>
        <div class="text-sm text-mist">${escapeHtml(input.provider)} &middot; ${escapeHtml(input.town)}</div>
        <div class="mt-2 text-sm font-semibold text-sea-700">${escapeHtml(input.price)}</div>
      </div>`;
  }
  formWrap?.classList.add('hidden');
  success?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  form?.reset();
  priceFields?.classList.add('hidden');
  priceFields?.classList.remove('flex');
  dateField?.classList.add('hidden');
  amountField?.classList.remove('hidden');
  errorBox?.classList.add('hidden');
  success?.classList.add('hidden');
  formWrap?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
