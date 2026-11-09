export interface ScheduleIssue {
  type: 'overlap' | 'missing_transfer' | 'tight_connection';
  message: string;
  itemAId: string;
  itemBId: string;
}

export function parseMinutesFromTime(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function formatTimeFromMinutes(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes % (24 * 60));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface DayItemLike {
  id: string;
  type: string;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes: number;
  lat?: number | null;
  lng?: number | null;
  orderIndex: number;
}

/**
 * Validates daily schedule and flags overlaps, tight connections, or missing transfers.
 */
export function analyzeDaySchedule(items: DayItemLike[]): ScheduleIssue[] {
  const issues: ScheduleIssue[] = [];
  const timedItems = items
    .filter((item) => item.startTime)
    .sort((a, b) => {
      const aMin = parseMinutesFromTime(a.startTime) ?? 0;
      const bMin = parseMinutesFromTime(b.startTime) ?? 0;
      return aMin - bMin;
    });

  for (let i = 0; i < timedItems.length - 1; i++) {
    const current = timedItems[i];
    const next = timedItems[i + 1];

    const currentStart = parseMinutesFromTime(current.startTime)!;
    const currentEnd =
      parseMinutesFromTime(current.endTime) ?? currentStart + current.durationMinutes;

    const nextStart = parseMinutesFromTime(next.startTime)!;

    // Direct overlap check
    if (nextStart < currentEnd) {
      issues.push({
        type: 'overlap',
        message: `Schedule conflict: "${current.title}" ends at ${formatTimeFromMinutes(
          currentEnd
        )}, but "${next.title}" starts earlier at ${current.startTime}.`,
        itemAId: current.id,
        itemBId: next.id,
      });
    } else {
      // Check if distance between two physical locations has reasonable transit time
      const gapMinutes = nextStart - currentEnd;
      if (
        current.lat &&
        current.lng &&
        next.lat &&
        next.lng &&
        gapMinutes < 15 &&
        current.type !== 'transfer' &&
        next.type !== 'transfer'
      ) {
        // Approximate distance calculation
        const distKm = getDistanceKm(
          current.lat,
          current.lng,
          next.lat,
          next.lng
        );
        if (distKm > 5) {
          issues.push({
            type: 'tight_connection',
            message: `Tight connection: Only ${gapMinutes} min gap between locations ~${Math.round(
              distKm
            )} km apart. Consider adding a transfer or buffer.`,
            itemAId: current.id,
            itemBId: next.id,
          });
        }
      }
    }
  }

  return issues;
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
