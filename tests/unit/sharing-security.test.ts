import { describe, it, expect } from 'vitest';

describe('Public Read-Only Sharing Scrubbing & Security Tests', () => {
  function scrubTripForPublicShare(rawTrip: any): any {
    return {
      ...rawTrip,
      user: null, // Scrub user identity & phone
      days: rawTrip.days.map((day: any) => ({
        ...day,
        notes: null, // Scrub private day notes
        items: day.items.map((item: any) => ({
          ...item,
          notes: null, // Scrub private item notes
          metadata: '{}', // Scrub private vouchers, references & flight details
        })),
      })),
      stays: rawTrip.stays.map((stay: any) => ({
        ...stay,
        bookingReference: null, // Scrub booking confirmation ref
        notes: null,
      })),
      bookings: rawTrip.bookings.map((booking: any) => ({
        ...booking,
        confirmationReference: null,
        notes: null,
      })),
    };
  }

  it('completely scrubs user identity, phone numbers, and booking references', () => {
    const rawTrip = {
      id: 'trip-123',
      title: 'Secret Family Vacation',
      user: {
        id: 'user-1',
        name: 'Alex Morgan',
        phone: '+15551234567',
        email: 'alex@private.test',
      },
      days: [
        {
          id: 'day-1',
          notes: 'Private note: Remember to pick up medicines in Ubud',
          items: [
            {
              id: 'item-1',
              title: 'Villa Stay',
              notes: 'Door access code is 9876',
              metadata: JSON.stringify({ reference: 'CONF-88412' }),
            },
          ],
        },
      ],
      stays: [
        {
          id: 'stay-1',
          bookingReference: 'HOTEL-CONF-9921',
          notes: 'Special request: Upper floor honeymoon suite',
        },
      ],
      bookings: [
        {
          id: 'book-1',
          confirmationReference: 'FLIGHT-PNR-7744',
          notes: 'Credit card charged ending 4412',
        },
      ],
    };

    const scrubbed = scrubTripForPublicShare(rawTrip);

    // User is completely stripped
    expect(scrubbed.user).toBeNull();

    // Day notes stripped
    expect(scrubbed.days[0].notes).toBeNull();

    // Item private notes and metadata voucher references stripped
    expect(scrubbed.days[0].items[0].notes).toBeNull();
    expect(scrubbed.days[0].items[0].metadata).toBe('{}');

    // Stays booking ref and private notes stripped
    expect(scrubbed.stays[0].bookingReference).toBeNull();
    expect(scrubbed.stays[0].notes).toBeNull();

    // Bookings references stripped
    expect(scrubbed.bookings[0].confirmationReference).toBeNull();
    expect(scrubbed.bookings[0].notes).toBeNull();
  });
});

