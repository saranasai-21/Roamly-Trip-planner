import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateItineraryPatch, TripPlannerContext } from '@/lib/gemini';
import { AIPatchPlan } from '@/lib/types';

// Generate patch proposal
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        destination: true,
        days: {
          include: {
            city: true,
            items: true,
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    const context: TripPlannerContext = {
      tripId: trip.id,
      tripTitle: trip.title,
      destinationName: trip.destination.name,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      pace: trip.pace,
      dietary: trip.dietary,
      adults: trip.adults,
      days: trip.days.map((d) => ({
        dayNumber: d.dayNumber,
        city: d.city.name,
        items: d.items.map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          startTime: i.startTime,
          endTime: i.endTime,
          durationMinutes: i.durationMinutes,
          isLocked: i.isLocked,
          costMinor: i.costMinor,
          currency: i.currency,
        })),
      })),
    };

    const { plan, isLiveAi } = await generateItineraryPatch(prompt, context);

    return NextResponse.json({ plan, isLiveAi });
  } catch (error: any) {
    console.error('Error generating AI patch:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

// Transactionally apply accepted patch
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { plan } = (await req.json()) as { plan: AIPatchPlan };

    if (!plan || !plan.operations) {
      return NextResponse.json({ error: 'Plan is required.' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        days: {
          include: { items: true },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    // Save snapshot in TripRevision before applying changes
    const snapshotJson = JSON.stringify(trip.days);
    const revisionCount = await prisma.tripRevision.count({ where: { tripId: trip.id } });

    await prisma.tripRevision.create({
      data: {
        tripId: trip.id,
        revisionNumber: revisionCount + 1,
        summary: plan.summary,
        snapshotJson,
        changeType: 'ai_prompt',
      },
    });

    // Execute operations
    for (const op of plan.operations) {
      if (op.op === 'remove_item' && op.targetItemId) {
        // Protect locked items
        const item = await prisma.itineraryItem.findUnique({
          where: { id: op.targetItemId },
        });
        if (item && !item.isLocked) {
          await prisma.itineraryItem.delete({
            where: { id: op.targetItemId },
          });
        }
      }

      if (op.op === 'add_item' && op.itemData) {
        const targetDayNumber = op.dayNumber || 1;
        const targetDay = trip.days.find((d) => d.dayNumber === targetDayNumber) || trip.days[0];

        if (targetDay) {
          await prisma.itineraryItem.create({
            data: {
              tripId: trip.id,
              dayId: targetDay.id,
              type: op.itemData.type,
              title: op.itemData.title,
              startTime: op.itemData.startTime || '14:00',
              endTime: op.itemData.endTime || '16:00',
              durationMinutes: op.itemData.durationMinutes || 120,
              locationName: op.itemData.locationName || 'Local Sights',
              costMinor: op.itemData.costMinor || 0,
              currency: op.itemData.currency || 'USD',
              priceBasis: op.itemData.priceBasis || 'per_person',
              notes: op.itemData.notes || op.explanation,
              orderIndex: targetDay.items.length,
            },
          });
        }
      }
    }

    // Return freshly updated trip
    const updatedTrip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        destination: {
          include: {
            cities: {
              include: { activities: true, hotels: { include: { offers: true } } },
            },
          },
        },
        cities: {
          include: {
            city: {
              include: { activities: true, hotels: { include: { offers: true } } },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        days: {
          include: {
            city: true,
            items: {
              include: { activity: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
        stays: {
          include: { hotel: true },
        },
        bookings: true,
      },
    });

    return NextResponse.json({ success: true, trip: updatedTrip });
  } catch (error: any) {
    console.error('Error applying AI patch:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

// Undo recent revision
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const latestRevision = await prisma.tripRevision.findFirst({
      where: { tripId: params.id },
      orderBy: { revisionNumber: 'desc' },
    });

    if (!latestRevision) {
      return NextResponse.json({ error: 'No recent revisions available to undo.' }, { status: 404 });
    }

    const previousDaysSnapshot = JSON.parse(latestRevision.snapshotJson);

    // Delete current items and restore snapshot
    await prisma.itineraryItem.deleteMany({
      where: { tripId: params.id },
    });

    for (const snapDay of previousDaysSnapshot) {
      for (const item of snapDay.items) {
        await prisma.itineraryItem.create({
          data: {
            id: item.id,
            tripId: params.id,
            dayId: item.dayId,
            type: item.type,
            activityId: item.activityId || null,
            title: item.title,
            startTime: item.startTime,
            endTime: item.endTime,
            durationMinutes: item.durationMinutes,
            locationName: item.locationName,
            lat: item.lat,
            lng: item.lng,
            costMinor: item.costMinor,
            currency: item.currency,
            priceBasis: item.priceBasis,
            notes: item.notes,
            bookingStatus: item.bookingStatus,
            isLocked: item.isLocked,
            orderIndex: item.orderIndex,
          },
        });
      }
    }

    // Delete the revision we just rolled back
    await prisma.tripRevision.delete({
      where: { id: latestRevision.id },
    });

    return NextResponse.json({ success: true, message: 'Rolled back to previous revision snapshot.' });
  } catch (error: any) {
    console.error('Error rolling back revision:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

