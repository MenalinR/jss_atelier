"use client"
import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Banknote, Landmark, Loader2, Lock } from 'lucide-react'
import Container from './Container'
import PriceFormatter from './PriceFormatter'
import { urlFor } from '@/sanity/lib/image'
import { getCartCount, getCartTotal, useCartHydrated, useCartStore } from '@/store'
import { placeOrder } from '@/app/actions/orders'
import type { PlaceOrderInput } from '@/app/actions/orders'
import { cn } from '@/lib/utils'
import { paymentMethods, PaymentMethod } from '@/lib/payment'

const paymentIcons = { cod: Banknote, bank_transfer: Landmark }

type FieldName = 'customerName' | 'phone' | 'email' | 'address' | 'city' | 'note'

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-darkColor focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

const CheckoutView = ({defaultName = '', defaultEmail = ''}:{defaultName?: string; defaultEmail?: string}) => {
  const { items, clearCart } = useCartStore()
  const hydrated = useCartHydrated()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})

  if (!hydrated) return <div className='min-h-80' />

  if (!items.length) {
    return (
      <Container className='py-20 flex flex-col items-center gap-4 text-center'>
        <h1 className='text-2xl font-semibold text-darkColor'>Your cart is empty</h1>
        <p className='text-lightColor'>Add some artworks to your cart before checking out.</p>
        <Link href='/' className='rounded-full bg-brand-600 text-white px-7 py-3 text-sm font-semibold shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect'>
          Browse artworks
        </Link>
      </Container>
    )
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = (name: string) => String(formData.get(name) || '')
    const input: PlaceOrderInput = {
      customerName: value('customerName'),
      phone: value('phone'),
      email: value('email'),
      address: value('address'),
      city: value('city'),
      note: value('note'),
      paymentMethod: value('paymentMethod') as PaymentMethod,
      website: value('website'),
      items: items.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
    }
    setError(undefined)
    setFieldErrors({})
    startTransition(async () => {
      const result = await placeOrder(input)
      if (!result.ok) {
        setError(result.error)
        setFieldErrors(result.fieldErrors || {})
        return
      }
      clearCart()
      router.push(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}&pay=${input.paymentMethod}`)
    })
  }

  const field = (name: FieldName, label: string, input: React.ReactNode) => (
    <label className='flex flex-col gap-1.5 text-sm font-medium text-darkColor'>
      {label}
      {input}
      {fieldErrors[name] && <span className='text-xs font-normal text-red-600'>{fieldErrors[name]}</span>}
    </label>
  )
  const errorRing = (name: FieldName) => fieldErrors[name] && 'border-red-400 focus:border-red-500 focus:ring-red-100'

  return (
    <Container className='py-10'>
      <nav className='mb-6 flex items-center gap-2 text-sm text-lightColor'>
        <Link href='/cart' className='hover:text-brand-600 hoverEffect'>Cart</Link>
        <span>/</span>
        <span className='text-darkColor'>Checkout</span>
      </nav>
      <h1 className='text-3xl font-bold tracking-tight text-darkColor mb-2'>Checkout</h1>
      <p className='mb-8 text-lightColor'>Choose how you&apos;d like to pay, send us your order, and we&apos;ll contact you to confirm it and arrange delivery.</p>

      <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8'>
        <div className='flex flex-col gap-6 rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-200'>
          <h2 className='text-lg font-semibold text-darkColor'>Your details</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {field('customerName', 'Full name *', <input name='customerName' required autoComplete='name' defaultValue={defaultName} className={cn(inputClassName, errorRing('customerName'))} />)}
            {field('phone', 'Phone number *', <input name='phone' type='tel' required autoComplete='tel' placeholder='07X XXX XXXX' className={cn(inputClassName, errorRing('phone'))} />)}
          </div>
          {field('email', 'Email (optional – for your order confirmation)', <input name='email' type='email' autoComplete='email' defaultValue={defaultEmail} className={cn(inputClassName, errorRing('email'))} />)}

          <h2 className='mt-2 text-lg font-semibold text-darkColor'>Delivery address</h2>
          {field('address', 'Address *', <textarea name='address' required rows={3} autoComplete='street-address' className={cn(inputClassName, errorRing('address'))} />)}
          {field('city', 'City *', <input name='city' required autoComplete='address-level2' className={cn(inputClassName, errorRing('city'))} />)}
          {field('note', 'Note for us (optional)', <textarea name='note' rows={2} placeholder='Delivery instructions, gift message…' className={inputClassName} />)}

          <h2 className='mt-2 text-lg font-semibold text-darkColor'>Payment method</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {paymentMethods.map((method) => {
              const Icon = paymentIcons[method.value]
              return (
                <label
                  key={method.value}
                  className='flex cursor-pointer items-start gap-3 rounded-xl p-4 ring-1 ring-slate-200 hoverEffect hover:ring-brand-300 has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-brand-600'
                >
                  <input type='radio' name='paymentMethod' value={method.value} required defaultChecked={method.value === 'cod'} className='mt-1 accent-brand-600' />
                  <div className='flex flex-col gap-1'>
                    <span className='flex items-center gap-2 text-sm font-semibold text-darkColor'>
                      <Icon className='h-4 w-4 text-brand-600'/> {method.title}
                    </span>
                    <span className='text-xs text-lightColor'>{method.description}</span>
                  </div>
                </label>
              )
            })}
          </div>
          {fieldErrors.paymentMethod && <span className='text-xs text-red-600'>{fieldErrors.paymentMethod}</span>}

          {/* Spam trap: hidden from people, bots tend to fill it in */}
          <input name='website' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
        </div>

        <div className='flex flex-col gap-4 rounded-2xl bg-white p-6 h-fit shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24'>
          <h2 className='text-lg font-semibold text-darkColor'>Order summary ({getCartCount(items)})</h2>
          <div className='flex flex-col divide-y divide-slate-100'>
            {items.map(({product, quantity}) => (
              <div key={product._id} className='flex items-center gap-3 py-3'>
                <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-50'>
                  {product.image && <Image src={urlFor(product.image).width(120).height(120).url()} alt={product.name || 'Product picture'} fill className='object-cover'/>}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='truncate text-sm font-semibold text-darkColor'>{product.name}</p>
                  <p className='text-xs text-lightColor'>Qty {quantity}</p>
                </div>
                <PriceFormatter amount={(product.price || 0) * quantity} />
              </div>
            ))}
          </div>
          <div className='flex justify-between border-t border-slate-100 pt-4 text-darkColor'>
            <span className='font-semibold'>Total</span>
            <PriceFormatter amount={getCartTotal(items)} className='text-xl text-brand-700' />
          </div>
          {error && <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200'>{error}</p>}
          <button
            type='submit'
            disabled={pending}
            className='flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect disabled:opacity-60'
          >
            {pending ? <><Loader2 className='h-4 w-4 animate-spin'/> Placing order…</> : 'Place order'}
          </button>
          <p className='flex items-center justify-center gap-1.5 text-xs text-lightColor'>
            <Lock className='h-3 w-3'/> You pay after ordering – by cash on delivery or bank transfer.
          </p>
        </div>
      </form>
    </Container>
  )
}

export default CheckoutView
