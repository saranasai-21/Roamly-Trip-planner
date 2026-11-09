import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  convertCurrency,
  computeItemTotalCost,
  SUPPORTED_CURRENCIES,
} from '@/lib/money';

describe('Currency and Budget Math Domain Tests', () => {
  it('formats minor units accurately into major units with symbol', () => {
    // 2500 cents USD = $25.00
    expect(formatCurrency(2500, 'USD')).toBe('$25.00');
    // JPY has minor factor 1
    expect(formatCurrency(1500, 'JPY')).toBe('¥1,500');
    // IDR
    expect(formatCurrency(5000000, 'IDR')).toBe('Rp50,000.00');
  });

  it('converts currencies correctly using exchange rates', () => {
    // $100 USD (10000 minor) to USD
    expect(convertCurrency(10000, 'USD', 'USD')).toBe(10000);

    // $100 USD to EUR (rate 0.92) -> €92.00 (9200 minor)
    expect(convertCurrency(10000, 'USD', 'EUR')).toBe(9200);

    // $100 USD to JPY (rate 153, factor 1) -> ¥15300
    expect(convertCurrency(10000, 'USD', 'JPY')).toBe(15300);
  });

  it('computes line-item total based on price basis', () => {
    // Per person: $20.00 each for 4 travelers = $80.00
    const perPerson = computeItemTotalCost(
      2000,
      'USD',
      'per_person',
      { adults: 2, children: 2 },
      'USD'
    );
    expect(perPerson.totalMinor).toBe(8000);
    expect(perPerson.perPersonMinor).toBe(2000);

    // Per group: $50.00 flat for 4 travelers = $50.00 ($12.50 / person)
    const perGroup = computeItemTotalCost(
      5000,
      'USD',
      'per_group',
      { adults: 2, children: 2 },
      'USD'
    );
    expect(perGroup.totalMinor).toBe(5000);
    expect(perGroup.perPersonMinor).toBe(1250);

    // Per room night: $150.00 / night * 2 rooms * 3 nights = $900.00
    const perRoomNight = computeItemTotalCost(
      15000,
      'USD',
      'per_room_night',
      { adults: 4, rooms: 2, nights: 3 },
      'USD'
    );
    expect(perRoomNight.totalMinor).toBe(90000);
    expect(perRoomNight.perPersonMinor).toBe(22500);
  });
});

