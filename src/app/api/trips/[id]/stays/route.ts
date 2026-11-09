import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      cityId,
      hotelId,
      offerId,
      roomType,
      provider,
      totalPriceMinor,
      currency = 'USD',
      nights = 2,
    } = body;

    // Delete existing stay selection for this city on this trip
    await prisma.staySelection.deleteMany({
      where: {
        tripId: params.id,
        cityId,
      },
    });

    const checkInDate = new Date();
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + nights);

    const stay = await prisma.staySelection.create({
      data: {
        tripId: params.id,
        cityId,
        hotelId,
        offerId: offerId || null,
        roomType: roomType || 'Selected Room',
        provider: provider || 'Booking.com',
        totalPriceMinor: Number(totalPriceMinor),
        currency,
        nights: Number(nights),
        checkInDate,
        checkOutDate,
        bookingStatus: 'shortlisted',
      },
      include: {
        hotel: true,
      },
    });

    return NextResponse.json({ success: true, stay });
  } catch (error: any) {
    console.error('Error creating stay selection:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
