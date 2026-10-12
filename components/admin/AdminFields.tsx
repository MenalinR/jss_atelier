import { cn } from "@/lib/utils";
import React from "react";

// Small shared building blocks for the admin edit dialogs

export const inputClassName =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-darkColor focus:border-darkColor focus:outline-none";

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-darkColor">
    {label}
    {children}
  </label>
);

export const EditButton = ({
  label = "Edit",
  className,
  ...props
}: React.ComponentProps<"button"> & { label?: string }) => (
  <button
    type="button"
    className={cn(
      "inline-flex items-center gap-1 rounded-full bg-darkColor px-3 py-1 text-xs font-semibold text-white shadow hover:bg-lightColor hoverEffect",
      className
    )}
    {...props}
  >
    ✎ {label}
  </button>
);

export const FormActions = ({
  pending,
  error,
  children,
}: {
  pending: boolean;
  error?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    {error && <p className="text-sm text-red-600">{error}</p>}
    <div className="flex items-center justify-between gap-2">
      <div>{children}</div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-darkColor px-5 py-2 text-sm font-semibold text-white hover:bg-lightColor hoverEffect disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </div>
  </div>
);
