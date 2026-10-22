"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import HomeTabbar from './HomeTabbar'
import { client } from '@/sanity/lib/client';
import { CategoryItem } from '@/sanity/lib/categories';
import { Product } from '@/sanity.types';
import ProductCard from './ProductCard';
import NoProductsAvailable from './NoProductsAvailable';
import { Loader2 } from 'lucide-react';
import ProductEditor from './admin/ProductEditor';
import CategoryManager from './admin/CategoryManager';

interface Props{
  categories: CategoryItem[];
  // Category slug from the link (e.g. /?category=boho-art), opens that tab first
  initialCategorySlug?: string;
  isAdmin?: boolean;
}

// With no categories at all, show every product
const query = `*[_type == "product" && ($categoryId == "" || references($categoryId))] | order(_createdAt desc) {
  _id, name, slug, images, price, discount, stock, status, ratingAverage, ratingCount, intro, description, medium, dimensions, categories
}`;

const ProductGrid = ({categories, initialCategorySlug, isAdmin = false}:Props) => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(
    () => (categories.find((category) => category.slug === initialCategorySlug) || categories[0])?._id || ""
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  // If the admin deletes the open category, fall back to the first one
  useEffect(() => {
    if (!categories.some((category) => category._id === selectedId)) {
      setSelectedId(categories[0]?._id || "");
    }
  }, [categories, selectedId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Admins skip the CDN so their edits show up straight away
        const response = await client.withConfig({ useCdn: !isAdmin }).fetch<Product[]>(query, { categoryId: selectedId });
        setProducts(response);
      } catch (error) {
        console.error("Product fetching Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedId, reloadCount, isAdmin]);

  // Product changes can also change the product page, so refresh server data too
  const reload = () => {
    setReloadCount((count) => count + 1);
    router.refresh();
  };

  const selectedCategory = categories.find((category) => category._id === selectedId);

  return (
    <section id='collections' className='mt-16 flex scroll-mt-24 flex-col items-center gap-6'>
        <div className='flex flex-col items-center gap-2 text-center'>
          <span className='text-xs font-semibold uppercase tracking-[0.25em] text-brand-600'>Our collections</span>
          <h2 className='text-3xl font-bold tracking-tight text-darkColor'>Find your next favourite piece</h2>
        </div>
        <HomeTabbar categories={categories} selectedId={selectedId} onTabSelect={setSelectedId} />
        {selectedCategory?.description && (
          <p className='max-w-xl text-center text-sm text-lightColor'>{selectedCategory.description}</p>
        )}
        {isAdmin && (
          <div className='flex flex-wrap items-center justify-center gap-2'>
            <ProductEditor
              className='bg-brand-600 hover:bg-brand-700'
              categories={categories}
              defaultCategoryId={selectedId}
              onSaved={reload}
            />
            <CategoryManager categories={categories} />
          </div>
        )}
        {loading ? (
          <div className='flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-brand-50 rounded-2xl w-full mt-4'>
            <div className='flex items-center space-x-2 text-brand-600'>
              <Loader2 className=' animate-spin'/>
            <span className='text-lg font-semibold'>Product is loading...</span>
            </div>
          </div>
        ) : products.length ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 w-full'>
            {products.map((product)=>( <div key={product._id}>
              <ProductCard product={product} categories={categories} isAdmin={isAdmin} onSaved={reload}/>
            </div>
            ))}
          </div>
        ) : (
          <NoProductsAvailable selectedTab={selectedCategory?.title || "this"}/>
        )}
    </section>
  )
}

export default ProductGrid
