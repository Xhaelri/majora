import React from 'react'
import { ShoppingBag } from 'lucide-react'

export default function CartIcon() {
  return (
    <div >
        <ShoppingBag size={32} strokeWidth={1} className='w-7 h-7 hover:text-green-900 hoverEffect'/>
    </div>
  )
}
