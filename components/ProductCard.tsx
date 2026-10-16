import { Product } from '@/sanity.types'
import React from 'react'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import PriceView from './PriceView'
import ProductEditor from './admin/ProductEditor'

interface Props{
    product: Product;
    isAdmin?: boolean;
    onSaved?: () => void;
}

const ProductCard = ({product, isAdmin = false, onSaved = () => {}}:Props) => {
  const href = `/product/${product?.slug?.current}`
  return (
    <div className='group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-sm shadow-sm ring-1 ring-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10 hover:ring-brand-200 hoverEffect'>
        <div className='relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-brand-50'>
            {isAdmin && <ProductEditor product={product} onSaved={onSaved} className='absolute top-3 right-3 z-10'/>}
            {product?.status && (
              <span className='absolute top-3 left-3 z-10 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow'>
                {product.status}
              </span>
            )}
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
            {product?.intro && <p className='text-lightColor line-clamp-2'>{product.intro}</p>}
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
