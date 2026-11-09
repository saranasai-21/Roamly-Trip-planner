import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    const template = await prisma.tripTemplate.findUnique({
      where: { slug: params.slug },
      include: {
        destination: {
          include: {
            cities: {
              include: {
                activities: true,
              },
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Default start date = 14 days from now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + template.durationDays);

    // Parse cities JSON
    let citiesParsed: Array<{ cityName: string; citySlug: string; nights: number }> = [];
    try {
      citiesParsed = JSON.parse(template.citiesJson);
    } catch {
      citiesParsed = [];
    }

    // Create the cloned trip
    const clonedTrip = await prisma.trip.create({
      data: {
        title: `${template.title} (My Trip)`,
        destinationId: template.destinationId,
        userId: user?.id || null,
        startDate,
        endDate,
        nights: template.nights,
        adults: 2,
        children: 0,
        infants: 0,
        elders: 0,
        occasion: 'leisure',
        pace: 'balanced',
        dietary: 'none',
        status: 'active',
        departureAirport: 'DPS',
        returnAirport: 'DPS',
        isPublic: false,
        currency: 'USD',
      },
    });

    // Populate TripCities and TripDays
    let currentDayNumber = 1;
    const destCities = template.destination.cities;

    for (let cIdx = 0; cIdx < citiesParsed.length; cIdx++) {
      const cInfo = citiesParsed[cIdx];
      const matchCity =
        destCities.find((dc) => dc.slug === cInfo.citySlug || dc.name === cInfo.cityName) ||
        destCities[0];

      if (matchCity) {
        await prisma.tripCity.create({
          data: {
            tripId: clonedTrip.id,
            cityId: matchCity.id,
            nights: cInfo.nights,
            orderIndex: cIdx,
          },
        });

        // Create days for this city
        for (let d = 0; d < cInfo.nights; d++) {
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + (currentDayNumber - 1));

          const createdDay = await prisma.tripDay.create({
            data: {
              tripId: clonedTrip.id,
              dayNumber: currentDayNumber,
              date: dayDate,
              cityId: matchCity.id,
              title: `Day ${currentDayNumber} in ${matchCity.name}`,
            },
          });

          // Add 1 or 2 activities from this city
          const cityActivities = matchCity.activities;
          if (cityActivities.length > 0) {
            const act = cityActivities[d % cityActivities.length];
            await prisma.itineraryItem.create({
              data: {
                tripId: clonedTrip.id,
                dayId: createdDay.id,
                type: 'activity',
                activityId: act.id,
                title: act.title,
                startTime: '10:00',
                endTime: '12:30',
                durationMinutes: act.durationMinutes,
                locationName: act.address || matchCity.name,
                lat: act.lat,
                lng: act.lng,
                costMinor: 2500,
                priceBasis: 'per_person',
                orderIndex: 0,
              },
            });
          }

          currentDayNumber++;
        }
      }
    }

    // Ensure final departure day if needed
    if (currentDayNumber <= template.durationDays) {
      const finalCity = destCities[destCities.length - 1];
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + (currentDayNumber - 1));

      const lastDay = await prisma.tripDay.create({
        data: {
          tripId: clonedTrip.id,
          dayNumber: currentDayNumber,
          date: dayDate,
          cityId: finalCity.id,
          title: `Day ${currentDayNumber}: Farewell & Departure`,
        },
      });

      await prisma.itineraryItem.create({
        data: {
          tripId: clonedTrip.id,
          dayId: lastDay.id,
          type: 'transfer',
          title: 'Airport Transfer & Departure Flight',
          startTime: '14:00',
          endTime: '16:00',
          durationMinutes: 120,
          locationName: 'Airport',
          costMinor: 1500,
          priceBasis: 'per_group',
          orderIndex: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      tripId: clonedTrip.id,
    });
  } catch (error: any) {
    console.error('Error duplicating template:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
