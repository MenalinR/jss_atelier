"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActionResult, deleteCategory, moveCategory, saveCategory } from "@/app/actions/admin";
import { CategoryItem } from "@/sanity/lib/categories";
import { EditButton, Field, FormActions, inputClassName } from "./AdminFields";

const iconButtonClassName =
  "rounded-md p-1.5 text-lightColor hover:bg-brand-50 hover:text-brand-700 hoverEffect disabled:opacity-30 disabled:pointer-events-none";

// Add / edit form, used for new categories and for editing one in place
const CategoryForm = ({
  category,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  category?: CategoryItem;
  pending: boolean;
  error?: string;
  onSubmit: (formData: FormData) => void;
  onCancel?: () => void;
}) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit(new FormData(event.currentTarget));
    }}
    className="flex flex-col gap-3 rounded-xl bg-brand-50/60 p-4"
  >
    <input type="hidden" name="id" value={category?._id || ""} />
    <Field label="Category name">
      <input name="title" required defaultValue={category?.title} placeholder="e.g. Abstract Art" className={inputClassName} />
    </Field>
    <Field label="Description (optional, shown under the tabs)">
      <textarea name="description" rows={2} defaultValue={category?.description} className={inputClassName} />
    </Field>
    <FormActions pending={pending} error={error}>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-lightColor hover:underline">
          Cancel
        </button>
      )}
    </FormActions>
  </form>
);

const CategoryManager = ({ categories, className }: { categories: CategoryItem[]; className?: string }) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  // Changing the key clears the add form after a successful save
  const [addFormKey, setAddFormKey] = useState(0);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: () => Promise<ActionResult>, onSuccess?: () => void) => {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) return setError(result.error);
      onSuccess?.();
      router.refresh();
    });
  };

  const handleDelete = (category: CategoryItem) => {
    if (!confirm(`Delete the "${category.title}" category?`)) return;
    run(() => deleteCategory(category._id));
  };

  return (
    <>
      <EditButton label="Manage categories" className={className} onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          setEditingId(undefined);
          setError(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
            <DialogDescription>These are the tabs on the home page. Use the arrows to change their order.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
            {!categories.length && <p className="p-4 text-sm text-lightColor">No categories yet. Add your first one below.</p>}
            {categories.map((category, index) =>
              editingId === category._id ? (
                <div key={category._id} className="p-2">
                  <CategoryForm
                    category={category}
                    pending={pending}
                    error={error}
                    onSubmit={(formData) => run(() => saveCategory(formData), () => setEditingId(undefined))}
                    onCancel={() => setEditingId(undefined)}
                  />
                </div>
              ) : (
                <div key={category._id} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-darkColor truncate">{category.title}</p>
                    {category.description && <p className="text-xs text-lightColor truncate">{category.description}</p>}
                  </div>
                  <button type="button" aria-label="Move up" disabled={pending || index === 0} onClick={() => run(() => moveCategory(category._id, -1))} className={iconButtonClassName}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Move down" disabled={pending || index === categories.length - 1} onClick={() => run(() => moveCategory(category._id, 1))} className={iconButtonClassName}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Edit ${category.title}`} disabled={pending} onClick={() => { setError(undefined); setEditingId(category._id); }} className={iconButtonClassName}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Delete ${category.title}`} disabled={pending} onClick={() => handleDelete(category)} className={`${iconButtonClassName} hover:bg-red-50 hover:text-red-600`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
          </div>
          {!editingId && error && <p className="text-sm text-red-600">{error}</p>}

          {!editingId && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-darkColor">Add a category</h3>
              <CategoryForm key={addFormKey} pending={pending} onSubmit={(formData) => run(() => saveCategory(formData), () => setAddFormKey((key) => key + 1))} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryManager;
