"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { writeClient } from "@/sanity/lib/writeClient";
import { productType } from "@/constants";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const productStatuses = ["new", "hot", "sale"];

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const randomKey = () => Math.random().toString(36).slice(2, 12);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

// Every action re-checks the user on the server; hiding the buttons is not enough
const checkAccess = async (): Promise<string | null> => {
  if (!(await isAdmin())) return "Only admins can edit the website.";
  if (!process.env.SANITY_API_WRITE_TOKEN)
    return "SANITY_API_WRITE_TOKEN is missing in .env.local.";
  return null;
};

const run = async (task: () => Promise<void>): Promise<ActionResult> => {
  const accessError = await checkAccess();
  if (accessError) return { ok: false, error: accessError };
  try {
    await task();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Admin action Error", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
};

export const updateSiteSettings = async (formData: FormData) =>
  run(async () => {
    const fields = [
      "bannerTitle",
      "bannerDescription",
      "footerAbout",
      "address",
      "phone",
      "businessHours",
      "email",
    ];
    const values = Object.fromEntries(fields.map((field) => [field, text(formData, field)]));

    await writeClient.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
    await writeClient.patch("siteSettings").set(values).commit();
  });

const uploadImages = async (formData: FormData) => {
  const files = formData
    .getAll("newImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
    if (file.size > MAX_IMAGE_SIZE) throw new Error(`${file.name} is larger than 5 MB.`);
  }

  return Promise.all(
    files.map(async (file) => {
      const asset = await writeClient.assets.upload(
        "image",
        Buffer.from(await file.arrayBuffer()),
        { filename: file.name, contentType: file.type }
      );
      return {
        _type: "image",
        _key: randomKey(),
        asset: { _type: "reference", _ref: asset._id },
      };
    })
  );
};

// Creates a product when there is no id, otherwise updates that product
export const saveProduct = async (formData: FormData) =>
  run(async () => {
    const id = text(formData, "id");
    const name = text(formData, "name");
    const price = Number(text(formData, "price"));
    const discount = Number(text(formData, "discount") || 0);
    const stockText = text(formData, "stock");
    const variant = text(formData, "variant");
    const status = text(formData, "status");

    if (!name) throw new Error("Product name is required.");
    if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid price.");
    if (!Number.isFinite(discount) || discount < 0 || discount > 100)
      throw new Error("Discount must be between 0 and 100.");

    // Only keep images that really belong to this product, in the order the admin left them
    const keepKeys: string[] = JSON.parse(text(formData, "keepImageKeys") || "[]");
    const existing = id
      ? await writeClient.fetch<{ images?: { _key: string }[] } | null>(
          `*[_type == "product" && _id == $id][0]{ images }`,
          { id }
        )
      : null;
    if (id && !existing) throw new Error("This product no longer exists.");
    const keptImages = keepKeys
      .map((key) => existing?.images?.find((image) => image._key === key))
      .filter(Boolean);

    const newImages = await uploadImages(formData);

    const values = {
      name,
      intro: text(formData, "intro"),
      description: text(formData, "description"),
      medium: text(formData, "medium"),
      dimensions: text(formData, "dimensions"),
      price,
      discount,
      stock: stockText ? Math.max(0, Number(stockText)) : undefined,
      variant: productType.some((item) => item.value === variant) ? variant : undefined,
      status: productStatuses.includes(status) ? status : undefined,
      images: [...keptImages, ...newImages],
    };

    if (id) {
      // Keep a product's existing type if the admin did not pick a new one
      const { variant: newVariant, ...rest } = values;
      const patch = writeClient.patch(id).set(rest);
      if (newVariant) patch.set({ variant: newVariant });
      await patch.commit();
    } else {
      await writeClient.create({
        _type: "product",
        ...values,
        slug: { _type: "slug", current: `${slugify(name)}-${randomKey().slice(0, 5)}` },
      });
    }
  });

export const deleteProduct = async (id: string) =>
  run(async () => {
    await writeClient.delete(id);
  });
