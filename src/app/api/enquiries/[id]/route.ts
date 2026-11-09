import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'expert')) {
      return NextResponse.json({ error: 'Unauthorized. Admin or Expert required.' }, { status: 403 });
    }

    const body = await req.json();
    const { status, assignedTo, quoteDetails, totalAmountMinor, currency = 'USD' } = body;

    const enquiry = await prisma.expertEnquiry.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
      },
    });

    if (quoteDetails && totalAmountMinor) {
      await prisma.expertQuote.create({
        data: {
          enquiryId: enquiry.id,
          quoteDetails,
          totalAmountMinor: Number(totalAmountMinor),
          currency,
        },
      });
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

