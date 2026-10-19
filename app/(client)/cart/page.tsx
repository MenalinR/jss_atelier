import React from 'react'
import Link from 'next/link'
import Container from '@/components/Container'
import CartView from '@/components/CartView'
import { isAdmin } from '@/lib/admin'

const CartPage = async () => {
  // The admin manages the shop instead of buying from it
  if (await isAdmin()) {
    return (
      <Container className='py-20 flex flex-col items-center gap-4 text-center'>
        <h1 className='text-2xl font-semibold text-darkColor'>The cart is for customers</h1>
        <p className='max-w-md text-lightColor'>You&apos;re logged in as admin, so shopping is turned off. Log out to see the cart the way customers do.</p>
        <Link href='/' className='rounded-full bg-brand-600 text-white px-7 py-3 text-sm font-semibold shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect'>
          Back to the shop
        </Link>
      </Container>
    )
  }
  return <CartView />
}

export default CartPage
