import { Product } from '@/sanity.types'
import React from 'react'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
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
    <div className='group text-sm rounded-lg overflow-hidden'>
        <div className='relative bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 overflow-hidden'>
            {isAdmin && <ProductEditor product={product} onSaved={onSaved} className='absolute top-2 right-2 z-10'/>}
            {product?.images?.length ? <Link href={href}>
            <Image src={urlFor(product?.images[0]).url()}  
            width={500}
            height={500}
            alt={product?.name || 'Product picture'}
            priority
            className={`w-full h-72 object-contain overflow-hidden group-hover:scale-105 hoverEffect`}
            />
            </Link> : <div className='h-72'/>}
        </div>
        <div className='py-3 px-2 flex flex-col gap-1.5 bg-zinc-50 border border-t-0 rounded-lg rounded-tl-none rounded-tr-none  '>
            <Link href={href} className='hover:underline'><h2 className='font-semibold line-clamp-1'>{product?.name}</h2></Link>
            <p>{product?.intro}</p>
            <PriceView
            className='text-lg'
             price={product?.price} 
             discount={product?.discount}
            />
        </div>
    </div>
  )
}

export default ProductCard