"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";

const ratingWords = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// Write a new review, or edit the customer's existing one
const ReviewForm = ({
  productId,
  existing,
  onDone,
}: {
  productId: string;
  existing?: { rating: number; comment?: string };
  onDone?: () => void;
}) => {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment || "");
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const shown = hovered || rating;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) return setError("Please choose a rating.");
    setError(undefined);
    startTransition(async () => {
      const result = await submitReview(productId, rating, comment);
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
      onDone?.();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-lightBg p-5 ring-1 ring-slate-200">
      <h3 className="font-semibold text-darkColor">{existing ? "Edit your review" : "Write a review"}</h3>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              className="rounded p-0.5 hover:scale-110 hoverEffect"
            >
              <Star className={cn("h-7 w-7", star <= shown ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
            </button>
          ))}
        </div>
        <span className="text-sm font-medium text-lightColor">{ratingWords[shown] || "Tap a star to rate"}</span>
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="What did you like about this artwork? (optional)"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-darkColor focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && !pending && <p className="text-sm text-emerald-600">Thank you! Your review is saved.</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/30 hover:bg-brand-700 hoverEffect disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {existing ? "Update review" : "Post review"}
        </button>
        {existing && onDone && (
          <button type="button" onClick={onDone} className="text-sm font-semibold text-lightColor hover:underline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
