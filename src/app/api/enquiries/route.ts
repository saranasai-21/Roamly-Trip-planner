import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      tripId,
      fullName,
      email,
      phone,
      travelDates,
      message,
    } = body;

    if (!fullName || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, email, phone, and message are required.' },
        { status: 400 }
      );
    }

    const enquiry = await prisma.expertEnquiry.create({
      data: {
        tripId: tripId || null,
        userId: user?.id || null,
        fullName,
        email,
        phone,
        travelDates: travelDates || null,
        message,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    console.error('Error creating expert enquiry:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    // Allow viewing enquiries if admin or expert
    if (!user || (user.role !== 'admin' && user.role !== 'expert')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const enquiries = await prisma.expertEnquiry.findMany({
      include: {
        trip: {
          select: { id: true, title: true, destination: { select: { name: true } } },
        },
        quotes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
