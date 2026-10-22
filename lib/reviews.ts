import "server-only";
import { writeClient } from "@/sanity/lib/writeClient";

// Reviews use private IDs ("reviews.<product>.<user>") so the customer's account ID
// is never public; the website only shows the fields below.
export const REVIEW_ID_PREFIX = "reviews.";

export const reviewIdFor = (productId: string, clerkUserId: string) =>
  `${REVIEW_ID_PREFIX}${productId}.${clerkUserId}`;

export interface PublicReview {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  rating: number;
  comment?: string;
  authorName: string;
  verified: boolean;
  isMine: boolean;
}

export const getReviewsForProduct = (productId: string, clerkUserId?: string | null) =>
  writeClient.fetch<PublicReview[]>(
    `*[_type == "review" && _id in path("reviews.**") && product._ref == $productId] | order(_createdAt desc) {
      _id, _createdAt, _updatedAt, rating, comment, authorName,
      "verified": coalesce(verified, false),
      "isMine": defined($userId) && clerkUserId == $userId
    }`,
    { productId, userId: clerkUserId ?? null },
    { cache: "no-store" }
  );

// Stores the average and count on the product, so product cards can show them
export const updateProductRating = async (productId: string) => {
  const ratings = await writeClient.fetch<number[]>(
    `*[_type == "review" && _id in path("reviews.**") && product._ref == $productId].rating`,
    { productId }
  );
  const patch = writeClient.patch(productId);
  if (ratings.length) {
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    patch.set({ ratingAverage: Math.round(average * 10) / 10, ratingCount: ratings.length });
  } else {
    patch.unset(["ratingAverage", "ratingCount"]);
  }
  await patch.commit();
};

// Has this customer ordered the product (and not cancelled)?
export const hasBought = (productId: string, clerkUserId: string) =>
  writeClient.fetch<boolean>(
    `count(*[_type == "order" && _id in path("orders.**") && clerkUserId == $clerkUserId
      && status != "cancelled" && $productId in items[].product._ref]) > 0`,
    { productId, clerkUserId }
  );
