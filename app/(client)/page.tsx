import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import { isAdmin } from "@/lib/admin";
import { getCategories } from "@/sanity/lib/categories";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function Home({ searchParams }: Props) {
  const [admin, categories, { category }] = await Promise.all([isAdmin(), getCategories(), searchParams]);
  return (
    <div >
      <Container className="py-10">
      <HomeBanner/>
      {/* key: reopen the right tab when a footer category link is clicked */}
      <ProductGrid key={category} isAdmin={admin} categories={categories} initialCategorySlug={category} />
      </Container>

    </div>
  );
}
