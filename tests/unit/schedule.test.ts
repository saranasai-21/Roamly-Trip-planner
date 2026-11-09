import { describe, it, expect } from 'vitest';
import {
  parseMinutesFromTime,
  formatTimeFromMinutes,
  analyzeDaySchedule,
  getDistanceKm,
} from '@/lib/schedule';

describe('Schedule and Conflict Detection Domain Tests', () => {
  it('parses and formats 24h time strings correctly', () => {
    expect(parseMinutesFromTime('09:30')).toBe(570);
    expect(parseMinutesFromTime('14:45')).toBe(885);
    expect(parseMinutesFromTime(null)).toBeNull();

    expect(formatTimeFromMinutes(570)).toBe('09:30');
    expect(formatTimeFromMinutes(885)).toBe('14:45');
  });

  it('detects overlapping activities', () => {
    const items = [
      {
        id: '1',
        type: 'activity',
        title: 'Morning Temple Tour',
        startTime: '09:00',
        endTime: '11:30',
        durationMinutes: 150,
        orderIndex: 0,
      },
      {
        id: '2',
        type: 'activity',
        title: 'Cooking Class',
        startTime: '10:30', // Overlaps with 09:00 - 11:30!
        endTime: '13:00',
        durationMinutes: 150,
        orderIndex: 1,
      },
    ];

    const issues = analyzeDaySchedule(items);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('overlap');
    expect(issues[0].itemAId).toBe('1');
    expect(issues[0].itemBId).toBe('2');
  });

  it('detects tight connection when locations are far apart with minimal transit gap', () => {
    // Ubud (-8.5069, 115.2625) to Uluwatu (-8.8291, 115.0849) ~40km away
    const items = [
      {
        id: 'ubud-act',
        type: 'activity',
        title: 'Monkey Forest Ubud',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        lat: -8.5188,
        lng: 115.2582,
        orderIndex: 0,
      },
      {
        id: 'uluwatu-act',
        type: 'activity',
        title: 'Uluwatu Sunset Dance',
        startTime: '12:05', // Only 5 minute gap for 40km distance!
        endTime: '14:00',
        durationMinutes: 115,
        lat: -8.8291,
        lng: 115.0849,
        orderIndex: 1,
      },
    ];

    const issues = analyzeDaySchedule(items);
    expect(issues.some((i) => i.type === 'tight_connection')).toBe(true);
  });
});

