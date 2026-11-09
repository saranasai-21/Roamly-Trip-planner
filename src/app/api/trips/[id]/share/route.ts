import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if valid share token already exists
    let shareToken = await prisma.shareToken.findFirst({
      where: {
        tripId: trip.id,
        isRevoked: false,
      },
    });

    if (!shareToken) {
      const token = `roam-${crypto.randomBytes(8).toString('hex')}`;
      shareToken = await prisma.shareToken.create({
        data: {
          tripId: trip.id,
          token,
          isRevoked: false,
        },
      });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const shareUrl = `${protocol}://${host}/share/${shareToken.token}`;

    return NextResponse.json({
      success: true,
      token: shareToken.token,
      shareUrl,
    });
  } catch (error: any) {
    console.error('Error generating share token:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

// Revoke share token
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.shareToken.updateMany({
      where: { tripId: params.id },
      data: { isRevoked: true },
    });
    return NextResponse.json({ success: true, message: 'Share link revoked.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

