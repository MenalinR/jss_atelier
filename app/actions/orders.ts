"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { ORDER_ID_PREFIX, OrderStatus } from "@/lib/orders";
import { paymentMethods, PaymentMethod } from "@/lib/payment";
import { writeClient } from "@/sanity/lib/writeClient";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { sendOrderPlacedEmails, sendOrderStatusEmail, statusEmailsFor } from "@/lib/email";

export interface PlaceOrderInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
  paymentMethod: PaymentMethod;
  // Spam trap: a hidden field real people leave empty
  website: string;
  items: { productId: string; quantity: number }[];
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof PlaceOrderInput, string>> };

interface StoredProduct {
  _id: string;
  _rev: string;
  name?: string;
  price?: number;
  stock?: number;
}

const randomCode = (length: number) =>
  Array.from({ length }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

// e.g. JSS-261019-K7QF
const makeOrderNumber = () => {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `JSS-${date}-${randomCode(4)}`;
};

const clean = (value: unknown, maxLength: number) => String(value ?? "").trim().slice(0, maxLength);

export const placeOrder = async (input: PlaceOrderInput): Promise<PlaceOrderResult> => {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return { ok: false, error: "Ordering is not set up yet. Please contact us directly." };
  }
  if (input.website) return { ok: false, error: "Something went wrong. Please try again." };
  if (await isAdmin()) return { ok: false, error: "Admins can't place orders. Log out to test checkout." };

  const details = {
    customerName: clean(input.customerName, 100),
    phone: clean(input.phone, 30),
    email: clean(input.email, 120),
    address: clean(input.address, 500),
    city: clean(input.city, 80),
    note: clean(input.note, 1000),
  };

  const fieldErrors: Partial<Record<keyof PlaceOrderInput, string>> = {};
  if (details.customerName.length < 2) fieldErrors.customerName = "Please enter your name.";
  if (!/^\+?[\d\s-]{9,15}$/.test(details.phone)) fieldErrors.phone = "Please enter a valid phone number.";
  if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) fieldErrors.email = "Please enter a valid email, or leave it empty.";
  if (details.address.length < 5) fieldErrors.address = "Please enter your delivery address.";
  if (details.city.length < 2) fieldErrors.city = "Please enter your city.";
  const paymentMethod = paymentMethods.find((method) => method.value === input.paymentMethod)?.value;
  if (!paymentMethod) fieldErrors.paymentMethod = "Please choose how you'd like to pay.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please check the highlighted fields.", fieldErrors };

  // Merge duplicate lines and ignore anything odd
  const quantities = new Map<string, number>();
  for (const item of input.items || []) {
    const quantity = Math.floor(Number(item.quantity));
    if (typeof item.productId !== "string" || !Number.isFinite(quantity) || quantity < 1) continue;
    quantities.set(item.productId, Math.min((quantities.get(item.productId) || 0) + quantity, 99));
  }
  if (!quantities.size) return { ok: false, error: "Your cart is empty." };

  // Prices and stock come from Sanity, never from the browser
  const products = await writeClient.fetch<StoredProduct[]>(
    `*[_type == "product" && _id in $ids]{ _id, _rev, name, price, stock }`,
    { ids: [...quantities.keys()] }
  );

  const problems: string[] = [];
  for (const [productId, quantity] of quantities) {
    const product = products.find((item) => item._id === productId);
    if (!product || typeof product.price !== "number") problems.push("A product in your cart is no longer available.");
    else if (typeof product.stock === "number" && product.stock < quantity)
      problems.push(
        product.stock === 0
          ? `"${product.name}" has just sold out.`
          : `Only ${product.stock} of "${product.name}" ${product.stock === 1 ? "is" : "are"} available.`
      );
  }
  if (problems.length) return { ok: false, error: `${problems.join(" ")} Please update your cart.` };

  const items = products.map((product) => ({
    _type: "object",
    _key: randomCode(10).toLowerCase(),
    product: { _type: "reference", _ref: product._id, _weak: true },
    name: product.name || "Artwork",
    price: product.price!,
    quantity: quantities.get(product._id)!,
  }));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const user = await currentUser();
  const orderNumber = makeOrderNumber();

  // Create the order and reduce stock together. ifRevisionId makes this fail if another
  // customer bought the same piece a moment earlier, so it can't be sold twice.
  const transaction = writeClient.transaction().create({
    _id: `${ORDER_ID_PREFIX}${crypto.randomUUID()}`,
    _type: "order",
    orderNumber,
    status: "new",
    paymentMethod,
    ...details,
    items,
    total,
    clerkUserId: user?.id,
  });
  for (const product of products) {
    if (typeof product.stock === "number") {
      transaction.patch(product._id, (patch) =>
        patch.ifRevisionId(product._rev).dec({ stock: quantities.get(product._id)! })
      );
    }
  }

  try {
    await transaction.commit();
  } catch (error) {
    console.error("Place order Error", error);
    return { ok: false, error: "Someone else just ordered one of these pieces. Please check your cart and try again." };
  }

  // Send the confirmation emails after responding, so the customer isn't kept waiting
  after(async () => {
    const settings = await getSiteSettings();
    await sendOrderPlacedEmails(
      { orderNumber, ...details, paymentMethod, items, total },
      { phone: settings.phone, email: settings.email, bankDetails: settings.bankDetails }
    );
  });

  revalidatePath("/", "layout");
  return { ok: true, orderNumber };
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<{ ok: boolean; error?: string; emailed?: boolean }> => {
  if (!(await isAdmin())) return { ok: false, error: "Only admins can change orders." };
  if (!orderId.startsWith(ORDER_ID_PREFIX)) return { ok: false, error: "Unknown order." };
  const allowed: OrderStatus[] = ["new", "confirmed", "shipped", "completed", "cancelled"];
  if (!allowed.includes(status)) return { ok: false, error: "Unknown status." };

  try {
    const order = await writeClient.fetch<{
      status: OrderStatus;
      orderNumber: string;
      customerName: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      total: number;
      items: { product?: { _ref: string }; name: string; price: number; quantity: number }[];
    } | null>(
      `*[_id == $orderId][0]{ status, orderNumber, customerName, phone, email, address, city, total, items[]{ product, name, price, quantity } }`,
      { orderId }
    );
    if (!order) return { ok: false, error: "This order no longer exists." };
    if (order.status === "cancelled") return { ok: false, error: "Cancelled orders can't be changed." };
    if (order.status === status) return { ok: true };

    const transaction = writeClient.transaction().patch(orderId, { set: { status } });
    if (status === "cancelled") {
      // Put the pieces back on sale (only products that track stock)
      const productIds = order.items.map((item) => item.product?._ref).filter(Boolean) as string[];
      const tracked = await writeClient.fetch<string[]>(
        `*[_type == "product" && _id in $ids && defined(stock)]._id`,
        { ids: productIds }
      );
      for (const item of order.items) {
        if (item.product && tracked.includes(item.product._ref)) {
          transaction.patch(item.product._ref, { inc: { stock: item.quantity } });
        }
      }
    }
    await transaction.commit();
    revalidatePath("/", "layout");

    // Let the customer know (confirmed / shipped / cancelled)
    let emailed = false;
    if (statusEmailsFor.includes(status) && order.email) {
      const settings = await getSiteSettings();
      emailed = await sendOrderStatusEmail(order, status, { phone: settings.phone, email: settings.email });
    }
    return { ok: true, emailed };
  } catch (error) {
    console.error("Update order Error", error);
    return { ok: false, error: "Could not update the order. Please try again." };
  }
};
