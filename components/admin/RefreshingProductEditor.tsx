"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/sanity.types";
import ProductEditor from "./ProductEditor";

// ProductEditor for server-rendered pages: reloads the page data after a save
const RefreshingProductEditor = ({ product, className }: { product: Product; className?: string }) => {
  const router = useRouter();
  return <ProductEditor product={product} onSaved={() => router.refresh()}
      onDeleted={() => router.push("/")}
      className={className} />;
};

export default RefreshingProductEditor;
