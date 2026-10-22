"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteReview } from "@/app/actions/reviews";
import ReviewForm from "./ReviewForm";

// Edit / delete buttons on a review: the reviewer gets both, the admin gets delete
const ReviewActions = ({
  reviewId,
  productId,
  canEdit,
  existing,
}: {
  reviewId: string;
  productId: string;
  canEdit: boolean;
  existing: { rating: number; comment?: string };
}) => {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Delete this review?")) return;
    setError(undefined);
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  };

  if (editing) {
    return <ReviewForm productId={productId} existing={existing} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="flex items-center gap-4 text-xs font-semibold">
      {canEdit && (
        <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-lightColor hover:text-brand-700 hoverEffect">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      )}
      <button type="button" disabled={pending} onClick={handleDelete} className="flex items-center gap-1 text-lightColor hover:text-red-600 hoverEffect disabled:opacity-50">
        <Trash2 className="h-3.5 w-3.5" /> {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="font-normal text-red-600">{error}</span>}
    </div>
  );
};

export default ReviewActions;
