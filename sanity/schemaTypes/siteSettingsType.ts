import { defineField, defineType } from "sanity";

// Single document holding the editable site-wide text (banner, footer, contact details)
export const siteSettingsType = defineType({
    name: "siteSettings",
    title: "Site Settings",
    type: "document",

    fields: [
        defineField({
            name: "bannerTitle",
            title: "Home Banner Title",
            type: "string",
        }),
        defineField({
            name: "bannerDescription",
            title: "Home Banner Description",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "footerAbout",
            title: "Footer About Text",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "address",
            title: "Address",
            type: "string",
        }),
        defineField({
            name: "phone",
            title: "Phone",
            type: "string",
        }),
        defineField({
            name: "businessHours",
            title: "Business Hours",
            type: "string",
        }),
        defineField({
            name: "email",
            title: "Email",
            type: "string",
        }),
    ],
    preview: {
        prepare() {
            return { title: "Site Settings" };
        },
    },
});
