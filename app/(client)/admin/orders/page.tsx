import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import Container from '@/components/Container'
import OrderCard, { statusStyles } from '@/components/OrderCard'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import { getAllOrders } from '@/lib/orders'
import { isAdmin } from '@/lib/admin'
import { emailIsConfigured } from '@/lib/email'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Orders | JSS Admin' }

const AdminOrdersPage = async () => {
  if (!(await isAdmin())) notFound()
  const orders = await getAllOrders()
  const count = (status: string) => orders.filter((order) => order.status === status).length

  return (
    <Container className='py-10 flex flex-col gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-darkColor'>Orders</h1>
          <p className='text-lightColor'>Contact each customer to confirm, then update the status as the order moves along.</p>
        </div>
        <div className='flex flex-wrap gap-2 text-xs font-semibold'>
          {['new', 'confirmed', 'shipped', 'completed', 'cancelled'].map((status) => (
            <span key={status} className={cn('rounded-full px-3 py-1 capitalize ring-1', statusStyles[status])}>{status}: {count(status)}</span>
          ))}
        </div>
      </div>

      {!emailIsConfigured() && (
        <p className='rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200'>
          ✉️ Order emails are turned off. Add the SMTP settings to <code>.env.local</code> so you and your customers get order emails.
        </p>
      )}

      {orders.length ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} statusSlot={<OrderStatusSelect orderId={order._id} status={order.status}/>}>
              <div className='flex flex-col gap-2 text-sm text-darkColor'>
                <p className='font-semibold'>{order.customerName}</p>
                <a href={`tel:${order.phone.replace(/\s/g, '')}`} className='flex items-center gap-2 text-brand-700 hover:underline'><Phone className='h-4 w-4'/> {order.phone}</a>
                {order.email && <a href={`mailto:${order.email}`} className='flex items-center gap-2 text-brand-700 hover:underline'><Mail className='h-4 w-4'/> {order.email}</a>}
                <p className='flex items-start gap-2 text-lightColor whitespace-pre-line'><MapPin className='mt-0.5 h-4 w-4 shrink-0'/> {order.address}, {order.city}</p>
                {order.note && <p className='flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-900'><MessageSquare className='mt-0.5 h-4 w-4 shrink-0'/> {order.note}</p>}
              </div>
            </OrderCard>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl bg-brand-50 px-6 py-16 text-center'>
          <h2 className='text-xl font-bold text-darkColor'>No orders yet</h2>
          <p className='text-lightColor'>New orders from the checkout will appear here.</p>
        </div>
      )}
    </Container>
  )
}

export default AdminOrdersPage
