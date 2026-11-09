import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const sourceTrip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        cities: true,
        days: {
          include: { items: true },
        },
        stays: true,
      },
    });

    if (!sourceTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const duplicatedTrip = await prisma.trip.create({
      data: {
        title: `${sourceTrip.title} (Customised)`,
        destinationId: sourceTrip.destinationId,
        userId: user?.id || null,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        nights: sourceTrip.nights,
        adults: sourceTrip.adults,
        children: sourceTrip.children,
        infants: sourceTrip.infants,
        elders: sourceTrip.elders,
        occasion: sourceTrip.occasion,
        pace: sourceTrip.pace,
        dietary: sourceTrip.dietary,
        status: 'active',
        departureAirport: sourceTrip.departureAirport,
        returnAirport: sourceTrip.returnAirport,
        isPublic: false,
        currency: sourceTrip.currency,
      },
    });

    // Duplicate cities
    for (const tc of sourceTrip.cities) {
      await prisma.tripCity.create({
        data: {
          tripId: duplicatedTrip.id,
          cityId: tc.cityId,
          nights: tc.nights,
          orderIndex: tc.orderIndex,
        },
      });
    }

    // Duplicate days and items
    for (const day of sourceTrip.days) {
      const clonedDay = await prisma.tripDay.create({
        data: {
          tripId: duplicatedTrip.id,
          dayNumber: day.dayNumber,
          date: day.date,
          cityId: day.cityId,
          title: day.title,
          notes: day.notes,
        },
      });

      for (const item of day.items) {
        await prisma.itineraryItem.create({
          data: {
            tripId: duplicatedTrip.id,
            dayId: clonedDay.id,
            type: item.type,
            activityId: item.activityId,
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
            bookingStatus: 'planned',
            isLocked: item.isLocked,
            orderIndex: item.orderIndex,
          },
        });
      }
    }

    // Duplicate stays
    for (const stay of sourceTrip.stays) {
      await prisma.staySelection.create({
        data: {
          tripId: duplicatedTrip.id,
          cityId: stay.cityId,
          hotelId: stay.hotelId,
          offerId: stay.offerId,
          roomType: stay.roomType,
          provider: stay.provider,
          totalPriceMinor: stay.totalPriceMinor,
          currency: stay.currency,
          nights: stay.nights,
          checkInDate: stay.checkInDate,
          checkOutDate: stay.checkOutDate,
          bookingStatus: 'shortlisted',
        },
      });
    }

    return NextResponse.json({
      success: true,
      tripId: duplicatedTrip.id,
    });
  } catch (error: any) {
    console.error('Error duplicating trip:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
