// import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
    name: "product",
    title: "product",
    type: "document",
  
    fields:[
        defineField({
            name: "name",
            title: "Product Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options:{
                source:"name",
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "images",
            title: "Product Images",
            type: "array",
            of:[{type:"image",options:{hotspot:true}}],
        }),
        defineField({
            name: "intro",
            title: "Product Intro",
            type: "string",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "string",
        }),
        defineField({
            name: "price", 
            type: "number",
            title: 'Product Price (LKR)', // Update label
            description: 'Enter price in Sri Lankan Rupees (LKR)', // Add description
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "discount",
            title: "Discount Percentage",
            type: "number",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "categories",
            title: "Categories Price",
            type: "array",
            of:[{type:"reference", to:{type:"category"}}],
        }),
        defineField({
            name: "stock",
            title: "Stock",
            type: "number",
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: "status",
            title: "Product Status",
            type: "string",
            options:{
               list: [
                {title: "New", value: "new"},
                {title: "Hot", value: "hot"},
                {title: "Sale", value: "sale"},
               ],
            },
            
        }),
        defineField({
            name: "variant",
            title: "Product Type",
            type: "string",
            options:{
               list: [
                {title: "Travel Inspired Art", value: "travel Inspired Art"},
                { title: "Boho Art",value:"bohoart"},
                { title: "Modern Art",value:"modernart"},
                { title: "Landscapes Art",value:"landscapesart"},
                { title: "Nature Art",value:"natureart"},
               ],
            },
            
        }),

    ],
    preview: {
        select: {
          title: "name",
          media: "images",
          subtitle: "price",
        },
        prepare(selection) {
          const { title, subtitle, media } = selection;
          const image = media && media[0];
          return {
            title: title,
            subtitle: `$${subtitle}`,
            media: image,
          };
        },
    },
});