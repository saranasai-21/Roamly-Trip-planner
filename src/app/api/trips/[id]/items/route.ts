import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      dayId,
      type = 'activity',
      activityId,
      title,
      startTime = '10:00',
      endTime,
      durationMinutes = 120,
      locationName,
      lat,
      lng,
      costMinor = 0,
      currency = 'USD',
      priceBasis = 'per_person',
      notes,
    } = body;

    if (!dayId || !title) {
      return NextResponse.json({ error: 'dayId and title are required.' }, { status: 400 });
    }

    const currentCount = await prisma.itineraryItem.count({
      where: { dayId },
    });

    const item = await prisma.itineraryItem.create({
      data: {
        tripId: params.id,
        dayId,
        type,
        activityId: activityId || null,
        title,
        startTime,
        endTime: endTime || null,
        durationMinutes: Number(durationMinutes),
        locationName: locationName || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        costMinor: Number(costMinor),
        currency,
        priceBasis,
        notes: notes || null,
        orderIndex: currentCount,
      },
      include: {
        activity: true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error creating itinerary item:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
