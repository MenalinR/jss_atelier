import type { Metadata } from 'next'
import CollectionPage from '@/components/CollectionPage'
import { getProducts } from '@/sanity/lib/products'

export const metadata: Metadata = {
  title: 'New Arrivals | JSS',
  description: 'The latest paintings and artworks added to JSS.',
}

const NEW_FOR_DAYS = 60

const NewPage = async () => {
  // Marked "New" by the admin, or added recently
  const products = await getProducts(
    `status == "new" || dateTime(_createdAt) > dateTime(now()) - 60 * 60 * 24 * $days`,
    { params: { days: NEW_FOR_DAYS } },
  )
  return (
    <CollectionPage
      eyebrow='Just arrived'
      title='New Arrivals'
      description='Fresh from the studio – the newest paintings and artworks, before anyone else sees them.'
      products={products}
      emptyTitle='No new arrivals right now'
      emptyMessage='New pieces are on their way. In the meantime, explore our full collection.'
      adminHint={`Products added in the last ${NEW_FOR_DAYS} days show here automatically. You can also set a product's Status to "New".`}
    />
  )
}

export default NewPage
