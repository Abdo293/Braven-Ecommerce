import { Categories } from "@/components/home/categories/Categories";
import { DealOfTheWeek } from "@/components/home/deal-of-week/DealOfTheWeek";
import { HeroSction } from "@/components/home/hero/HeroSction";
import { LatestProducts } from "@/components/home/latest-products/LatestProducts";
import { ProductOffer } from "@/components/home/product-offer/ProductOffer";

export default function Home() {
  return (
    <div>
      <HeroSction />
      <Categories />
      <LatestProducts />
      <ProductOffer />
      <DealOfTheWeek />
    </div>
  );
}
