import { defineField, defineType } from "sanity";

// A customer's rating and review of a product (one per customer per product)
export const reviewType = defineType({
    name: "review",
    title: "Review",
    type: "document",

    fields: [
        defineField({
            name: "product",
            title: "Product",
            type: "reference",
            to: [{ type: "product" }],
            // Weak, so a product can still be deleted when it has reviews
            weak: true,
            readOnly: true,
        }),
        defineField({
            name: "rating",
            title: "Rating",
            type: "number",
            validation: (Rule) => Rule.required().integer().min(1).max(5),
        }),
        defineField({ name: "comment", title: "Comment", type: "text", rows: 4 }),
        defineField({ name: "authorName", title: "Shown As", type: "string" }),
        defineField({ name: "verified", title: "Verified Buyer", type: "boolean", readOnly: true }),
        defineField({ name: "clerkUserId", title: "Customer Account ID", type: "string", readOnly: true, hidden: true }),
    ],
    orderings: [{ title: "Newest first", name: "createdDesc", by: [{ field: "_createdAt", direction: "desc" }] }],
    preview: {
        select: { rating: "rating", name: "authorName", product: "product.name", comment: "comment" },
        prepare: ({ rating, name, product, comment }) => ({
            title: `${"★".repeat(rating || 0)}${"☆".repeat(5 - (rating || 0))} ${product || ""}`,
            subtitle: `${name || "Customer"}: ${comment || ""}`,
        }),
    },
});
