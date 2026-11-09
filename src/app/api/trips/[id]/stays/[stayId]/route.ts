import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; stayId: string } }
) {
  try {
    const body = await req.json();

    const stay = await prisma.staySelection.update({
      where: { id: params.stayId },
      data: {
        ...(body.bookingStatus !== undefined && { bookingStatus: body.bookingStatus }),
        ...(body.bookingReference !== undefined && { bookingReference: body.bookingReference }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: { hotel: true },
    });

    return NextResponse.json({ success: true, stay });
  } catch (error: any) {
    console.error('Error updating stay selection:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

