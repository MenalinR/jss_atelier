import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Container from '@/components/Container'
import OrderCard from '@/components/OrderCard'
import { getOrdersForUser } from '@/lib/orders'
import { isAdmin } from '@/lib/admin'

export const metadata: Metadata = { title: 'My orders | JSS' }

const OrdersPage = async () => {
  const user = await currentUser()
  if (!user) redirect('/')
  if (await isAdmin()) redirect('/admin/orders')

  const orders = await getOrdersForUser(user.id)
  return (
    <Container className='py-10 flex flex-col gap-6'>
      <h1 className='text-3xl font-bold tracking-tight text-darkColor'>My orders</h1>
      {orders.length ? (
        <div className='flex max-w-3xl flex-col gap-4'>
          {orders.map((order) => <OrderCard key={order._id} order={order}/>)}
        </div>
      ) : (
        <div className='flex flex-col items-center gap-4 rounded-2xl bg-brand-50 px-6 py-16 text-center'>
          <h2 className='text-xl font-bold text-darkColor'>No orders yet</h2>
          <p className='text-lightColor'>Orders you place while logged in will show here.</p>
          <Link href='/' className='rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-700 hoverEffect'>Browse artworks</Link>
        </div>
      )}
    </Container>
  )
}

export default OrdersPage
