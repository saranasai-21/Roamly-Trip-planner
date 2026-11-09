import { CurrencyRate, PriceBasis } from './types';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', rateToUSD: 1.0, minorUnitFactor: 100 },
  EUR: { code: 'EUR', symbol: '€', rateToUSD: 0.92, minorUnitFactor: 100 },
  GBP: { code: 'GBP', symbol: '£', rateToUSD: 0.79, minorUnitFactor: 100 },
  AUD: { code: 'AUD', symbol: 'A$', rateToUSD: 1.52, minorUnitFactor: 100 },
  IDR: { code: 'IDR', symbol: 'Rp', rateToUSD: 15600, minorUnitFactor: 100 },
  JPY: { code: 'JPY', symbol: '¥', rateToUSD: 153, minorUnitFactor: 1 },
  THB: { code: 'THB', symbol: '฿', rateToUSD: 34.5, minorUnitFactor: 100 },
};

export const EXCHANGE_RATE_TIMESTAMP = '2026-11-01T00:00:00Z';

/**
 * Formats minor units (e.g. cents) into localized formatted currency string.
 */
export function formatCurrency(
  amountMinor: number,
  currencyCode: string = 'USD'
): string {
  const curr = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()] || SUPPORTED_CURRENCIES.USD;
  const majorAmount = amountMinor / curr.minorUnitFactor;

  if (curr.minorUnitFactor === 1) {
    return `${curr.symbol}${Math.round(majorAmount).toLocaleString()}`;
  }

  return `${curr.symbol}${majorAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts minor units from source currency to target currency using standard pegged rates.
 */
export function convertCurrency(
  amountMinor: number,
  fromCode: string,
  toCode: string
): number {
  if (fromCode.toUpperCase() === toCode.toUpperCase()) return amountMinor;

  const fromCurr = SUPPORTED_CURRENCIES[fromCode.toUpperCase()] || SUPPORTED_CURRENCIES.USD;
  const toCurr = SUPPORTED_CURRENCIES[toCode.toUpperCase()] || SUPPORTED_CURRENCIES.USD;

  // Convert source minor to USD major
  const amountUSD = (amountMinor / fromCurr.minorUnitFactor) / fromCurr.rateToUSD;

  // Convert USD major to target minor
  const targetMajor = amountUSD * toCurr.rateToUSD;
  return Math.round(targetMajor * toCurr.minorUnitFactor);
}

/**
 * Computes line-item cost in target currency given priceBasis, traveller count, and room count.
 */
export function computeItemTotalCost(
  costMinor: number,
  currency: string,
  priceBasis: PriceBasis,
  options: {
    adults: number;
    children?: number;
    rooms?: number;
    nights?: number;
  },
  targetCurrency: string = 'USD'
): { totalMinor: number; perPersonMinor: number } {
  const totalTravellers = Math.max(1, options.adults + (options.children || 0));
  const rooms = Math.max(1, options.rooms || 1);
  const nights = Math.max(1, options.nights || 1);

  let rawTotalMinor = costMinor;

  switch (priceBasis) {
    case 'per_person':
      rawTotalMinor = costMinor * totalTravellers;
      break;
    case 'per_group':
    case 'per_booking':
      rawTotalMinor = costMinor;
      break;
    case 'per_room_night':
      rawTotalMinor = costMinor * rooms * nights;
      break;
  }

  const convertedTotal = convertCurrency(rawTotalMinor, currency, targetCurrency);
  const perPerson = Math.round(convertedTotal / totalTravellers);

  return {
    totalMinor: convertedTotal,
    perPersonMinor: perPerson,
  };
}
