import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// Shows 0–5 stars, including partly filled stars (e.g. 4.5)
const StarRating = ({value = 0, className, starClassName}:{value?: number; className?: string; starClassName?: string}) => (
  <span className={cn('inline-flex items-center gap-0.5', className)} role='img' aria-label={`${value.toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const fill = Math.max(0, Math.min(1, value - (star - 1)))
      return (
        <span key={star} className='relative inline-block'>
          <Star className={cn('h-4 w-4 text-slate-200 fill-slate-200', starClassName)} />
          {fill > 0 && (
            <span className='absolute inset-0 overflow-hidden' style={{ width: `${fill * 100}%` }}>
              <Star className={cn('h-4 w-4 text-amber-400 fill-amber-400', starClassName)} />
            </span>
          )}
        </span>
      )
    })}
  </span>
)

export default StarRating
