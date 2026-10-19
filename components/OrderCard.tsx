import React from 'react'
import Link from 'next/link'
import type { Order } from '@/lib/orders'
import PriceFormatter from './PriceFormatter'
import { cn } from '@/lib/utils'

export const statusStyles: Record<string, string> = {
  new: 'bg-brand-50 text-brand-700 ring-brand-200',
  confirmed: 'bg-amber-50 text-amber-700 ring-amber-200',
  shipped: 'bg-sky-50 text-sky-700 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
}

export const formatOrderDate = (date: string) =>
  new Date(date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' })

// One order: header, items and total. `children` adds extra parts (e.g. admin controls).
const OrderCard = ({order, children, statusSlot}:{order: Order; children?: React.ReactNode; statusSlot?: React.ReactNode}) => (
  <div className='flex flex-col gap-4 rounded-2xl bg-white p-5 md:p-6 shadow-sm ring-1 ring-slate-200'>
    <div className='flex flex-wrap items-start justify-between gap-3'>
      <div>
        <p className='font-bold text-darkColor'>{order.orderNumber}</p>
        <p className='text-xs text-lightColor'>{formatOrderDate(order._createdAt)}</p>
      </div>
      {statusSlot ?? (
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1', statusStyles[order.status])}>{order.status}</span>
      )}
    </div>
    <div className='flex flex-col divide-y divide-slate-100 rounded-xl bg-lightBg px-4'>
      {order.items?.map((item) => (
        <div key={item._key} className='flex items-center justify-between gap-3 py-2.5 text-sm'>
          {item.slug
            ? <Link href={`/product/${item.slug}`} className='text-darkColor hover:text-brand-700 hoverEffect'>{item.name}</Link>
            : <span className='text-darkColor'>{item.name}</span>}
          <span className='shrink-0 text-lightColor'>{item.quantity} × <PriceFormatter amount={item.price} className='font-normal text-lightColor'/></span>
        </div>
      ))}
    </div>
    {children}
    <div className='flex justify-end gap-2 text-darkColor'>
      <span className='font-semibold'>Total</span>
      <PriceFormatter amount={order.total} className='text-base text-brand-700'/>
    </div>
  </div>
)

export default OrderCard
