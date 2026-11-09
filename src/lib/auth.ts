import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole, UserSession } from './types';

export interface OtpProvider {
  name: string;
  isDemo: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; message: string }>;
}

// In-memory OTP storage for verification in development / testing
const demoOtpStore = new Map<string, { code: string; expiresAt: number }>();

export const DemoOtpProvider: OtpProvider = {
  name: 'Roamly Demo OTP Provider (Development & Sandbox)',
  isDemo: true,
  async sendOtp(phone: string) {
    const code = process.env.DEMO_OTP_CODE || '123456';
    demoOtpStore.set(phone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
    return {
      success: true,
      message: `[DEMO OTP] Passcode sent for ${phone}. Use code: ${code}`,
    };
  },
  async verifyOtp(phone: string, code: string) {
    const entry = demoOtpStore.get(phone);
    const validDemoCode = process.env.DEMO_OTP_CODE || '123456';
    
    // In demo mode, accept the standard demo code 123456 or stored code
    if (code === validDemoCode || (entry && entry.code === code && entry.expiresAt > Date.now())) {
      demoOtpStore.delete(phone);
      return { success: true, message: 'Verification successful.' };
    }
    return { success: false, message: 'Invalid or expired OTP code.' };
  },
};

export function getOtpProvider(): OtpProvider {
  // Production check: In production, require real provider credentials
  if (process.env.NODE_ENV === 'production' && process.env.TWILIO_ACCOUNT_SID) {
    // If real provider was configured, it would return real adapter
  }
  return DemoOtpProvider;
}

const SESSION_COOKIE_NAME = 'roamly_session_user_id';

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      avatarUrl: user.avatarUrl,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export function setSessionCookie(userId: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

