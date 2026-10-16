import React from 'react'
import { cn } from '@/lib/utils';
import { CategoryItem } from '@/sanity/lib/categories';

interface Props{
    categories: CategoryItem[];
    selectedId:string;
    onTabSelect: (categoryId: string) => void;
}

const HomeTabbar = ({categories,selectedId,onTabSelect}:Props) => {
  if (!categories.length) return null;
  return (
    // Scrolls sideways on small screens instead of overflowing
    <div className='w-full overflow-x-auto pb-2'>
        <div className='mx-auto flex w-max items-center gap-2 rounded-full bg-white p-1.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200'>
            {categories.map((category) => (
                <button key={category._id}
                onClick={() => onTabSelect(category._id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 md:px-5 hoverEffect',
                  selectedId === category._id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-lightColor hover:bg-brand-50 hover:text-brand-700'
                )}
                >{category.title}</button>
            ))}
        </div>
    </div>
  )
}

export default HomeTabbar
