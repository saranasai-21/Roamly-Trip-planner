import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      destinationSlug = 'bali',
      selectedCitySlugs = [],
      startDate: rawStartDate,
      endDate: rawEndDate,
      adults = 2,
      children = 0,
      infants = 0,
      elders = 0,
      occasion = 'leisure',
      pace = 'balanced',
      dietary = 'none',
      departureAirport = 'DPS',
      returnAirport = 'DPS',
      interests = [],
    } = body;

    // Validate travellers: require adult or elder
    if ((adults || 0) + (elders || 0) < 1) {
      return NextResponse.json(
        { error: 'At least one adult (18-59) or elder (60+) is required.' },
        { status: 400 }
      );
    }

    // Dates validation
    const startDate = rawStartDate ? new Date(rawStartDate) : new Date(Date.now() + 14 * 86400000);
    const endDate = rawEndDate ? new Date(rawEndDate) : new Date(startDate.getTime() + 6 * 86400000);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after the start date.' },
        { status: 400 }
      );
    }

    const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
    const nights = Math.max(1, durationDays - 1);

    // Find destination
    const destination = await prisma.destination.findFirst({
      where: {
        OR: [{ slug: destinationSlug }, { name: { contains: destinationSlug } }],
      },
      include: {
        cities: {
          include: {
            activities: true,
            hotels: {
              include: { offers: true },
            },
          },
        },
      },
    });

    if (!destination) {
      return NextResponse.json({ error: 'Selected destination not found' }, { status: 404 });
    }

    // Filter or select cities
    let targetCities = destination.cities;
    if (selectedCitySlugs && selectedCitySlugs.length > 0) {
      const filtered = destination.cities.filter((c) => selectedCitySlugs.includes(c.slug));
      if (filtered.length > 0) targetCities = filtered;
    }

    // Allocate nights among cities
    const citiesCount = Math.max(1, targetCities.length);
    const baseNights = Math.floor(nights / citiesCount);
    const extraNights = nights % citiesCount;

    // Create Trip
    const title = `${destination.name} ${occasion === 'honeymoon' ? 'Honeymoon' : 'Trip'}: ${targetCities.map((c) => c.name).slice(0, 3).join(' & ')}`;

    const newTrip = await prisma.trip.create({
      data: {
        title,
        destinationId: destination.id,
        userId: user?.id || null,
        startDate,
        endDate,
        nights,
        adults: Number(adults),
        children: Number(children),
        infants: Number(infants),
        elders: Number(elders),
        occasion,
        pace,
        dietary,
        status: 'active',
        departureAirport,
        returnAirport: returnAirport || departureAirport,
        isPublic: false,
        currency: destination.currency || 'USD',
      },
    });

    // Create TripCities and TripDays
    let currentDayNumber = 1;

    for (let i = 0; i < targetCities.length; i++) {
      const city = targetCities[i];
      const cityNights = baseNights + (i < extraNights ? 1 : 0);
      const actualNights = Math.max(1, cityNights);

      await prisma.tripCity.create({
        data: {
          tripId: newTrip.id,
          cityId: city.id,
          nights: actualNights,
          orderIndex: i,
        },
      });

      // Select a recommended hotel for this city if available
      if (city.hotels.length > 0) {
        const hotel = city.hotels[0];
        const offer = hotel.offers[0];
        const checkIn = new Date(startDate);
        checkIn.setDate(startDate.getDate() + (currentDayNumber - 1));
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkIn.getDate() + actualNights);

        await prisma.staySelection.create({
          data: {
            tripId: newTrip.id,
            cityId: city.id,
            hotelId: hotel.id,
            offerId: offer?.id || null,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            nights: actualNights,
            roomType: offer?.roomType || 'Standard Room',
            provider: offer?.provider || 'Booking.com',
            totalPriceMinor: (offer?.pricePerNightMinor || 15000) * actualNights,
            currency: offer?.currency || 'USD',
            bookingStatus: 'shortlisted',
          },
        });
      }

      // Generate daily schedule
      for (let d = 0; d < actualNights; d++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + (currentDayNumber - 1));

        const tripDay = await prisma.tripDay.create({
          data: {
            tripId: newTrip.id,
            dayNumber: currentDayNumber,
            date: dayDate,
            cityId: city.id,
            title: `Day ${currentDayNumber}: Exploring ${city.name}`,
          },
        });

        // Add arrival or transfer if first day of city
        if (currentDayNumber === 1) {
          await prisma.itineraryItem.create({
            data: {
              tripId: newTrip.id,
              dayId: tripDay.id,
              type: 'flight',
              title: `Arrival at ${destination.name} (${departureAirport})`,
              startTime: '10:00',
              endTime: '11:30',
              durationMinutes: 90,
              locationName: 'Airport',
              costMinor: 0,
              orderIndex: 0,
            },
          });
        } else if (d === 0) {
          await prisma.itineraryItem.create({
            data: {
              tripId: newTrip.id,
              dayId: tripDay.id,
              type: 'transfer',
              title: `Transfer to ${city.name}`,
              startTime: '11:00',
              endTime: '12:30',
              durationMinutes: 90,
              locationName: city.name,
              costMinor: 2500,
              priceBasis: 'per_group',
              orderIndex: 0,
            },
          });
        }

        // Add 1 or 2 curated activities from catalogue
        const acts = city.activities;
        if (acts.length > 0) {
          const act = acts[d % acts.length];
          await prisma.itineraryItem.create({
            data: {
              tripId: newTrip.id,
              dayId: tripDay.id,
              type: 'activity',
              activityId: act.id,
              title: act.title,
              startTime: '14:30',
              endTime: '17:00',
              durationMinutes: act.durationMinutes,
              locationName: act.address || city.name,
              lat: act.lat,
              lng: act.lng,
              costMinor: 2000,
              priceBasis: 'per_person',
              notes: act.practicalTips || 'Booked through Roamly explorer.',
              orderIndex: 1,
            },
          });
        }

        currentDayNumber++;
      }
    }

    // Departure Day if duration exceeds nights
    if (currentDayNumber <= durationDays) {
      const lastCity = targetCities[targetCities.length - 1];
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + (currentDayNumber - 1));

      const farewellDay = await prisma.tripDay.create({
        data: {
          tripId: newTrip.id,
          dayNumber: currentDayNumber,
          date: dayDate,
          cityId: lastCity.id,
          title: `Day ${currentDayNumber}: Farewell & Departure`,
        },
      });

      await prisma.itineraryItem.create({
        data: {
          tripId: newTrip.id,
          dayId: farewellDay.id,
          type: 'transfer',
          title: 'Airport Drop-off & Departure Check-in',
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
      tripId: newTrip.id,
    });
  } catch (error: any) {
    console.error('Error creating trip from wizard:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ trips: [] });
    }

    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      include: {
        destination: true,
        cities: {
          include: { city: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ trips });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
