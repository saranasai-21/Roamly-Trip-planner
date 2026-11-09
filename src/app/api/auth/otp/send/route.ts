import { NextResponse } from 'next/server';
import { getOtpProvider } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const provider = getOtpProvider();
    const result = await provider.sendOtp(phone);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in OTP send route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

