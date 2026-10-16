import { client } from './client'

// The fields the website needs from a category
export interface CategoryItem {
  _id: string
  title: string
  slug: string
  description?: string
}

export const categoriesQuery = `*[_type == "category" && defined(title)] | order(order asc, title asc) {
  _id, title, "slug": slug.current, description
}`

export const getCategories = async (): Promise<CategoryItem[]> => {
  try {
    return await client.fetch<CategoryItem[]>(
      categoriesQuery,
      {},
      // Skip the CDN; Next caches this and admin saves clear the cache
      { useCdn: false, next: { revalidate: 60 } },
    )
  } catch (error) {
    console.error('Categories fetching Error', error)
    return []
  }
}
