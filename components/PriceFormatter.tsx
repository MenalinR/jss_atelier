import { cn } from '@/lib/utils';
import React from 'react'

interface Props{
    amount: number| undefined;
    className?: string;
}
const PriceFormatter = ({amount,className}:Props) => {
  // Always "LKR 1,000.00", whatever the visitor's browser language is
  const formattedPrice= `LKR ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits:2,
    maximumFractionDigits:2,
  })}`
    return <span className={cn("text-sm font-semibold text-darkColor",className)}>{formattedPrice}</span>
  
}

export default PriceFormatter