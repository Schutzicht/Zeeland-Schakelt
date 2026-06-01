// Centrale datatypes voor Zeeland Schakelt.
// Bewust framework-onafhankelijk gehouden zodat de seed-data en de
// localStorage-laag later 1-op-1 vervangen kunnen worden door een
// echte database (bijv. Supabase) zonder de UI aan te raken.

export type CategoryId = 'werkplek' | 'vergaderruimte' | 'overnachting' | 'carpool';

export type Region = 'noord' | 'zuid';

export type ListingStatus = 'goedgekeurd' | 'wachtrij' | 'afgewezen';

export interface Listing {
  id: string;
  title: string;
  provider: string;
  category: CategoryId;
  description: string;
  town: string;
  address: string;
  lat: number;
  lng: number;
  region: Region;
  /** Toon-prijs zoals "Gratis", "€12,50 p/dag", "Op aanvraag" */
  price: string;
  /** Numerieke prijs voor filteren; 0 = gratis */
  priceValue: number;
  free: boolean;
  /** 'direct' = nu beschikbaar, 'datum' = vanaf een moment */
  availability: 'direct' | 'datum';
  availabilityLabel: string;
  capacity?: number;
  amenities: string[];
  /** Pad naar editorial beeld; ontbreekt bij gebruikersinzendingen (valt terug op categorie-beeld) */
  image?: string;
  website?: string;
  email?: string;
  phone?: string;
  status: ListingStatus;
  featured?: boolean;
  /** ISO-datum van aanmelden (alleen bij gebruikersinzendingen) */
  submittedAt?: string;
  /** true wanneer aangemeld via het platform i.p.v. seed */
  userSubmitted?: boolean;
}

export type NewListingInput = Omit<
  Listing,
  'id' | 'status' | 'lat' | 'lng' | 'region' | 'free' | 'submittedAt' | 'userSubmitted' | 'featured' | 'image'
>;
