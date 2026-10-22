"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { hasBought, REVIEW_ID_PREFIX, reviewIdFor, updateProductRating } from "@/lib/reviews";
import { writeClient } from "@/sanity/lib/writeClient";

export interface ReviewResult {
  ok: boolean;
  error?: string;
}

// "Menalin Rajasekaran" -> "Menalin R."
const displayName = (firstName?: string | null, lastName?: string | null, fallback?: string | null) => {
  const first = (firstName || "").trim();
  const lastInitial = (lastName || "").trim().charAt(0);
  if (first) return lastInitial ? `${first} ${lastInitial.toUpperCase()}.` : first;
  return (fallback || "Customer").split("@")[0];
};

// Creates the customer's review, or updates it if they already reviewed this product
export const submitReview = async (productId: string, rating: number, comment: string): Promise<ReviewResult> => {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please log in to write a review." };
  if (await isAdmin()) return { ok: false, error: "Admins can't review products." };
  if (!process.env.SANITY_API_WRITE_TOKEN) return { ok: false, error: "Reviews are not set up yet." };

  const stars = Math.round(Number(rating));
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { ok: false, error: "Please choose a rating from 1 to 5 stars." };
  const text = String(comment ?? "").trim().slice(0, 1000);
  if (text.length > 0 && text.length < 5) return { ok: false, error: "Please write a little more, or leave the comment empty." };

  try {
    const product = await writeClient.fetch<{ _id: string } | null>(
      `*[_type == "product" && _id == $productId][0]{ _id }`,
      { productId }
    );
    if (!product) return { ok: false, error: "This product no longer exists." };

    await writeClient.createOrReplace({
      _id: reviewIdFor(productId, user.id),
      _type: "review",
      product: { _type: "reference", _ref: productId, _weak: true },
      rating: stars,
      comment: text,
      authorName: displayName(user.firstName, user.lastName, user.primaryEmailAddress?.emailAddress),
      verified: await hasBought(productId, user.id),
      clerkUserId: user.id,
    });
    await updateProductRating(productId);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Submit review Error", error);
    return { ok: false, error: "Could not save your review. Please try again." };
  }
};

// The reviewer can delete their own review; the admin can delete any review
export const deleteReview = async (reviewId: string): Promise<ReviewResult> => {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please log in." };
  if (!reviewId.startsWith(REVIEW_ID_PREFIX)) return { ok: false, error: "Unknown review." };

  try {
    const review = await writeClient.fetch<{ clerkUserId?: string; productId?: string } | null>(
      `*[_id == $reviewId][0]{ clerkUserId, "productId": product._ref }`,
      { reviewId }
    );
    if (!review) return { ok: false, error: "This review no longer exists." };
    if (review.clerkUserId !== user.id && !(await isAdmin())) return { ok: false, error: "You can only delete your own review." };

    await writeClient.delete(reviewId);
    if (review.productId) await updateProductRating(review.productId);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Delete review Error", error);
    return { ok: false, error: "Could not delete the review. Please try again." };
  }
};
