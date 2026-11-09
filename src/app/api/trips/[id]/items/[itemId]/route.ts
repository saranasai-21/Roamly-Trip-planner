import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const body = await req.json();

    const item = await prisma.itineraryItem.update({
      where: { id: params.itemId },
      data: {
        ...(body.dayId && { dayId: body.dayId }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.durationMinutes !== undefined && { durationMinutes: Number(body.durationMinutes) }),
        ...(body.locationName !== undefined && { locationName: body.locationName }),
        ...(body.costMinor !== undefined && { costMinor: Number(body.costMinor) }),
        ...(body.priceBasis !== undefined && { priceBasis: body.priceBasis }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.isLocked !== undefined && { isLocked: Boolean(body.isLocked) }),
        ...(body.bookingStatus !== undefined && { bookingStatus: body.bookingStatus }),
        ...(body.metadata !== undefined && { metadata: body.metadata }),
      },
      include: { activity: true },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error updating itinerary item:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    await prisma.itineraryItem.delete({
      where: { id: params.itemId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting itinerary item:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

