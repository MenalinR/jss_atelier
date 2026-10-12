
import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import { isAdmin } from "@/lib/admin";

export default async function Home() {
  const admin = await isAdmin();
  return (
    <div >
      <Container className="py-10">
      <HomeBanner/>
      <ProductGrid isAdmin={admin} />
      </Container>
    
    </div>
  );
}
