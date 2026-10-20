"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/orders";
import type { OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { statusStyles } from "../OrderCard";

const statuses: OrderStatus[] = ["new", "confirmed", "shipped", "completed", "cancelled"];

const OrderStatusSelect = ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as OrderStatus;
    if (next === "cancelled" && !confirm("Cancel this order? Its items will be put back in stock. This can't be undone.")) {
      event.target.value = status;
      return;
    }
    setError(undefined);
    setNotice(undefined);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (!result.ok) setError(result.error);
      else if (result.emailed) setNotice("✉️ Customer emailed");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        aria-label="Order status"
        defaultValue={status}
        key={status}
        disabled={pending || status === "cancelled"}
        onChange={handleChange}
        className={cn("rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 focus:outline-none disabled:opacity-70", statusStyles[status])}
      >
        {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      {pending && <span className="text-xs text-lightColor">Saving…</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
      {notice && <span className="text-xs text-emerald-600">{notice}</span>}
    </div>
  );
};

export default OrderStatusSelect;
