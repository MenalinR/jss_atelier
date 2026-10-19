import type { Metadata } from 'next'
import CollectionPage from '@/components/CollectionPage'
import { getProducts } from '@/sanity/lib/products'

export const metadata: Metadata = {
  title: 'Sale | JSS',
  description: 'Original artworks at special prices.',
}

const SalePage = async () => {
  // Biggest discounts first
  const products = await getProducts(`discount > 0 || status == "sale"`, {
    order: 'coalesce(discount, 0) desc, _createdAt desc',
  })
  return (
    <CollectionPage
      eyebrow='Limited time'
      title='Sale'
      description='Original artworks at special prices. Once a piece is gone, it’s gone.'
      products={products}
      emptyTitle='No sale items right now'
      emptyMessage='There are no discounts at the moment. Keep an eye on this page for our next sale.'
      adminHint='Give a product a Discount (%) or set its Status to "Sale" to show it here.'
    />
  )
}

export default SalePage
