"use client"
import React, { useEffect, useState } from 'react'
import HomeTabbar from './HomeTabbar'
import { productType } from '@/constants';
import { client } from '@/sanity/lib/client';
import { Product } from '@/sanity.types';
import ProductCard from './ProductCard';
import NoProductsAvailable from './NoProductsAvailable';
import {motion,AnimatePresence} from "motion/react"
import { Loader2 } from 'lucide-react';
import ProductEditor from './admin/ProductEditor';

const ProductGrid = ({isAdmin = false}:{isAdmin?: boolean}) => {
  const [selectedTab, setSelectedTab] = useState(productType[0]?.title || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  // Match the tab's stored value, or its title (older products were saved with the title)
  const query = `*[_type == "product" && lower(variant) in [$value, $title]] { 
    _id, name, slug, images, price, discount, stock, status, intro, description, medium, dimensions, variant 
  }`;
  
  const tab = productType.find((item) => item.title === selectedTab);
  const params = {
    value: (tab?.value || "").toLowerCase(),
    title: selectedTab.toLowerCase(),
  };
  
  useEffect(() => {
  
    const fetchData = async () => {
      setLoading(true);
      try {
        // Admins skip the CDN so their edits show up straight away
        const response = await client.withConfig({ useCdn: !isAdmin }).fetch(query,params);
        setProducts(await response);
      } catch (error) {
        console.error("Product fetching Error", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [selectedTab, reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);
  
   
  return (
    <section id='collections' className='mt-16 flex scroll-mt-24 flex-col items-center gap-6'>
        <div className='flex flex-col items-center gap-2 text-center'>
          <span className='text-xs font-semibold uppercase tracking-[0.25em] text-brand-600'>Our collections</span>
          <h2 className='text-3xl font-bold tracking-tight text-darkColor'>Find your next favourite piece</h2>
        </div>
        <HomeTabbar  selectedTab={selectedTab} onTabSelect={setSelectedTab} />
        {isAdmin && (
          <ProductEditor
            className='bg-brand-600 hover:bg-brand-700'
            defaultVariant={productType.find((item) => item.title === selectedTab)?.value}
            onSaved={reload}
          />
        )}
        {loading ? (
          <div className='flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-brand-50 rounded-2xl w-full mt-4'>
            <div className='flex items-center space-x-2 text-brand-600'>
              <Loader2 className=' animate-spin'/>
            <span className='text-lg font-semibold'>Product is loading...</span>
            </div>
          </div>
        ) : (
          <>
          {products?.length ?(
            <div  className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 w-full'>
          {products?.map((product:Product)=>( <div key={product?._id}>
            <ProductCard product={product} isAdmin={isAdmin} onSaved={reload}/>
          </div>
          ))}
          </div>
        ):(
          <NoProductsAvailable selectedTab={selectedTab}/>
        )}
          </>
        )}
    </section>
  )
}

export default ProductGrid