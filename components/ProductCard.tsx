import { Product } from '@/sanity.types'
import React from 'react'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import PriceView from './PriceView'
import ProductEditor from './admin/ProductEditor'
import StarRating from './StarRating'
import { CategoryItem } from '@/sanity/lib/categories'

// Stock label and colour; no label when the admin hasn't set a stock number
const getStockLabel = (stock?: number) => {
  if (typeof stock !== 'number') return null
  if (stock <= 0) return { text: 'Sold out', className: 'bg-slate-100 text-slate-500' }
  if (stock <= 3) return { text: `Only ${stock} left`, className: 'bg-amber-50 text-amber-700' }
  return { text: `${stock} in stock`, className: 'bg-emerald-50 text-emerald-700' }
}

interface Props{
    product: Product;
    categories?: CategoryItem[];
    isAdmin?: boolean;
    onSaved?: () => void;
}

const ProductCard = ({product, categories = [], isAdmin = false, onSaved = () => {}}:Props) => {
  const href = `/product/${product?.slug?.current}`
  const stock = getStockLabel(product?.stock)
  return (
    <div className='group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-sm shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10 hover:ring-brand-200 hoverEffect'>
        <div className='relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-brand-50'>
            {isAdmin && <ProductEditor product={product} categories={categories} onSaved={onSaved} className='absolute top-3 right-3 z-10'/>}
            <div className='absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5'>
              {product?.status && (
                <span className='rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow'>
                  {product.status}
                </span>
              )}
              {!!product?.discount && product.discount > 0 && (
                <span className='rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow'>
                  -{product.discount}%
                </span>
              )}
            </div>
            {product?.images?.length ? <Link href={href}>
            <Image src={urlFor(product?.images[0]).width(600).url()}
            width={600}
            height={600}
            alt={product?.name || 'Product picture'}
            priority
            className='h-full w-full object-contain p-4 group-hover:scale-105 hoverEffect'
            />
            </Link> : <div className='h-full'/>}
        </div>
        <div className='flex flex-1 flex-col gap-1.5 p-4'>
            <Link href={href}><h2 className='text-base font-semibold text-darkColor line-clamp-1 group-hover:text-brand-700 hoverEffect'>{product?.name}</h2></Link>
            {!!product?.ratingCount && (
              <Link href={`${href}#reviews`} className='flex items-center gap-1.5 text-xs text-lightColor'>
                <StarRating value={product.ratingAverage || 0} starClassName='h-3.5 w-3.5' />
                <span className='font-semibold text-darkColor'>{product.ratingAverage?.toFixed(1)}</span>
                <span>({product.ratingCount})</span>
              </Link>
            )}
            {product?.intro && <p className='text-lightColor line-clamp-2'>{product.intro}</p>}
            {stock && (
              <span className={cn('mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', stock.className)}>
                <span className='h-1.5 w-1.5 rounded-full bg-current'/>
                {stock.text}
              </span>
            )}
            <div className='mt-auto flex items-center justify-between gap-2 pt-3'>
              <PriceView
              className='text-base text-brand-700'
               price={product?.price}
               discount={product?.discount}
              />
              <Link href={href} aria-label={`View ${product?.name}`} className='rounded-full bg-brand-50 p-2 text-brand-700 group-hover:bg-brand-600 group-hover:text-white hoverEffect'>
                <ArrowRight className='h-4 w-4'/>
              </Link>
            </div>
        </div>
    </div>
  )
}

export default ProductCard
