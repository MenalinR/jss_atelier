import type { Metadata } from 'next'
import Link from 'next/link'
import { Gift, Heart, Home, Sparkles } from 'lucide-react'
import CollectionPage from '@/components/CollectionPage'
import { getProducts } from '@/sanity/lib/products'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Gift Guide | JSS',
  description: 'Find the perfect artwork gift for every budget.',
}

// Price bands in LKR; max undefined = no upper limit
const budgets = [
  { slug: 'all', label: 'All gifts' },
  { slug: 'under-5000', label: 'Under LKR 5,000', max: 5000 },
  { slug: '5000-15000', label: 'LKR 5,000 – 15,000', min: 5000, max: 15000 },
  { slug: '15000-50000', label: 'LKR 15,000 – 50,000', min: 15000, max: 50000 },
  { slug: 'over-50000', label: 'Over LKR 50,000', min: 50000 },
]

const ideas = [
  { icon: Heart, title: 'For loved ones', text: 'A painting is a gift they’ll look at every day.' },
  { icon: Home, title: 'For a new home', text: 'Make a new space feel personal from day one.' },
  { icon: Sparkles, title: 'For yourself', text: 'You deserve something beautiful too.' },
]

type Props = { searchParams: Promise<{ budget?: string }> }

const GiftPage = async ({ searchParams }: Props) => {
  const { budget: budgetSlug } = await searchParams
  const budget = budgets.find((item) => item.slug === budgetSlug) || budgets[0]
  const products = await getProducts(
    `defined(price) && (!defined($min) || price >= $min) && (!defined($max) || price < $max) && stock != 0`,
    { order: 'price asc', params: { min: budget.min ?? null, max: budget.max ?? null } },
  )
  return (
    <CollectionPage
      eyebrow='Gift guide'
      title='The Perfect Gift'
      description='Original art makes a gift that lasts a lifetime. Find something special for every budget.'
      products={products}
      emptyTitle='Nothing in this price range yet'
      emptyMessage='Try another budget, or browse the whole collection.'
    >
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {ideas.map(({ icon: Icon, title, text }) => (
          <div key={title} className='flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200'>
            <div className='rounded-xl bg-brand-50 p-3 text-brand-600'><Icon className='h-5 w-5'/></div>
            <div>
              <h3 className='font-semibold text-darkColor'>{title}</h3>
              <p className='mt-1 text-sm text-lightColor'>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-col items-center gap-3'>
        <h2 className='flex items-center gap-2 text-lg font-bold text-darkColor'><Gift className='h-5 w-5 text-brand-600'/> Shop by budget</h2>
        <div className='w-full overflow-x-auto pb-2'>
          <div className='mx-auto flex w-max items-center gap-2 rounded-full bg-white p-1.5 text-sm font-semibold shadow-sm ring-1 ring-slate-200'>
            {budgets.map((item) => (
              <Link
                key={item.slug}
                href={item.slug === 'all' ? '/gift' : `/gift?budget=${item.slug}`}
                scroll={false}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 hoverEffect',
                  item.slug === budget.slug
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-lightColor hover:bg-brand-50 hover:text-brand-700'
                )}
              >{item.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </CollectionPage>
  )
}

export default GiftPage
