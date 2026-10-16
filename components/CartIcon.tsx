"use client"
import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { getCartCount, useCartHydrated, useCartStore } from '@/store'

const CartIcon = () => {
  const items = useCartStore((state) => state.items)
  const hydrated = useCartHydrated()
  const count = hydrated ? getCartCount(items) : 0
  return (
    <Link href={"/cart"} className='group relative' aria-label={`Cart, ${count} items`}>
    <ShoppingBag className='w-5 h-5 group-hover:text-brand-600 hoverEffect'/>
    <span className='absolute -top-1 -right-1 bg-brand-600 text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center'>
        {count}</span>
    </Link>
  )
}

export default CartIcon
