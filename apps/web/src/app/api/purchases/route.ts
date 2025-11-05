// app/api/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/purchases
 * Liste des achats d'un fan auprès d'un créateur
 * 
 * Query params:
 * - creatorId: ID du créateur
 * - type: 'all' | 'media' | 'tip' | 'subscription'
 * - sortBy: 'recent' | 'oldest' | 'price'
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Récupérer l'utilisateur connecté via session
    // const session = await getServerSession()
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(req.url)
    const creatorId = searchParams.get('creatorId')
    const type = searchParams.get('type') || 'all'
    const sortBy = searchParams.get('sortBy') || 'recent'

    // 📝 SIMULATION : Dans un vrai système :
    // - Récupérer les achats depuis Prisma
    // - Filtrer par creatorId, type
    // - Trier selon sortBy
    // - Inclure les infos du créateur

    // ✅ Données demo
    const demoPurchases = [
      {
        id: 'purchase_1',
        type: 'media',
        userId: 'fan-1',
        creatorId: creatorId || '2',
        amount: 15,
        currency: 'EUR',
        mediaId: 'media_1',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        mediaThumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
        status: 'completed',
        purchasedAt: '2024-11-04T10:30:00Z',
      },
      {
        id: 'purchase_2',
        type: 'media',
        userId: 'fan-1',
        creatorId: creatorId || '2',
        amount: 20,
        currency: 'EUR',
        mediaId: 'media_2',
        mediaType: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
        mediaThumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100',
        status: 'completed',
        purchasedAt: '2024-11-03T14:20:00Z',
      },
      {
        id: 'purchase_3',
        type: 'tip',
        userId: 'fan-1',
        creatorId: creatorId || '2',
        amount: 10,
        currency: 'EUR',
        tipMessage: 'Merci pour ton contenu !',
        status: 'completed',
        purchasedAt: '2024-11-02T18:45:00Z',
      },
    ]

    // Filtrer par type si nécessaire
    let filteredPurchases = demoPurchases
    if (type && type !== 'all') {
      filteredPurchases = demoPurchases.filter((p) => p.type === type)
    }

    // Trier
    if (sortBy === 'recent') {
      filteredPurchases.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
    } else if (sortBy === 'oldest') {
      filteredPurchases.sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime())
    } else if (sortBy === 'price') {
      filteredPurchases.sort((a, b) => b.amount - a.amount)
    }

    return NextResponse.json(filteredPurchases)
  } catch (error) {
    console.error('Get purchases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
