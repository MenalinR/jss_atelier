"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { writeClient } from "@/sanity/lib/writeClient";

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

    // Only link categories that really exist
    const requestedCategories = formData.getAll("categories").map(String);
    const categoryIds = requestedCategories.length
      ? await writeClient.fetch<string[]>(
          `*[_type == "category" && _id in $ids]._id`,
          { ids: requestedCategories }
        )
      : [];

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
      categories: categoryIds.map((categoryId) => ({
        _type: "reference",
        _ref: categoryId,
        _key: randomKey(),
      })),
      status: productStatuses.includes(status) ? status : undefined,
      images: [...keptImages, ...newImages],
    };

    if (id) {
      await writeClient.patch(id).set(values).commit();
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

// Creates a category when there is no id, otherwise renames / re-describes it
export const saveCategory = async (formData: FormData) =>
  run(async () => {
    const id = text(formData, "id");
    const title = text(formData, "title");
    const description = text(formData, "description");
    if (!title) throw new Error("Category name is required.");

    const duplicate = await writeClient.fetch<string | null>(
      `*[_type == "category" && lower(title) == lower($title) && _id != $id][0]._id`,
      { title, id }
    );
    if (duplicate) throw new Error(`A category called "${title}" already exists.`);

    if (id) {
      // The slug stays the same so existing links keep working
      await writeClient.patch(id).set({ title, description }).commit();
      return;
    }

    const lastOrder = await writeClient.fetch<number | null>(
      `*[_type == "category"] | order(order desc)[0].order`
    );
    await writeClient.create({
      _type: "category",
      title,
      description,
      order: (lastOrder ?? 0) + 1,
      slug: { _type: "slug", current: `${slugify(title)}-${randomKey().slice(0, 5)}` },
    });
  });

export const deleteCategory = async (id: string) =>
  run(async () => {
    const productCount = await writeClient.fetch<number>(
      `count(*[_type == "product" && references($id)])`,
      { id }
    );
    if (productCount > 0)
      throw new Error(
        `This category still has ${productCount} product${productCount === 1 ? "" : "s"}. Move ${productCount === 1 ? "it" : "them"} to another category first.`
      );
    await writeClient.delete(id);
  });

// Moves a category one place left (-1) or right (+1) in the tabs
export const moveCategory = async (id: string, direction: -1 | 1) =>
  run(async () => {
    const ids = await writeClient.fetch<string[]>(
      `*[_type == "category"] | order(order asc, title asc)._id`
    );
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];

    // Renumber everything so the order is always clean
    const transaction = writeClient.transaction();
    ids.forEach((categoryId, index) => transaction.patch(categoryId, { set: { order: index + 1 } }));
    await transaction.commit();
  });
