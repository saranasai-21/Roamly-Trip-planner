import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { role = 'customer' } = await req.json();

    const email = role === 'admin' ? 'admin@roamly.test' : 'demo@roamly.test';
    const name = role === 'admin' ? 'Elena Rostova (Admin)' : 'Alex Morgan';

    let user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
        },
      });
    }

    setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error in instant login route:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

