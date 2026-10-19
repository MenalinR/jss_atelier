import { defineArrayMember, defineField, defineType } from "sanity";

export const orderStatuses = [
    { title: "New", value: "new" },
    { title: "Confirmed", value: "confirmed" },
    { title: "Shipped", value: "shipped" },
    { title: "Completed", value: "completed" },
    { title: "Cancelled", value: "cancelled" },
];

// An order request placed from the website checkout (paid offline)
export const orderType = defineType({
    name: "order",
    title: "Order",
    type: "document",

    fields: [
        defineField({ name: "orderNumber", title: "Order Number", type: "string", readOnly: true }),
        defineField({
            name: "status",
            title: "Status",
            type: "string",
            options: { list: orderStatuses },
            initialValue: "new",
        }),
        defineField({ name: "customerName", title: "Customer Name", type: "string" }),
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "address", title: "Address", type: "text", rows: 3 }),
        defineField({ name: "city", title: "City", type: "string" }),
        defineField({ name: "note", title: "Customer Note", type: "text", rows: 3 }),
        defineField({
            name: "items",
            title: "Items",
            type: "array",
            readOnly: true,
            of: [
                defineArrayMember({
                    type: "object",
                    fields: [
                        defineField({ name: "product", type: "reference", to: [{ type: "product" }], weak: true }),
                        defineField({ name: "name", type: "string" }),
                        defineField({ name: "price", title: "Price (LKR)", type: "number" }),
                        defineField({ name: "quantity", type: "number" }),
                    ],
                    preview: {
                        select: { title: "name", quantity: "quantity", price: "price" },
                        prepare: ({ title, quantity, price }) => ({
                            title,
                            subtitle: `${quantity} × LKR ${price}`,
                        }),
                    },
                }),
            ],
        }),
        defineField({ name: "total", title: "Total (LKR)", type: "number", readOnly: true }),
        // Set when a logged-in customer orders, so it shows in their "My orders"
        defineField({ name: "clerkUserId", title: "Customer Account ID", type: "string", readOnly: true, hidden: true }),
    ],
    orderings: [{ title: "Newest first", name: "createdDesc", by: [{ field: "_createdAt", direction: "desc" }] }],
    preview: {
        select: { title: "orderNumber", name: "customerName", total: "total", status: "status" },
        prepare: ({ title, name, total, status }) => ({
            title: `${title} – ${name}`,
            subtitle: `LKR ${total} · ${status}`,
        }),
    },
});
