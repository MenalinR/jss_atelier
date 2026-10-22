import React from 'react'
import { BadgeCheck, Star } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { SignInButton } from '@clerk/nextjs'
import StarRating from '../StarRating'
import ReviewForm from './ReviewForm'
import ReviewActions from './ReviewActions'
import { getReviewsForProduct } from '@/lib/reviews'
import { isAdmin } from '@/lib/admin'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' })

// Rating summary, review form and the list of reviews for one product
const ProductReviews = async ({productId}:{productId: string}) => {
  const [user, admin] = await Promise.all([currentUser(), isAdmin()])
  const reviews = await getReviewsForProduct(productId, user?.id)
  const myReview = reviews.find((review) => review.isMine)
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <section id='reviews' className='scroll-mt-24 rounded-3xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-200'>
      <h2 className='mb-6 text-2xl font-bold tracking-tight text-darkColor'>Customer reviews</h2>

      <div className='grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]'>
        {/* Summary */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-end gap-3'>
            <span className='text-5xl font-bold text-darkColor'>{reviews.length ? average.toFixed(1) : '–'}</span>
            <div className='flex flex-col gap-1 pb-1'>
              <StarRating value={average} />
              <span className='text-sm text-lightColor'>
                {reviews.length ? `${reviews.length} review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-1.5'>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((review) => review.rating === stars).length
              const percent = reviews.length ? (count / reviews.length) * 100 : 0
              return (
                <div key={stars} className='flex items-center gap-2 text-xs text-lightColor'>
                  <span className='w-3 text-right'>{stars}</span>
                  <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                  <div className='h-2 flex-1 overflow-hidden rounded-full bg-slate-100'>
                    <div className='h-full rounded-full bg-amber-400' style={{ width: `${percent}%` }} />
                  </div>
                  <span className='w-5'>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className='flex flex-col gap-6'>
          {/* Write a review */}
          {admin ? (
            <p className='rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800 ring-1 ring-brand-200'>
              Customers can review this product here. As admin you can delete any review.
            </p>
          ) : !user ? (
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-lightBg p-5 ring-1 ring-slate-200'>
              <p className='text-sm text-darkColor'>Own this artwork? Share your thoughts with other customers.</p>
              <SignInButton mode='modal'>
                <button className='rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 hoverEffect'>
                  Log in to write a review
                </button>
              </SignInButton>
            </div>
          ) : !myReview ? (
            <ReviewForm productId={productId} />
          ) : null}

          {/* Reviews */}
          {reviews.length ? (
            <div className='flex flex-col divide-y divide-slate-100'>
              {reviews.map((review) => (
                <article key={review._id} className='flex flex-col gap-2 py-5 first:pt-0'>
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                    <StarRating value={review.rating} />
                    <span className='text-sm font-semibold text-darkColor'>{review.authorName}</span>
                    {review.verified && (
                      <span className='flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                        <BadgeCheck className='h-3.5 w-3.5' /> Verified buyer
                      </span>
                    )}
                    {review.isMine && <span className='rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700'>Your review</span>}
                    <span className='text-xs text-lightColor'>{formatDate(review._createdAt)}</span>
                  </div>
                  {review.comment && <p className='whitespace-pre-line text-sm leading-relaxed text-lightColor'>{review.comment}</p>}
                  {(review.isMine || admin) && (
                    <ReviewActions
                      reviewId={review._id}
                      productId={productId}
                      canEdit={review.isMine}
                      existing={{ rating: review.rating, comment: review.comment }}
                    />
                  )}
                </article>
              ))}
            </div>
          ) : (
            !admin && user && <p className='text-sm text-lightColor'>Be the first to review this artwork.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProductReviews
