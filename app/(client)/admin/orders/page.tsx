import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Inbox, Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import Container from '@/components/Container'
import PriceFormatter from '@/components/PriceFormatter'
import { formatOrderDate } from '@/components/OrderCard'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import { getAllOrders, Order } from '@/lib/orders'
import { isAdmin } from '@/lib/admin'
import { emailIsConfigured } from '@/lib/email'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Orders | JSS Admin' }

const tabs = [
  { status: 'all', label: 'All' },
  { status: 'new', label: 'New' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
]

// Coloured stripe on the left of each order
const stripeColors: Record<string, string> = {
  new: 'before:bg-brand-600',
  confirmed: 'before:bg-amber-400',
  shipped: 'before:bg-sky-500',
  completed: 'before:bg-emerald-500',
  cancelled: 'before:bg-slate-300',
}

const sectionLabel = 'text-[11px] font-semibold uppercase tracking-wider text-lightColor'

const OrderRow = ({ order }: { order: Order }) => (
  <div
    className={cn(
      'relative grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-white p-5 pl-7 shadow-sm ring-1 ring-slate-200 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_1.2fr]',
      "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:content-['']",
      stripeColors[order.status],
      order.status === 'cancelled' && 'opacity-70'
    )}
  >
    {/* Order */}
    <div className='flex flex-col gap-3'>
      <div>
        <p className='font-bold text-darkColor'>{order.orderNumber}</p>
        <p className='text-xs text-lightColor'>{formatOrderDate(order._createdAt)}</p>
      </div>
      <div className='flex flex-col items-start gap-1'>
        <span className={sectionLabel}>Status</span>
        <OrderStatusSelect orderId={order._id} status={order.status} />
      </div>
    </div>

    {/* Customer */}
    <div className='flex flex-col gap-2 text-sm text-darkColor'>
      <span className={sectionLabel}>Customer</span>
      <p className='font-semibold'>{order.customerName}</p>
      <a href={`tel:${order.phone.replace(/\s/g, '')}`} className='flex items-center gap-2 text-brand-700 hover:underline'>
        <Phone className='h-4 w-4 shrink-0' /> {order.phone}
      </a>
      {order.email && (
        <a href={`mailto:${order.email}`} className='flex items-center gap-2 break-all text-brand-700 hover:underline'>
          <Mail className='h-4 w-4 shrink-0' /> {order.email}
        </a>
      )}
      <p className='flex items-start gap-2 whitespace-pre-line text-lightColor'>
        <MapPin className='mt-0.5 h-4 w-4 shrink-0' /> {order.address}, {order.city}
      </p>
      {order.note && (
        <p className='flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-900'>
          <MessageSquare className='mt-0.5 h-4 w-4 shrink-0' /> {order.note}
        </p>
      )}
    </div>

    {/* Items */}
    <div className='flex flex-col gap-2 md:col-span-2 lg:col-span-1'>
      <span className={sectionLabel}>Items</span>
      <div className='flex flex-col divide-y divide-slate-100 rounded-xl bg-lightBg px-4'>
        {order.items?.map((item) => (
          <div key={item._key} className='flex items-center justify-between gap-3 py-2.5 text-sm'>
            {item.slug ? (
              <Link href={`/product/${item.slug}`} className='text-darkColor hover:text-brand-700 hoverEffect'>{item.name}</Link>
            ) : (
              <span className='text-darkColor'>{item.name}</span>
            )}
            <span className='shrink-0 text-lightColor'>
              {item.quantity} × <PriceFormatter amount={item.price} className='font-normal text-lightColor' />
            </span>
          </div>
        ))}
      </div>
      <div className='flex items-center justify-end gap-3 pt-1'>
        <span className='text-sm font-semibold text-darkColor'>Total</span>
        <PriceFormatter amount={order.total} className='text-lg text-brand-700' />
      </div>
    </div>
  </div>
)

type Props = { searchParams: Promise<{ status?: string }> }

const AdminOrdersPage = async ({ searchParams }: Props) => {
  if (!(await isAdmin())) notFound()
  const [orders, { status }] = await Promise.all([getAllOrders(), searchParams])
  const activeTab = tabs.find((tab) => tab.status === status)?.status || 'all'
  const shown = activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab)
  const count = (tabStatus: string) =>
    tabStatus === 'all' ? orders.length : orders.filter((order) => order.status === tabStatus).length

  // Money from orders that aren't cancelled
  const activeOrders = orders.filter((order) => order.status !== 'cancelled')
  const stats = [
    { label: 'Need attention', value: count('new'), hint: 'New orders to confirm' },
    { label: 'In progress', value: count('confirmed') + count('shipped'), hint: 'Confirmed or shipped' },
    { label: 'Completed', value: count('completed'), hint: 'Delivered orders' },
    {
      label: 'Order value',
      value: <PriceFormatter amount={activeOrders.reduce((sum, order) => sum + order.total, 0)} className='text-2xl' />,
      hint: 'All orders except cancelled',
    },
  ]

  return (
    <Container className='py-10 flex flex-col gap-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-darkColor'>Orders</h1>
        <p className='text-lightColor'>Contact each customer to confirm, then update the status as the order moves along.</p>
      </div>

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {stats.map((stat) => (
          <div key={stat.label} className='flex flex-col gap-1 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200'>
            <span className={sectionLabel}>{stat.label}</span>
            <span className='text-2xl font-bold text-darkColor'>{stat.value}</span>
            <span className='text-xs text-lightColor'>{stat.hint}</span>
          </div>
        ))}
      </div>

      {!emailIsConfigured() && (
        <p className='rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200'>
          ✉️ Order emails are turned off. Add the SMTP settings to <code>.env.local</code> so you and your customers get order emails.
        </p>
      )}

      <div className='w-full overflow-x-auto pb-1'>
        <div className='flex w-max items-center gap-1 rounded-full bg-white p-1.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200'>
          {tabs.map((tab) => (
            <Link
              key={tab.status}
              href={tab.status === 'all' ? '/admin/orders' : `/admin/orders?status=${tab.status}`}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 hoverEffect',
                activeTab === tab.status
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-lightColor hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  activeTab === tab.status ? 'bg-white/20 text-white' : 'bg-slate-100 text-lightColor'
                )}
              >
                {count(tab.status)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {shown.length ? (
        <div className='flex flex-col gap-4'>
          {shown.map((order) => <OrderRow key={order._id} order={order} />)}
        </div>
      ) : (
        <div className='flex flex-col items-center gap-3 rounded-2xl bg-brand-50 px-6 py-16 text-center'>
          <Inbox className='h-10 w-10 text-brand-600' />
          <h2 className='text-xl font-bold text-darkColor'>
            {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
          </h2>
          <p className='text-lightColor'>
            {activeTab === 'all' ? 'New orders from the checkout will appear here.' : 'Orders with this status will appear here.'}
          </p>
        </div>
      )}
    </Container>
  )
}

export default AdminOrdersPage
