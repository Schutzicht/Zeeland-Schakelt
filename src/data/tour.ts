// Rondleiding / presentatiemodus voor de live demo-meeting.
// Wordt door src/components/DemoTour.astro als JSON aan de client meegegeven.
// Toon van de teksten: kort en neutraal; de verkoopboodschap vertel je er
// zelf mondeling bij tijdens de meeting.

export interface TourStop {
  id: string;
  /** Groep voor het sprongmenu (inhoudsopgave). */
  group: string;
  /** Route zonder trailing slash. */
  path: string;
  title: string;
  body: string;
  /** Optionele CSS-selector die uitgelicht wordt met een spotlight. */
  selector?: string;
  /** Selectors die (indien aanwezig) geklikt worden voordat de stap toont, bv. een tab openen. */
  clickBefore?: string[];
  /** Plek van het kaartje op desktop. Standaard rechtsonder. */
  cardPos?: 'left' | 'right';
}

const PLATFORM = 'Het platform';
const SLIM = 'Slimme functies';
const MEEDOEN = 'Meedoen';
const AFRONDING = 'Afronding';

export const tourStops: TourStop[] = [
  {
    id: 'welkom',
    group: PLATFORM,
    path: '/',
    title: 'Start van de demo',
    body: 'Dit is Zeeland Schakelt. We lopen samen door het platform: het aanbod, je persoonlijke plan, het live dashboard en de community.',
  },
  {
    id: 'signature',
    group: PLATFORM,
    path: '/',
    selector: '.zs-build',
    title: 'De tunnel telt live af',
    body: 'De balk onderin de hero is de tunnel. Naarmate de afsluiting vordert telt hij live af en bouwt de bouwvakker de tunnel op. Je kunt het poppetje zelf slepen.',
  },
  {
    id: 'zoeken',
    group: PLATFORM,
    path: '/',
    selector: '[data-tour="hero-search"]',
    title: 'Meteen zoeken',
    body: 'Bezoekers zoeken vanaf de homepage direct op plaats, type en wat ze nodig hebben. Geen account nodig.',
  },
  {
    id: 'aanbod',
    group: PLATFORM,
    path: '/aanbod',
    selector: '[data-tour="filters"]',
    title: 'Het aanbod',
    body: 'Alle werkplekken, ruimtes en ritten op een interactieve kaart en in een lijst, met filters op plaats, type, prijs en de kant van de tunnel.',
  },
  {
    id: 'schakelplan',
    group: SLIM,
    path: '/schakelplan',
    selector: '#plan-form',
    title: 'Mijn Schakelplan',
    body: 'Vul je woon- en werkplaats in en krijg een persoonlijk plan met plekken dichtbij, plus je besparing in tijd, kilometers en CO2.',
  },
  {
    id: 'reismaatje',
    group: SLIM,
    path: '/schakelplan',
    clickBefore: ['#tab-btn-chat'],
    selector: '#tab-chat',
    cardPos: 'left',
    title: 'AI-reismaatje',
    body: 'Het reismaatje kent het hele aanbod. Typ gewoon wat je zoekt, het denkt met je mee en toont passende plekken.',
  },
  {
    id: 'dashboard',
    group: SLIM,
    path: '/dashboard',
    selector: '[data-tour="impact"]',
    title: 'De impact, live',
    body: 'Het live dashboard toont de impact: hoeveel mensen schakelen, en hoeveel tijd, kilometers en CO2 we samen besparen.',
  },
  {
    id: 'plaatsen',
    group: MEEDOEN,
    path: '/plaatsen',
    selector: '#zs-form',
    title: 'Plaats jouw aanbod',
    body: 'Aanbieders zetten hun plek er zelf op, in een paar minuten en zonder account. Een marktplaats die zichzelf vult.',
  },
  {
    id: 'community',
    group: MEEDOEN,
    path: '/community',
    selector: '[data-tour="channels"]',
    title: 'WhatsApp-community',
    body: 'Vanaf het platform stap je in de community, met kanalen voor werken, overnachten en carpoolen. Daar vinden mensen elkaar.',
  },
  {
    id: 'afronding',
    group: AFRONDING,
    path: '/',
    title: 'Afronding',
    body: 'Dit is de opzet en de werking. Teksten, namen en cijfers zijn voorbeelden; die vullen we samen met de werkgroep in zodra er akkoord is.',
  },
];
