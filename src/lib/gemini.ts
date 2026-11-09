import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIPatchPlan, AIPatchOperation } from './types';
import { prisma } from './prisma';

export interface TripPlannerContext {
  tripId: string;
  tripTitle: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  pace: string;
  dietary: string;
  adults: number;
  days: Array<{
    dayNumber: number;
    city: string;
    items: Array<{
      id: string;
      title: string;
      type: string;
      startTime?: string | null;
      endTime?: string | null;
      durationMinutes: number;
      isLocked: boolean;
      costMinor: number;
      currency: string;
    }>;
  }>;
}

/**
 * Deterministic demo planner used when GEMINI_API_KEY is not configured
 * or for offline / test environments. Clearly labelled.
 */
export async function runDeterministicDemoPlanner(
  prompt: string,
  context: TripPlannerContext
): Promise<{ plan: AIPatchPlan; isLiveAi: boolean }> {
  const normalized = prompt.toLowerCase();

  // 1. Relax day prompt (e.g. "make day 2 more relaxed" or "more relaxed")
  if (normalized.includes('relax') || normalized.includes('slow down') || normalized.includes('spread')) {
    // Find target day (default Day 2 or mentioned day)
    let targetDayNum = 2;
    const match = prompt.match(/day\s*(\d+)/i);
    if (match) targetDayNum = parseInt(match[1], 10);

    const targetDay = context.days.find((d) => d.dayNumber === targetDayNum) || context.days[0];
    const unlockedItems = targetDay ? targetDay.items.filter((item) => !item.isLocked) : [];

    const operations: AIPatchOperation[] = [];

    if (unlockedItems.length >= 1) {
      const itemToDrop = unlockedItems[unlockedItems.length - 1];
      operations.push({
        op: 'remove_item',
        dayNumber: targetDay.dayNumber,
        targetItemId: itemToDrop.id,
        explanation: `Removed "${itemToDrop.title}" from Day ${targetDay.dayNumber} to create a 3-hour leisure window and reduce midday transit stress.`,
        costImpactMinor: -itemToDrop.costMinor,
      });

      operations.push({
        op: 'add_item',
        dayNumber: targetDay.dayNumber,
        itemData: {
          type: 'free_time',
          title: 'Afternoon Tropical Pool & Spa Leisure',
          startTime: '15:30',
          endTime: '17:30',
          durationMinutes: 120,
          locationName: 'Resort Grounds',
          costMinor: 0,
          currency: 'USD',
          priceBasis: 'per_group',
          notes: 'Unscheduled relaxation window for swimming, reading, and tea.',
        },
        explanation: 'Inserted 2-hour restful wellness buffer before evening dinner.',
        costImpactMinor: 0,
      });
    }

    return {
      isLiveAi: false,
      plan: {
        summary: `Deterministic Demo: Rebalanced Day ${targetDay.dayNumber} for a more relaxed pace.`,
        reasoning: 'Analyzed your current schedule density. Removing the late afternoon commitment and inserting a dedicated pool and relaxation window creates a balanced 3.5-hour pace between morning exploration and evening dinner.',
        operations,
        estimatedTotalDifferenceMinor: operations.reduce((sum, o) => sum + (o.costImpactMinor || 0), 0),
      },
    };
  }

  // 2. Replace activity prompt
  if (normalized.includes('replace') || normalized.includes('swap') || normalized.includes('alternative')) {
    const targetDay = context.days[1] || context.days[0];
    const unlockedActivity = targetDay.items.find((i) => i.type === 'activity' && !i.isLocked);

    if (unlockedActivity) {
      return {
        isLiveAi: false,
        plan: {
          summary: `Deterministic Demo: Replaced "${unlockedActivity.title}" with Authentic Cooking Workshop.`,
          reasoning: 'Identified a suitable cultural swap that maintains your regional itinerary flow while offering hands-on engagement with local cuisine.',
          operations: [
            {
              op: 'remove_item',
              dayNumber: targetDay.dayNumber,
              targetItemId: unlockedActivity.id,
              explanation: `Removed previous activity: ${unlockedActivity.title}`,
              costImpactMinor: -unlockedActivity.costMinor,
            },
            {
              op: 'add_item',
              dayNumber: targetDay.dayNumber,
              itemData: {
                type: 'activity',
                title: 'Traditional Balinese Herb & Spice Cooking Class',
                startTime: unlockedActivity.startTime || '11:00',
                endTime: '14:30',
                durationMinutes: 210,
                locationName: 'Laplapan Cultural Village',
                costMinor: 2500,
                currency: 'USD',
                priceBasis: 'per_person',
                notes: 'Includes morning garden spice gathering and 5-course organic lunch.',
              },
              explanation: 'Added authentic immersive culinary workshop with lunch included.',
              costImpactMinor: 2500,
            },
          ],
          estimatedTotalDifferenceMinor: 2500 - unlockedActivity.costMinor,
        },
      };
    }
  }

  // 3. Cheaper alternatives / budget optimization
  if (normalized.includes('cheap') || normalized.includes('budget') || normalized.includes('cost')) {
    return {
      isLiveAi: false,
      plan: {
        summary: 'Deterministic Demo: Identified budget-friendly optimizations.',
        reasoning: 'Reviewed all scheduled experiences across your trip. Recommending swapping commercial excursions for scenic self-guided heritage trails.',
        operations: [
          {
            op: 'add_item',
            dayNumber: 1,
            itemData: {
              type: 'activity',
              title: 'Self-Guided Campuhan River Valley Ridge Walk',
              startTime: '16:30',
              endTime: '18:00',
              durationMinutes: 90,
              locationName: 'Campuhan Ridge, Ubud',
              costMinor: 0,
              currency: 'USD',
              priceBasis: 'per_person',
              notes: 'Completely free public nature walk with panoramic jungle gorge views.',
            },
            explanation: 'Replaced paid commercial excursion with zero-cost scenic nature trail.',
            costImpactMinor: -4500,
          },
        ],
        estimatedTotalDifferenceMinor: -4500,
      },
    };
  }

  // 4. Dietary preferences / vegetarian
  if (normalized.includes('vegetarian') || normalized.includes('vegan') || normalized.includes('diet')) {
    return {
      isLiveAi: false,
      plan: {
        summary: 'Deterministic Demo: Updated meal stops to certified plant-forward spots.',
        reasoning: 'Configured your culinary stops with celebrated organic farm-to-table eateries featuring extensive vegan and vegetarian tasting menus.',
        operations: [
          {
            op: 'add_item',
            dayNumber: 2,
            itemData: {
              type: 'meal',
              title: 'Organic Garden Lunch at Moksa Plant-based Cuisine',
              startTime: '12:30',
              endTime: '14:00',
              durationMinutes: 90,
              locationName: 'Moksa Ubud Permaculture Garden',
              costMinor: 1800,
              currency: 'USD',
              priceBasis: 'per_person',
              notes: '100% plant-based permaculture farm restaurant overlooking edible gardens.',
            },
            explanation: 'Scheduled plant-based dining reservation aligned with dietary preferences.',
            costImpactMinor: 1800,
          },
        ],
        estimatedTotalDifferenceMinor: 1800,
      },
    };
  }

  // 5. General Q&A fallback / itinerary enhancement
  return {
    isLiveAi: false,
    plan: {
      summary: `Deterministic Demo: Evaluated request "${prompt}".`,
      reasoning: `In demo mode, Roamly analyzes your ${context.destinationName} trip parameters (adults: ${context.adults}, pace: ${context.pace}, dietary: ${context.dietary}). Connect a Google Gemini API key to activate live reasoning.`,
      operations: [],
      estimatedTotalDifferenceMinor: 0,
    },
  };
}

/**
 * Server-side AI planning pipeline:
 * Uses Gemini API if configured; otherwise gracefully falls back to labelled deterministic planner.
 */
export async function generateItineraryPatch(
  prompt: string,
  context: TripPlannerContext,
  customApiKey?: string | null
): Promise<{ plan: AIPatchPlan; isLiveAi: boolean }> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return runDeterministicDemoPlanner(prompt, context);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelId = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const systemPrompt = `You are Roamly's Senior Travel Architect.
You must return ONLY a valid JSON object matching this TypeScript interface:
{
  "summary": string,
  "reasoning": string,
  "operations": Array<{
    "op": "add_item" | "remove_item" | "update_item" | "reorder_items" | "adjust_pace",
    "dayNumber"?: number,
    "targetItemId"?: string,
    "itemData"?: {
      "type": "activity" | "meal" | "flight" | "transfer" | "stay" | "free_time",
      "title": string,
      "startTime"?: string,
      "endTime"?: string,
      "durationMinutes": number,
      "locationName"?: string,
      "costMinor"?: number,
      "currency"?: string,
      "priceBasis"?: "per_person" | "per_group" | "per_room_night" | "per_booking",
      "notes"?: string
    },
    "explanation": string,
    "costImpactMinor"?: number
  }>,
  "estimatedTotalDifferenceMinor": number
}

Rules:
1. NEVER modify, delete, or overwrite items where isLocked is true.
2. Use sensible 24h times like "09:30" or "14:00".
3. Provide realistic minor unit costs (e.g. $25.00 is 2500 in USD).
4. Do not include markdown codeblocks or extra text outside JSON.`;

    const userPrompt = `Current Trip Context:
Destination: ${context.destinationName}
Dates: ${context.startDate} to ${context.endDate}
Travelers: ${context.adults} adults
Pace: ${context.pace}
Dietary: ${context.dietary}
Existing Schedule:
${JSON.stringify(context.days, null, 2)}

User Request: "${prompt}"

Produce a structured patch JSON to update this trip according to the request.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as AIPatchPlan;

    // Validate patch against locked items
    const lockedIds = new Set(
      context.days.flatMap((d) => d.items.filter((i) => i.isLocked).map((i) => i.id))
    );

    const safeOperations = parsed.operations.filter((op) => {
      if (op.targetItemId && lockedIds.has(op.targetItemId)) {
        console.warn(`Prevented AI from modifying locked item ${op.targetItemId}`);
        return false;
      }
      return true;
    });

    return {
      isLiveAi: true,
      plan: {
        ...parsed,
        operations: safeOperations,
      },
    };
  } catch (error) {
    console.warn('Gemini API call failed or encountered rate limit. Falling back to deterministic planner:', error);
    return runDeterministicDemoPlanner(prompt, context);
  }
}
