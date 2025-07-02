import { NextRequest, NextResponse } from 'next/server'
import { getCartData } from '@/server/actions/cart'

export async function GET(request: NextRequest) {
  try {
    const { items, count } = await getCartData()

    return NextResponse.json({
      items: items.map(item => ({
        id: item.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        productVariant: item.productVariant
      })),
      count: count
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}