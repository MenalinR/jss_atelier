"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Container from '@/components/Container'
import PriceFormatter from '@/components/PriceFormatter'
import { urlFor } from '@/sanity/lib/image'
import { getCartCount, getCartTotal, useCartHydrated, useCartStore } from '@/store'

const CartPage = () => {
  const { items, setQuantity, removeItem, clearCart } = useCartStore()
  const hydrated = useCartHydrated()

  if (!hydrated) {
    return <div className='min-h-80' />
  }

  if (!items.length) {
    return (
      <Container className='py-20 flex flex-col items-center gap-4 text-center'>
        <h1 className='text-2xl font-semibold text-darkColor'>Your cart is empty</h1>
        <p className='text-lightColor'>Explore our collections and add the artworks you love.</p>
        <Link href='/' className='bg-darkColor text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-lightColor hoverEffect'>
          Continue shopping
        </Link>
      </Container>
    )
  }

  return (
    <Container className='py-10'>
      <h1 className='text-2xl font-semibold text-darkColor mb-6'>Your cart ({getCartCount(items)})</h1>
      <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10'>
        <div className='flex flex-col divide-y border-y'>
          {items.map(({product, quantity}) => {
            const atStockLimit = typeof product.stock === 'number' && quantity >= product.stock
            return (
              <div key={product._id} className='flex gap-4 py-4'>
                <Link href={`/product/${product.slug}`} className='relative w-24 h-24 shrink-0 bg-zinc-100'>
                  {product.image && (
                    <Image src={urlFor(product.image).width(200).height(200).url()} alt={product.name || 'Product picture'} fill className='object-cover'/>
                  )}
                </Link>
                <div className='flex-1 flex flex-col gap-2'>
                  <div className='flex justify-between gap-4'>
                    <Link href={`/product/${product.slug}`} className='font-semibold text-darkColor hover:underline'>{product.name}</Link>
                    <PriceFormatter amount={(product.price || 0) * quantity} />
                  </div>
                  <PriceFormatter amount={product.price} className='text-xs font-normal text-lightColor' />
                  <div className='flex items-center justify-between mt-auto'>
                    <div className='flex items-center border'>
                      <button type='button' aria-label='Decrease quantity' disabled={quantity <= 1} onClick={() => setQuantity(product._id, quantity - 1)} className='p-2 disabled:opacity-30'>
                        <Minus className='w-3 h-3'/>
                      </button>
                      <span className='w-8 text-center text-sm font-semibold'>{quantity}</span>
                      <button type='button' aria-label='Increase quantity' disabled={atStockLimit} onClick={() => setQuantity(product._id, quantity + 1)} className='p-2 disabled:opacity-30'>
                        <Plus className='w-3 h-3'/>
                      </button>
                    </div>
                    <button type='button' onClick={() => removeItem(product._id)} className='flex items-center gap-1 text-sm text-lightColor hover:text-red-600 hoverEffect'>
                      <Trash2 className='w-4 h-4'/> Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          <button type='button' onClick={clearCart} className='self-start py-4 text-sm text-lightColor underline hover:text-darkColor'>
            Clear cart
          </button>
        </div>

        <div className='flex flex-col gap-4 bg-lightBg p-6 h-fit'>
          <h2 className='text-lg font-semibold text-darkColor'>Order summary</h2>
          <div className='flex justify-between text-darkColor'>
            <span>Total</span>
            <PriceFormatter amount={getCartTotal(items)} className='text-lg' />
          </div>
          <Link href='/' className='w-full border border-darkColor py-3 text-center text-sm font-semibold uppercase tracking-wide hover:bg-darkColor hover:text-white hoverEffect'>
            Continue shopping
          </Link>
        </div>
      </div>
    </Container>
  )
}

export default CartPage
