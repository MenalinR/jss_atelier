import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Banknote, CheckCircle2, Landmark, Phone, Mail } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import Container from '@/components/Container'
import { getSiteSettings } from '@/sanity/lib/siteSettings'

export const metadata: Metadata = { title: 'Order received | JSS' }

type Props = { searchParams: Promise<{ order?: string; pay?: string }> }

// Only shows the order number from the link, never personal details
const OrderSuccessPage = async ({ searchParams }: Props) => {
  const [{ order, pay }, settings, user] = await Promise.all([searchParams, getSiteSettings(), currentUser()])
  const orderNumber = /^JSS-\d{6}-[A-Z0-9]{4}$/.test(order || '') ? order : undefined

  return (
    <Container className='py-16 flex justify-center'>
      <div className='flex w-full max-w-xl flex-col items-center gap-5 rounded-3xl bg-white p-8 md:p-12 text-center shadow-sm ring-1 ring-slate-200'>
        <div className='rounded-full bg-emerald-50 p-4'><CheckCircle2 className='h-12 w-12 text-emerald-500'/></div>
        <h1 className='text-3xl font-bold tracking-tight text-darkColor'>Thank you for your order!</h1>
        {orderNumber && (
          <p className='rounded-full bg-brand-50 px-5 py-2 text-sm text-brand-800 ring-1 ring-brand-200'>
            Order number <span className='font-bold'>{orderNumber}</span>
          </p>
        )}
        <p className='text-lightColor'>
          We&apos;ve received your order. We&apos;ll contact you soon by phone to confirm it and arrange delivery.
          Please keep your order number handy.
        </p>
        {pay === 'bank_transfer' && (
          <div className='flex w-full flex-col gap-2 rounded-2xl bg-brand-50 p-5 text-left text-sm text-darkColor ring-1 ring-brand-200'>
            <p className='flex items-center gap-2 font-semibold'><Landmark className='h-4 w-4 text-brand-600'/> Pay by bank transfer</p>
            {settings.bankDetails ? (
              <>
                <p>Please transfer your order total to:</p>
                <p className='whitespace-pre-line rounded-xl bg-white px-4 py-3 font-mono text-sm ring-1 ring-brand-100'>{settings.bankDetails}</p>
                {orderNumber && <p>Use <span className='font-bold'>{orderNumber}</span> as the payment reference.</p>}
              </>
            ) : (
              <p>We&apos;ll send you our bank details when we contact you.</p>
            )}
          </div>
        )}
        {pay === 'cod' && (
          <div className='flex w-full items-start gap-2 rounded-2xl bg-brand-50 p-5 text-left text-sm text-darkColor ring-1 ring-brand-200'>
            <Banknote className='mt-0.5 h-4 w-4 shrink-0 text-brand-600'/>
            <p><span className='font-semibold'>Cash on delivery</span> – please have the order total ready when your artwork arrives.</p>
          </div>
        )}
        <div className='flex w-full flex-col gap-2 rounded-2xl bg-lightBg p-4 text-sm text-darkColor'>
          <p className='font-semibold'>Questions about your order?</p>
          <p className='flex items-center justify-center gap-2'><Phone className='h-4 w-4 text-brand-600'/> {settings.phone}</p>
          <p className='flex items-center justify-center gap-2'><Mail className='h-4 w-4 text-brand-600'/> {settings.email}</p>
        </div>
        <div className='flex flex-wrap justify-center gap-3'>
          <Link href='/' className='rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect'>
            Continue shopping
          </Link>
          {user && (
            <Link href='/orders' className='rounded-full border border-brand-600 px-7 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 hoverEffect'>
              My orders
            </Link>
          )}
        </div>
      </div>
    </Container>
  )
}

export default OrderSuccessPage
