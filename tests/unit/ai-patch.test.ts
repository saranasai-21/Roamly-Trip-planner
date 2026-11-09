import { describe, it, expect } from 'vitest';
import { runDeterministicDemoPlanner, TripPlannerContext } from '@/lib/gemini';

describe('AI Planner and Patch Safety Tests', () => {
  const dummyContext: TripPlannerContext = {
    tripId: 'test-trip-1',
    tripTitle: 'Test Trip',
    destinationName: 'Bali',
    startDate: '2026-12-01',
    endDate: '2026-12-07',
    pace: 'balanced',
    dietary: 'none',
    adults: 2,
    days: [
      {
        dayNumber: 1,
        city: 'Ubud',
        items: [
          {
            id: 'item-1',
            title: 'Airport Transfer',
            type: 'transfer',
            startTime: '10:00',
            durationMinutes: 90,
            isLocked: true, // LOCKED ITEM
            costMinor: 2500,
            currency: 'USD',
          },
        ],
      },
      {
        dayNumber: 2,
        city: 'Ubud',
        items: [
          {
            id: 'item-2',
            title: 'Tirta Empul Water Purification',
            type: 'activity',
            startTime: '09:00',
            durationMinutes: 120,
            isLocked: true, // LOCKED ITEM
            costMinor: 640,
            currency: 'USD',
          },
          {
            id: 'item-3',
            title: 'Ubud Cooking Class',
            type: 'activity',
            startTime: '13:00',
            durationMinutes: 180,
            isLocked: false, // UNLOCKED ITEM
            costMinor: 4000,
            currency: 'USD',
          },
          {
            id: 'item-4',
            title: 'Campuhan Ridge Walk',
            type: 'activity',
            startTime: '17:00',
            durationMinutes: 90,
            isLocked: false,
            costMinor: 0,
            currency: 'USD',
          },
        ],
      },
    ],
  };

  it('runs deterministic demo planner for "make day 2 relaxed"', async () => {
    const result = await runDeterministicDemoPlanner(
      'Make day 2 more relaxed',
      dummyContext
    );

    expect(result.isLiveAi).toBe(false);
    expect(result.plan.summary).toContain('Day 2');
    expect(result.plan.operations.length).toBeGreaterThan(0);

    // Ensure locked item-2 was NOT targeted for removal!
    const removedLocked = result.plan.operations.some(
      (op) => op.op === 'remove_item' && op.targetItemId === 'item-2'
    );
    expect(removedLocked).toBe(false);
  });

  it('runs deterministic demo planner for vegetarian dining request', async () => {
    const result = await runDeterministicDemoPlanner(
      'Incorporate strictly vegetarian dining',
      dummyContext
    );

    expect(result.isLiveAi).toBe(false);
    expect(result.plan.summary.toLowerCase()).toContain('plant');
    expect(result.plan.operations.some((op) => op.itemData?.type === 'meal')).toBe(true);
  });
});
