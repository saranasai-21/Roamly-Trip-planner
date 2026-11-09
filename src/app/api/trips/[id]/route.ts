import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        destination: true,
        cities: { include: { city: true } },
        days: { include: { items: true } },
        stays: { include: { hotel: true } },
      },
    });

    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    return NextResponse.json({ trip });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.isPublic !== undefined && { isPublic: Boolean(body.isPublic) }),
        ...(body.pace !== undefined && { pace: body.pace }),
        ...(body.dietary !== undefined && { dietary: body.dietary }),
      },
    });

    return NextResponse.json({ success: true, trip });
  } catch (error: any) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.trip.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Trip deleted.' });
  } catch (error: any) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
