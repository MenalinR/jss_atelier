import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Container from '@/components/Container'
import ProductGallery from '@/components/ProductGallery'
import PriceView from '@/components/PriceView'
import AddToCartButton from '@/components/AddToCartButton'
import RefreshingProductEditor from '@/components/admin/RefreshingProductEditor'
import { client } from '@/sanity/lib/client'
import { Product } from '@/sanity.types'
import { findProductType } from '@/constants'
import { isAdmin } from '@/lib/admin'

const getProduct = (slug: string) =>
  client.fetch<Product | null>(
    `*[_type == "product" && slug.current == $slug][0]`,
    { slug },
    // Skip the CDN; Next caches this and admin saves clear the cache
    { useCdn: false, next: { revalidate: 60 } },
  )

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  return {
    title: product?.name ? `${product.name} | JSS` : 'Product | JSS',
    description: product?.intro || product?.description,
  }
}

const ProductPage = async ({ params }: Props) => {
  const product = await getProduct((await params).slug)
  if (!product) notFound()

  const admin = await isAdmin()
  const type = findProductType(product.variant)

  return (
    <Container className='py-8'>
      <nav className='flex flex-wrap items-center gap-2 text-sm text-lightColor mb-6'>
        <Link href='/' className='hover:text-brand-600 hoverEffect'>All Artworks</Link>
        {type && (<><span>/</span><span>{type.title}</span></>)}
        <span>/</span>
        <span className='text-darkColor'>{product.name}</span>
      </nav>

      <div className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 rounded-3xl bg-white p-4 md:p-8 shadow-sm ring-1 ring-slate-200'>
        <ProductGallery images={product.images} name={product.name} />

        <div className='flex flex-col gap-6'>
          {admin && <RefreshingProductEditor product={product} className='self-start' />}

          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl md:text-4xl font-bold tracking-tight text-darkColor'>{product.name}</h1>
            {product.intro && <p className='text-lg italic text-brand-700'>→ {product.intro}</p>}
          </div>

          {(product.medium || product.dimensions) && (
            <div className='flex flex-col gap-1 text-darkColor/80'>
              {product.medium && <p>{product.medium}</p>}
              {product.dimensions && <p>{product.dimensions}</p>}
            </div>
          )}

          <div className='flex flex-col gap-1'>
            <PriceView price={product.price} discount={product.discount} className='text-3xl text-brand-700' />
            {typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3 && (
              <p className='text-sm text-lightColor'>Only {product.stock} left</p>
            )}
          </div>

          <AddToCartButton product={product} />

          {product.description && (
            <div className='border-t pt-6'>
              <h2 className='font-semibold text-darkColor mb-2'>About this artwork</h2>
              <p className='text-lightColor leading-relaxed whitespace-pre-line'>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export default ProductPage
