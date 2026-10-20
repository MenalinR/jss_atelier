import "server-only";
import { writeClient } from "@/sanity/lib/writeClient";

export type OrderStatus = "new" | "confirmed" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  _key: string;
  product?: { _ref: string };
  name: string;
  price: number;
  quantity: number;
  slug?: string;
}

export interface Order {
  _id: string;
  _createdAt: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  note?: string;
  items: OrderItem[];
  total: number;
}

// Orders hold personal details, so they use IDs with a dot ("orders.xxx").
// Sanity keeps those private: only requests with the secret token can read them.
export const ORDER_ID_PREFIX = "orders.";

const orderFields = `_id, _createdAt, orderNumber, status, paymentMethod, customerName, phone, email, address, city, note, total,
  items[]{ _key, product, name, price, quantity, "slug": product->slug.current }`;

export const getAllOrders = () =>
  writeClient.fetch<Order[]>(
    `*[_type == "order" && _id in path("orders.**")] | order(_createdAt desc) { ${orderFields} }`,
    {},
    { cache: "no-store" }
  );

export const getOrdersForUser = (clerkUserId: string) =>
  writeClient.fetch<Order[]>(
    `*[_type == "order" && _id in path("orders.**") && clerkUserId == $clerkUserId] | order(_createdAt desc) { ${orderFields} }`,
    { clerkUserId },
    { cache: "no-store" }
  );

export const getOrderByNumber = (orderNumber: string) =>
  writeClient.fetch<Order | null>(
    `*[_type == "order" && _id in path("orders.**") && orderNumber == $orderNumber][0] { ${orderFields} }`,
    { orderNumber },
    { cache: "no-store" }
  );
