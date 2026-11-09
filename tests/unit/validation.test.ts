import { describe, it, expect } from 'vitest';

describe('Traveller and Questionnaire Validation Domain Tests', () => {
  function validateTravelers(travelers: {
    adults: number;
    elders: number;
    infants: number;
    children: number;
  }): { valid: boolean; error?: string } {
    if ((travelers.adults || 0) + (travelers.elders || 0) < 1) {
      return {
        valid: false,
        error: 'At least one adult (18–59) or elder (60+) is required.',
      };
    }
    if ((travelers.infants || 0) > 0 && (travelers.adults || 0) < 1) {
      return {
        valid: false,
        error: 'Infants (0–2) must be accompanied by an adult.',
      };
    }
    return { valid: true };
  }

  function validateDates(startDateStr: string, endDateStr: string): {
    valid: boolean;
    durationDays?: number;
    error?: string;
  } {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }
    if (end <= start) {
      return { valid: false, error: 'Return date must be strictly after start date' };
    }

    const durationDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return { valid: true, durationDays };
  }

  it('rejects booking with 0 adults and 0 elders', () => {
    const res = validateTravelers({ adults: 0, elders: 0, infants: 0, children: 2 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('adult');
  });

  it('rejects infants without an adult', () => {
    const res = validateTravelers({ adults: 0, elders: 1, infants: 1, children: 0 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Infants');
  });

  it('accepts valid family with adults and children', () => {
    const res = validateTravelers({ adults: 2, elders: 0, infants: 0, children: 1 });
    expect(res.valid).toBe(true);
  });

  it('disallows invalid date ranges', () => {
    // End before start
    const res = validateDates('2026-12-10', '2026-12-05');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('strictly after');

    // Same day
    const res2 = validateDates('2026-12-10', '2026-12-10');
    expect(res2.valid).toBe(false);

    // Valid range
    const res3 = validateDates('2026-12-01', '2026-12-08');
    expect(res3.valid).toBe(true);
    expect(res3.durationDays).toBe(7);
  });
});

