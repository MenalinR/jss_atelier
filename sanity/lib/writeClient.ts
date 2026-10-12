import 'server-only'
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Server-only client that can change content. Never import this in a client component.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})
