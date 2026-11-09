import { NextResponse } from 'next/server';
import { getOtpProvider, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone, code, role } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and OTP code are required.' }, { status: 400 });
    }

    const provider = getOtpProvider();
    const verification = await provider.verifyOtp(phone, code);

    if (!verification.success) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    // Find or create user for this phone
    let user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      const defaultName =
        phone.includes('9998888')
          ? 'Elena Rostova (Admin)'
          : phone.includes('7776666')
          ? 'Wayman Surya (Expert)'
          : 'Alex Morgan';

      user = await prisma.user.create({
        data: {
          phone,
          name: defaultName,
          role: role || (phone.includes('9998888') ? 'admin' : phone.includes('7776666') ? 'expert' : 'customer'),
          email: `${phone.replace(/[^0-9]/g, '')}@roamly.test`,
        },
      });
    } else if (role && user.role !== role) {
      // Allow testing different roles in sandbox
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
    }

    setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error in OTP verify route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

