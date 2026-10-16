import React from 'react'
import {motion} from "motion/react"
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const NoProductsAvailable = ({selectedTab,className}:{selectedTab:string;className?:string}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-brand-50 rounded-2xl w-full mt-4 px-4", className)}>
       <motion.div
       initial={{opacity:0,y: -20}}
       animate={{opacity:1,y: 0}}
       transition={{duration: 0.5}}
       >
        <h2 className='text-2xl font-bold text-darkColor'> No Product Available</h2>
        </motion.div> 
        <motion.p className='text-lightColor' 
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.2, duration: 0.5}}
        >
            we&apos;re sorry, but there are no products matching on{" "}
            <span className='text-base font-semibold text-brand-700'>
                {selectedTab}
            </span>{" "}
            criteria at the moment.
        </motion.p>
        <motion.div
        animate={{scale:[1,1.1,1]}}
        transition={{repeat: Infinity, duration: 1.5}}
        className='flex items-center space-x-2 text-brand-600'>
            <Loader2 className='w-4 h-4 animate-spin'/>{""} <span>We&apos;re restocking shortly</span>
        </motion.div>
        <motion.p
         initial={{opacity: 0}}
         animate={{opacity: 1}}
         transition={{delay: 0.4, duration: 0.5}}
        className='text-sm text-lightColor'>
            Please check back later or explore our other product categories.
        </motion.p>
     </div>
  )
}

export default NoProductsAvailable