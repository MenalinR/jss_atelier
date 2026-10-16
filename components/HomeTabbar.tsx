import { productType } from '@/constants';
import React from 'react'
import { cn } from '@/lib/utils';

interface Props{
    selectedTab:string;
    onTabSelect: (tab: string) => void;

}

const HomeTabbar = ({selectedTab,onTabSelect}:Props) => {
  return (
    // Scrolls sideways on small screens instead of overflowing
    <div className='w-full overflow-x-auto pb-2'>
        <div className='mx-auto flex w-max items-center gap-2 rounded-full bg-white p-1.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200'>
            {productType?.map((item) => (
                <button key={item?.title}
                onClick={() => onTabSelect(item?.title)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 md:px-5 hoverEffect',
                  selectedTab === item?.title
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-lightColor hover:bg-brand-50 hover:text-brand-700'
                )}
                >{item?.title}</button>
            ))}
        </div>
    </div>
  )
}

export default HomeTabbar
