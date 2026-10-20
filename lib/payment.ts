// Payment methods offered at checkout (paid offline, after ordering)
export const paymentMethods = [
  {
    value: "cod",
    title: "Cash on Delivery",
    description: "Pay in cash when your artwork arrives.",
  },
  {
    value: "bank_transfer",
    title: "Bank Transfer",
    description: "Transfer the amount to our bank account. We'll show you our details after you order.",
  },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]["value"];

export const paymentMethodTitle = (value?: string) =>
  paymentMethods.find((method) => method.value === value)?.title || "Not chosen";
