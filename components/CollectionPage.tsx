import React from 'react'
import Link from 'next/link'
import { PackageOpen } from 'lucide-react'
import Container from './Container'
import ProductList from './ProductList'
import { Product } from '@/sanity.types'
import { getCategories } from '@/sanity/lib/categories'
import { isAdmin } from '@/lib/admin'

interface Props{
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  emptyTitle: string;
  emptyMessage: string;
  // Shown only to the admin when the page is empty: how to put products here
  adminHint?: string;
  // Extra content between the header and the products (e.g. filters)
  children?: React.ReactNode;
}

// Shared layout for the New / Drawing / Sale / Featured / Gift pages
const CollectionPage = async ({eyebrow, title, description, products, emptyTitle, emptyMessage, adminHint, children}:Props) => {
  const [admin, categories] = await Promise.all([isAdmin(), getCategories()])
  return (
    <Container className='py-10 flex flex-col gap-10'>
      <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-600 to-sky-500 px-6 py-12 md:py-16 text-center text-white shadow-xl shadow-brand-600/20'>
        <div className='pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl'/>
        <div className='relative flex flex-col items-center gap-4'>
          <span className='rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] ring-1 ring-white/30'>{eyebrow}</span>
          <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight'>{title}</h1>
          <p className='max-w-xl text-white/85 md:text-lg'>{description}</p>
        </div>
      </section>

      {children}

      {products.length ? (
        <div className='flex flex-col gap-4'>
          <p className='text-sm text-lightColor'>{products.length} {products.length === 1 ? 'artwork' : 'artworks'}</p>
          <ProductList products={products} categories={categories} isAdmin={admin}/>
        </div>
      ) : (
        <div className='flex flex-col items-center gap-4 rounded-2xl bg-brand-50 px-6 py-16 text-center'>
          <PackageOpen className='h-10 w-10 text-brand-600'/>
          <h2 className='text-2xl font-bold text-darkColor'>{emptyTitle}</h2>
          <p className='max-w-md text-lightColor'>{emptyMessage}</p>
          {admin && adminHint && (
            <p className='max-w-md rounded-xl bg-white px-4 py-3 text-sm text-brand-800 ring-1 ring-brand-200'>
              <span className='font-semibold'>Admin tip:</span> {adminHint}
            </p>
          )}
          <Link href='/#collections' className='rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hoverEffect'>
            Browse all artworks
          </Link>
        </div>
      )}
    </Container>
  )
}

export default CollectionPage
