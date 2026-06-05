import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { SEED_LISTINGS } from '../../data/listings';

// On-demand gerenderd (de rest van de site blijft static).
export const prerender = false;

// Alias die altijd naar de huidige stabiele Flash wijst, zodat dit niet opnieuw breekt.
const MODEL = 'gemini-flash-latest';

type ChatTurn = { role: 'user' | 'bot'; text: string };

function apiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
}

// Compacte aanbod-context: alleen wat het model nodig heeft om te adviseren.
function aanbodContext(): string {
  return SEED_LISTINGS.filter((l) => l.status === 'goedgekeurd')
    .map((l) => {
      const kant = l.region === 'zuid' ? 'Zeeuws-Vlaanderen' : 'Walcheren/Bevelanden';
      return `- ${l.title} | ${l.provider} | ${l.town} (${kant}) | ${l.category} | ${l.price}${l.free ? ' | gratis' : ''}`;
    })
    .join('\n');
}

const SYSTEM = `Je bent het "reismaatje" van Zeeland Schakelt, een platform rond de afsluiting van de Westerscheldetunnel (dicht van januari t/m april 2027).
Doel: forenzen en inwoners helpen om tijdens de afsluiting dicht bij huis te werken, te ondernemen en samen te reizen, zodat ze de drukke omweg via de Sluiskiltunnel of het veer vermijden. Overnachten loopt niet via het platform maar via de WhatsApp-community; verwijs daarnaar als iemand een overnachting zoekt.

Belangrijk:
- De tunnel verbindt Zeeuws-Vlaanderen (zuid) met Walcheren/Bevelanden (noord). Advies bijna altijd: blijf op je eigen kant van de Westerschelde.
- Adviseer ALLEEN plekken uit het meegegeven aanbod. Verzin nooit locaties, prijzen of namen.
- Past er niets? Zeg dat eerlijk en wijs naar de WhatsApp-community (/community) of het aanbod (/aanbod).
- Schrijf in het Nederlands, warm en concreet, 2 tot 4 zinnen. Geen markdown, geen opsommingstekens, geen emoji, geen aandachtsstreepjes.
- Noem hooguit 2 a 3 concrete plekken bij naam; de bijpassende kaartjes worden los onder je bericht getoond.`;

function buildPrompt(message: string, history: ChatTurn[]): string {
  const hist = history
    .slice(-6)
    .map((t) => `${t.role === 'user' ? 'Bezoeker' : 'Reismaatje'}: ${t.text}`)
    .join('\n');
  return [
    SYSTEM,
    `\nBeschikbaar aanbod:\n${aanbodContext()}`,
    hist ? `\nGesprek tot nu toe:\n${hist}` : '',
    `\nNieuwe vraag van de bezoeker: ${message}`,
    `\nReismaatje:`,
  ]
    .filter(Boolean)
    .join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  const key = apiKey();
  if (!key) {
    return json({ error: 'no-key' }, 503);
  }

  let message = '';
  let history: ChatTurn[] = [];
  try {
    const body = await request.json();
    message = String(body?.message ?? '').slice(0, 600).trim();
    if (Array.isArray(body?.history)) {
      history = body.history
        .filter((t: any) => t && (t.role === 'user' || t.role === 'bot') && typeof t.text === 'string')
        .map((t: any) => ({ role: t.role, text: String(t.text).slice(0, 600) }));
    }
  } catch {
    return json({ error: 'bad-request' }, 400);
  }
  if (!message) return json({ error: 'empty' }, 400);

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(message, history),
      config: {
        temperature: 0.6,
        maxOutputTokens: 500,
        // Geen "thinking"-tokens: die zouden het antwoordbudget opeten en de reactie afkappen.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const reply = (response.text ?? '').trim();
    if (!reply) return json({ error: 'empty-reply' }, 502);
    return json({ reply });
  } catch (err) {
    console.error('[maatje] gemini error', err);
    return json({ error: 'gemini-failed' }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
