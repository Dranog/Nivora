/**
 * Open Graph Image Generator (F9)
 * Generates dynamic OG images for SEO
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SITE_NAME } from '@/lib/seo';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'default';
    const title = searchParams.get('title') || SITE_NAME;
    const handle = searchParams.get('handle');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 20,
                maxWidth: '90%',
                lineClamp: 2,
              }}
            >
              {title}
            </div>
            {handle && (
              <div
                style={{
                  fontSize: 32,
                  color: '#94a3b8',
                  marginBottom: 40,
                }}
              >
                @{handle}
              </div>
            )}
            <div
              style={{
                fontSize: 28,
                color: '#3b82f6',
                fontWeight: 'bold',
                marginTop: 20,
              }}
            >
              {SITE_NAME}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('Error generating OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
