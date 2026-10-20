import { client } from './client'

export interface SiteSettings {
  bannerTitle: string
  bannerDescription: string
  footerAbout: string
  address: string
  phone: string
  businessHours: string
  email: string
  bankDetails: string
}

// Shown until the admin fills in Site Settings in the Studio
const defaultSettings: SiteSettings = {
  bannerTitle: 'Best Painting Collections',
  bannerDescription:
    'Welcome to JSS – where every painting tells a story. Explore a world of colors, creativity, and inspiration.',
  footerAbout:
    'JSS Atelier – original paintings and art collections, made with love in Sri Lanka.',
  address: 'B10, Maddumagewatta, Housing Scheme,Nugegoda',
  phone: '0761111111',
  businessHours: 'Mon- Sat: 9:00 AM - 7:00 PM',
  email: 'jss09@gmail.com',
  // Empty until the admin adds them
  bankDetails: '',
}

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const settings = await client.fetch<Partial<SiteSettings> | null>(
      `*[_type == "siteSettings" && _id == "siteSettings"][0]`,
      {},
      // Skip the CDN; Next caches this and admin saves clear the cache
      { useCdn: false, next: { revalidate: 60 } },
    )
    // Fall back field by field so an empty field never blanks the page
    const merged = { ...defaultSettings }
    for (const key of Object.keys(defaultSettings) as (keyof SiteSettings)[]) {
      if (settings?.[key]) merged[key] = settings[key]!
    }
    return merged
  } catch (error) {
    console.error('Site settings fetching Error', error)
    return defaultSettings
  }
}
