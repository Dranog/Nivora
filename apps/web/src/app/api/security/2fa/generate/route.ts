import { NextResponse } from 'next/server';

export async function GET() {
  // Mock 2FA generation
  const mockSecret = 'JBSWY3DPEHPK3PXP'; // Mock base32 secret
  const mockQRCodeUrl = `otpauth://totp/Oliver%20Admin:admin@oliver.com?secret=${mockSecret}&issuer=Oliver%20Admin`;

  return NextResponse.json({
    secret: mockSecret,
    qrCodeUrl: mockQRCodeUrl,
  });
}
