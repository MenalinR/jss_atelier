"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/sanity.types'
import { useCartHydrated, useCartStore } from '@/store'
import { cn } from '@/lib/utils'

const AddToCartButton = ({product, className}:{product: Product; className?: string}) => {
  const addItem = useCartStore((state) => state.addItem)
  const inCart = useCartStore((state) => state.items.find((item) => item.product._id === product._id))
  const hydrated = useCartHydrated()
  const [added, setAdded] = useState(false)

  const soldOut = product.stock === 0
  const atStockLimit = hydrated && typeof product.stock === 'number' && (inCart?.quantity || 0) >= product.stock

  const handleClick = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <button
        type='button'
        onClick={handleClick}
        disabled={soldOut || atStockLimit}
        className='w-full rounded-xl bg-brand-600 text-white py-4 text-sm font-semibold uppercase tracking-wide shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed'
      >
        {soldOut ? 'Sold out' : atStockLimit ? 'All available pieces are in your cart' : added ? 'Added to cart ✓' : 'Add to cart'}
      </button>
      {hydrated && inCart && (
        <Link
          href='/cart'
          className='w-full rounded-xl border border-brand-600 py-4 text-center text-sm font-semibold uppercase tracking-wide text-brand-700 hover:bg-brand-50 hoverEffect'
        >
          View cart ({inCart.quantity} in cart)
        </Link>
      )}
    </div>
  )
}

export default AddToCartButton
