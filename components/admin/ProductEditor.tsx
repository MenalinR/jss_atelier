"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteProduct, saveProduct } from "@/app/actions/admin";
import { productType } from "@/constants";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { EditButton, Field, FormActions, inputClassName } from "./AdminFields";

type ProductImage = NonNullable<Product["images"]>[number];

interface Props {
  // No product means "add a new product"
  product?: Product;
  defaultVariant?: string;
  onSaved: () => void;
  className?: string;
}

// Older products were saved with the tab title instead of its value
const findVariantValue = (variant?: string) =>
  productType.find(
    (item) => item.value === variant || item.title.toLowerCase() === variant?.toLowerCase()
  )?.value || "";

const ProductEditor = ({ product, defaultVariant, onSaved, className }: Props) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [keptImages, setKeptImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Reset the form every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setKeptImages(product?.images || []);
    setNewFiles([]);
    setError(undefined);
  }, [open, product]);

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  const finish = (result: { ok: boolean; error?: string }) => {
    if (!result.ok) return setError(result.error);
    setOpen(false);
    onSaved();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.delete("newImages");
    newFiles.forEach((file) => formData.append("newImages", file));
    formData.set("keepImageKeys", JSON.stringify(keptImages.map((image) => image._key)));
    setError(undefined);
    startTransition(async () => finish(await saveProduct(formData)));
  };

  const handleDelete = () => {
    if (!product?._id || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setError(undefined);
    startTransition(async () => finish(await deleteProduct(product._id)));
  };

  return (
    <>
      <EditButton
        label={product ? "Edit" : "Add product"}
        className={className}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>Changes show on the website after you save.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={product?._id || ""} />

            <Field label="Pictures">
              <div className="flex flex-wrap gap-2">
                {keptImages.map((image) => (
                  <div key={image._key} className="relative h-20 w-20 overflow-hidden rounded-md border bg-zinc-100">
                    <Image src={urlFor(image).width(160).height(160).url()} alt="Product picture" fill className="object-cover" />
                    <button
                      type="button"
                      aria-label="Remove picture"
                      onClick={() => setKeptImages((images) => images.filter((item) => item._key !== image._key))}
                      className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {previews.map((url, index) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="New picture" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove picture"
                      onClick={() => setNewFiles((files) => files.filter((_, i) => i !== index))}
                      className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                name="newImages"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  setNewFiles((current) => [...current, ...files]);
                  event.target.value = "";
                }}
                className="text-sm font-normal"
              />
              <span className="text-xs font-normal text-gray-500">The first picture is shown on the product card. Max 5 MB each.</span>
            </Field>

            <Field label="Name">
              <input name="name" required defaultValue={product?.name} className={inputClassName} />
            </Field>
            <Field label="Intro">
              <input name="intro" defaultValue={product?.intro} className={inputClassName} />
            </Field>
            <Field label="Description">
              <textarea name="description" rows={3} defaultValue={product?.description} className={inputClassName} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (LKR)">
                <input name="price" type="number" min={0} step="0.01" required defaultValue={product?.price} className={inputClassName} />
              </Field>
              <Field label="Discount (%)">
                <input name="discount" type="number" min={0} max={100} defaultValue={product?.discount ?? 0} className={inputClassName} />
              </Field>
              <Field label="Stock">
                <input name="stock" type="number" min={0} defaultValue={product?.stock} className={inputClassName} />
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={product?.status || ""} className={inputClassName}>
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="hot">Hot</option>
                  <option value="sale">Sale</option>
                </select>
              </Field>
            </div>
            <Field label="Product type (home page tab)">
              <select
                name="variant"
                defaultValue={findVariantValue(product?.variant) || defaultVariant || ""}
                className={inputClassName}
              >
                <option value="">None</option>
                {productType.map((item) => (
                  <option key={item.value} value={item.value}>{item.title}</option>
                ))}
              </select>
            </Field>

            <FormActions pending={pending} error={error}>
              {product && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleDelete}
                  className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete product
                </button>
              )}
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductEditor;
