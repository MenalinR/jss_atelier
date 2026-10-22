import { type SchemaTypeDefinition } from 'sanity'

import {categoryType} from './categoryType'
import { productType } from './productType'
import { siteSettingsType } from './siteSettingsType'
import { orderType } from './orderType'
import { reviewType } from './reviewType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ categoryType,productType,siteSettingsType,orderType,reviewType],
};
