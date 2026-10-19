"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/sanity.types'
import { CategoryItem } from '@/sanity/lib/categories'
import ProductCard from './ProductCard'

// Product grid for server-rendered pages; reloads the page after an admin edit
const ProductList = ({products, categories, isAdmin = false}:{products: Product[]; categories: CategoryItem[]; isAdmin?: boolean}) => {
  const router = useRouter()
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full'>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} categories={categories} isAdmin={isAdmin} onSaved={() => router.refresh()}/>
      ))}
    </div>
  )
}

export default ProductList
