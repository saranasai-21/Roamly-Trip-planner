export type UserRole = 'customer' | 'expert' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

export type OccasionType =
  | 'leisure'
  | 'birthday'
  | 'family_vacation'
  | 'honeymoon'
  | 'anniversary'
  | 'bachelor';

export type PaceType = 'relaxed' | 'balanced' | 'packed';

export type DietaryType = 'vegetarian' | 'non_veg' | 'egg' | 'vegan' | 'halal' | 'none';

export type ItineraryItemType =
  | 'activity'
  | 'meal'
  | 'flight'
  | 'transfer'
  | 'stay'
  | 'free_time';

export type PriceBasis = 'per_person' | 'per_group' | 'per_room_night' | 'per_booking';

export type BookingStatus =
  | 'planned'
  | 'shortlisted'
  | 'enquiry_sent'
  | 'awaiting_confirmation'
  | 'booked'
  | 'cancelled';

export interface QuestionnaireDraft {
  adults: number;
  children: number;
  infants: number;
  elders: number;
  occasion?: OccasionType;
  startDate?: string; // ISO date string
  endDate?: string;
  destinationSlug?: string;
  selectedCitySlugs?: string[];
  departureAirport?: string;
  returnAirport?: string;
  pace: PaceType;
  dietary: DietaryType;
  budgetTier?: 'economy' | 'comfort' | 'luxury';
  interests?: string[];
}

export interface AIPatchOperation {
  op: 'add_item' | 'remove_item' | 'update_item' | 'reorder_items' | 'adjust_pace';
  dayNumber?: number;
  targetItemId?: string;
  itemData?: {
    type: ItineraryItemType;
    title: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    locationName?: string;
    activityId?: string;
    costMinor?: number;
    currency?: string;
    priceBasis?: PriceBasis;
    notes?: string;
  };
  explanation: string;
  costImpactMinor?: number;
}

export interface AIPatchPlan {
  summary: string;
  reasoning: string;
  operations: AIPatchOperation[];
  estimatedTotalDifferenceMinor: number;
}

export interface CurrencyRate {
  code: string;
  symbol: string;
  rateToUSD: number; // e.g. IDR = 15500, EUR = 0.92, GBP = 0.78
  minorUnitFactor: number; // 100 for USD/EUR/GBP (cents), 1 for IDR/JPY
}

