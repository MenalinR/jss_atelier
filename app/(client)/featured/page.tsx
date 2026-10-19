import type { Metadata } from 'next'
import CollectionPage from '@/components/CollectionPage'
import { getProducts } from '@/sanity/lib/products'

export const metadata: Metadata = {
  title: 'Featured | JSS',
  description: 'Hand-picked highlights from the JSS collection.',
}

const FeaturedPage = async () => {
  const products = await getProducts(`featured == true`, { order: '_updatedAt desc' })
  return (
    <CollectionPage
      eyebrow='Curator’s picks'
      title='Featured Artworks'
      description='Our favourite pieces right now – hand-picked from the whole collection.'
      products={products}
      emptyTitle='No featured artworks yet'
      emptyMessage='We’re choosing our favourites. Explore the full collection in the meantime.'
      adminHint='Open a product’s ✎ Edit and tick "⭐ Featured" to show it here.'
    />
  )
}

export default FeaturedPage
