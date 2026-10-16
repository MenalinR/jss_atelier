"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/sanity.types";
import ProductEditor from "./ProductEditor";
import { CategoryItem } from "@/sanity/lib/categories";

// ProductEditor for server-rendered pages: reloads the page data after a save
const RefreshingProductEditor = ({
  product,
  categories,
  className,
}: {
  product: Product;
  categories: CategoryItem[];
  className?: string;
}) => {
  const router = useRouter();
  return <ProductEditor product={product} categories={categories} onSaved={() => router.refresh()}
      onDeleted={() => router.push("/")}
      className={className} />;
};

export default RefreshingProductEditor;
