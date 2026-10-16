// import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
 
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers show first in the home page tabs',
    }),
    defineField({
      name: "image",
      title: "Category Image",
      type: "image",
      options:{
        hotspot:true,
      },

    }),
  ],
  orderings: [
    {title: 'Tab order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview:{
    select:{
      title:"title",
      subtitle:"description",
      media: "image",
    },
  },
});
