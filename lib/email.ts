import "server-only";
import nodemailer from "nodemailer";
import { paymentMethodTitle } from "./payment";

// Emails are sent through any SMTP account (e.g. Gmail with an App Password).
// If SMTP isn't set up, emails are skipped and orders still work.

export interface EmailOrder {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  note?: string;
  paymentMethod?: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
}

const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter: nodemailer.Transporter | undefined;
const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

// Who gets "new order" emails: ORDER_NOTIFY_EMAIL, or the admin emails
const adminRecipients = () =>
  (process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

// Never trust customer-typed text inside HTML
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const formatPrice = (amount: number) =>
  `LKR ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const sendMail = async (to: string | string[], subject: string, html: string, replyTo?: string) => {
  if (!isConfigured()) {
    console.warn(`Email skipped (SMTP not set up): ${subject}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `JSS Atelier <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      replyTo,
    });
    return true;
  } catch (error) {
    // A failed email must never break an order
    console.error("Email sending Error", error);
    return false;
  }
};

// Shared look: blue header, white card
const layout = (title: string, body: string) => `
<div style="background:#f5f8ff;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#1e40af,#2563eb,#0ea5e9);background-color:#2563eb;padding:24px;color:#ffffff">
      <div style="font-size:22px;font-weight:900;letter-spacing:3px">JSS</div>
      <div style="font-size:18px;margin-top:8px">${title}</div>
    </div>
    <div style="padding:24px;font-size:14px;line-height:1.6">${body}</div>
  </div>
  <p style="text-align:center;font-size:12px;color:#64748b;margin-top:16px">JSS Atelier · <a href="${siteUrl()}" style="color:#2563eb">${siteUrl().replace(/^https?:\/\//, "")}</a></p>
</div>`;

const itemsTable = (order: EmailOrder) => `
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  ${order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${escapeHtml(item.name)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;color:#64748b;white-space:nowrap">${item.quantity} × ${formatPrice(item.price)}</td>
      </tr>`
    )
    .join("")}
  <tr>
    <td style="padding:12px 0 0;font-weight:bold">Total</td>
    <td style="padding:12px 0 0;text-align:right;font-weight:bold;color:#1d4ed8;font-size:16px">${formatPrice(order.total)}</td>
  </tr>
</table>`;

const orderBadge = (orderNumber: string) =>
  `<p style="display:inline-block;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:999px;padding:6px 14px;font-weight:bold">Order ${escapeHtml(orderNumber)}</p>`;

// What the customer should do to pay
const paymentBlock = (order: EmailOrder, bankDetails = "") => {
  if (order.paymentMethod === "bank_transfer") {
    return `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin:16px 0">
      <p style="margin:0 0 6px"><strong>Payment: Bank Transfer</strong></p>
      ${
        bankDetails
          ? `<p style="margin:0 0 6px">Please transfer <strong>${formatPrice(order.total)}</strong> to:</p>
             <p style="margin:0 0 6px;font-family:monospace">${escapeHtml(bankDetails).replace(/\n/g, "<br>")}</p>
             <p style="margin:0">Use <strong>${escapeHtml(order.orderNumber)}</strong> as the payment reference.</p>`
          : `<p style="margin:0">We'll send you our bank details when we contact you.</p>`
      }
    </div>`;
  }
  if (order.paymentMethod === "cod") {
    return `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin:16px 0">
      <p style="margin:0"><strong>Payment: Cash on Delivery</strong> – please have <strong>${formatPrice(order.total)}</strong> ready when your artwork arrives.</p>
    </div>`;
  }
  return "";
};

const deliveryBlock = (order: EmailOrder) => `
<p style="margin:0"><strong>Delivery to:</strong><br>${escapeHtml(order.customerName)}<br>${escapeHtml(order.address).replace(/\n/g, "<br>")}, ${escapeHtml(order.city)}<br>${escapeHtml(order.phone)}</p>`;

export const sendOrderPlacedEmails = async (
  order: EmailOrder,
  contact: { phone: string; email: string; bankDetails?: string }
) => {
  const tasks: Promise<boolean>[] = [];

  if (order.email) {
    tasks.push(
      sendMail(
        order.email,
        `We received your order ${order.orderNumber}`,
        layout(
          "Thank you for your order!",
          `<p>Hi ${escapeHtml(order.customerName)},</p>
          <p>We've received your order. We'll contact you soon by phone to confirm it and arrange delivery.</p>
          ${orderBadge(order.orderNumber)}
          ${itemsTable(order)}
          ${paymentBlock(order, contact.bankDetails)}
          ${deliveryBlock(order)}
          <p style="margin-top:20px">Questions? Call us on <strong>${escapeHtml(contact.phone)}</strong> or reply to this email.</p>`
        ),
        contact.email
      )
    );
  }

  const admins = adminRecipients();
  if (admins.length) {
    tasks.push(
      sendMail(
        admins,
        `🛒 New order ${order.orderNumber} – ${formatPrice(order.total)}`,
        layout(
          "You have a new order",
          `${orderBadge(order.orderNumber)}
          <p style="margin:0"><strong>${escapeHtml(order.customerName)}</strong><br>
          📞 <a href="tel:${escapeHtml(order.phone.replace(/\s/g, ""))}" style="color:#2563eb">${escapeHtml(order.phone)}</a><br>
          ${order.email ? `✉️ <a href="mailto:${escapeHtml(order.email)}" style="color:#2563eb">${escapeHtml(order.email)}</a><br>` : "✉️ No email given – contact by phone<br>"}
          📍 ${escapeHtml(order.address).replace(/\n/g, "<br>")}, ${escapeHtml(order.city)}</p>
          ${order.note ? `<p style="background:#fffbeb;border-radius:8px;padding:10px 12px;color:#78350f">📝 ${escapeHtml(order.note)}</p>` : ""}
          ${itemsTable(order)}
          <p style="margin:0 0 16px"><strong>Payment:</strong> ${paymentMethodTitle(order.paymentMethod)}</p>
          <p><a href="${siteUrl()}/admin/orders?status=new" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold">Open orders</a></p>`
        ),
        order.email || undefined
      )
    );
  }

  await Promise.all(tasks);
};

const statusMessages: Record<string, { subject: string; title: string; text: string }> = {
  confirmed: {
    subject: "Your order {n} is confirmed",
    title: "Your order is confirmed ✅",
    text: "Good news – we've confirmed your order and are getting it ready.",
  },
  shipped: {
    subject: "Your order {n} is on its way",
    title: "Your order is on its way 🚚",
    text: "Your artwork has been sent and is on its way to you.",
  },
  cancelled: {
    subject: "Your order {n} has been cancelled",
    title: "Your order has been cancelled",
    text: "Your order has been cancelled. If you didn't expect this, please get in touch with us.",
  },
};

// Returns true if an email was sent
export const sendOrderStatusEmail = async (
  order: EmailOrder,
  status: string,
  contact: { phone: string; email: string }
) => {
  const message = statusMessages[status];
  if (!message || !order.email) return false;
  return sendMail(
    order.email,
    message.subject.replace("{n}", order.orderNumber),
    layout(
      message.title,
      `<p>Hi ${escapeHtml(order.customerName)},</p>
      <p>${message.text}</p>
      ${orderBadge(order.orderNumber)}
      ${itemsTable(order)}
      ${status !== "cancelled" ? deliveryBlock(order) : ""}
      <p style="margin-top:20px">Questions? Call us on <strong>${escapeHtml(contact.phone)}</strong> or reply to this email.</p>`
    ),
    contact.email
  );
};

export const statusEmailsFor = Object.keys(statusMessages);
export const emailIsConfigured = isConfigured;
