import { client } from './client'
import { Product } from '@/sanity.types'

const productFields = `_id, _createdAt, name, slug, images, price, discount, stock, status, featured, intro, description, medium, dimensions, categories`

// Fetches products matching a GROQ filter, e.g. `discount > 0`
export const getProducts = async (
  filter: string,
  { order = '_createdAt desc', params = {} }: { order?: string; params?: Record<string, unknown> } = {},
): Promise<Product[]> => {
  try {
    return await client.fetch<Product[]>(
      `*[_type == "product" && (${filter})] | order(${order}) { ${productFields} }`,
      params,
      // Skip the CDN; Next caches this and admin saves clear the cache
      { useCdn: false, next: { revalidate: 60 } },
    )
  } catch (error) {
    console.error('Product fetching Error', error)
    return []
  }
}
