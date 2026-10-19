import type { Metadata } from 'next'
import CollectionPage from '@/components/CollectionPage'
import { getProducts } from '@/sanity/lib/products'

export const metadata: Metadata = {
  title: 'Drawings | JSS',
  description: 'Original pencil, charcoal and ink drawings.',
}

// Words in a product's medium, name or category that mean it is a drawing
const drawingWords = ['drawing*', 'pencil', 'charcoal', 'sketch*', 'ink', 'pastel*', 'graphite']

const DrawingPage = async () => {
  // GROQ "match" with a list needs every word, so check each word on its own (any one is enough)
  const params = Object.fromEntries(drawingWords.map((word, index) => [`word${index}`, word]))
  const filter = drawingWords
    .map((_, index) => `medium match $word${index} || name match $word${index} || count(categories[@->title match $word${index}]) > 0`)
    .join(' || ')
  const products = await getProducts(filter, { params })
  return (
    <CollectionPage
      eyebrow='Works on paper'
      title='Drawings'
      description='Pencil, charcoal, ink and pastel – original drawings full of detail and character.'
      products={products}
      emptyTitle='No drawings yet'
      emptyMessage='Our artists are sketching. Check back soon, or explore our paintings.'
      adminHint='Products show here when their Medium mentions drawing, pencil, charcoal, sketch, ink, pastel or graphite (for example "Pencil drawing on paper").'
    />
  )
}

export default DrawingPage
