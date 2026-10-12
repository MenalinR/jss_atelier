"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/sanity.types'
import { urlFor } from '@/sanity/lib/image'
import { cn } from '@/lib/utils'

const ProductGallery = ({images = [], name}:{images?: Product["images"]; name?: string}) => {
  const [active, setActive] = useState(0)
  const current = images?.[active] || images?.[0]

  if (!current) {
    return <div className='w-full aspect-[4/5] bg-zinc-100 rounded-md'/>
  }

  return (
    <div className='flex flex-col-reverse md:flex-row gap-4'>
      {images.length > 1 && (
        <div className='flex md:flex-col gap-3 overflow-x-auto md:overflow-visible'>
          {images.map((image, index) => (
            <button
              key={image._key}
              type='button'
              onClick={() => setActive(index)}
              aria-label={`Show picture ${index + 1}`}
              className={cn(
                'relative shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden border-2 hoverEffect',
                index === active ? 'border-darkColor' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={urlFor(image).width(200).height(200).url()} alt={`${name} thumbnail ${index + 1}`} fill className='object-cover'/>
            </button>
          ))}
        </div>
      )}
      <div className='flex-1 flex items-start justify-center'>
        <Image
          src={urlFor(current).width(1200).url()}
          alt={name || 'Product picture'}
          width={1200}
          height={1500}
          priority
          className='w-full max-h-[80vh] object-contain'
        />
      </div>
    </div>
  )
}

export default ProductGallery
