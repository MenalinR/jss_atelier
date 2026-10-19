import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import Container from '@/components/Container'
import CheckoutView from '@/components/CheckoutView'
import { isAdmin } from '@/lib/admin'

export const metadata: Metadata = { title: 'Checkout | JSS' }

const CheckoutPage = async () => {
  if (await isAdmin()) {
    return (
      <Container className='py-20 flex flex-col items-center gap-4 text-center'>
        <h1 className='text-2xl font-semibold text-darkColor'>Checkout is for customers</h1>
        <p className='max-w-md text-lightColor'>You&apos;re logged in as admin. Log out to test checkout the way customers see it.</p>
        <Link href='/admin/orders' className='rounded-full bg-brand-600 text-white px-7 py-3 text-sm font-semibold shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect'>
          View orders
        </Link>
      </Container>
    )
  }
  // Logged-in customers get their name and email filled in
  const user = await currentUser()
  return <CheckoutView defaultName={user?.fullName || ''} defaultEmail={user?.primaryEmailAddress?.emailAddress || ''} />
}

export default CheckoutPage
