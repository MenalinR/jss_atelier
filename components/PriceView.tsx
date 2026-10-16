import React from 'react'
import PriceFormatter from './PriceFormatter';
import { cn } from '@/lib/utils';

interface Props{
    price: number| undefined;
    discount: number| undefined;
    className?: string;
}

const PriceView = ({ price,discount,className}: Props) => {
  return (
    <div className='flex items-center gap-2'>
      
        <PriceFormatter amount={price} className={className}/>
        {price && discount && (
            <PriceFormatter  amount={price + (discount * price) / 100} className={cn("line-through font-medium",className,"text-slate-400")}/>
        )}
    </div>
    
  );
};
export default PriceView