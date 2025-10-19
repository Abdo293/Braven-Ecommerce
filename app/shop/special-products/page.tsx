"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { ProductsCard } from "@/components/products-card/ProductsCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useOffer } from "@/hooks/useOffers";
import { useProductsMedia } from "@/hooks/useProductsMedia";
import { useTypes } from "@/hooks/useTypes";
import { useFilterStore } from "@/store/useFilterStore";
import { shallow } from "zustand/shallow";

type Offer = {
  id: string;
  discount_type: "percentage" | "fixed" | string;
  discount_value: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  applies_to: "product" | "category" | "all" | string;
  category_id?: string | null;
  product_id?: string | null;
};

const isOfferActive = (offer?: Offer | null) => {
  if (!offer || offer.is_active === false) return false;
  const now = Date.now();
  const start = offer.start_date
    ? new Date(offer.start_date).getTime()
    : -Infinity;
  const end = offer.end_date ? new Date(offer.end_date).getTime() : Infinity;
  return now >= start && now <= end;
};

export default function OffersWithPagination() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { products } = useProducts();
  const { offers } = useOffer();
  const { productsMedia } = useProductsMedia();
  const { productTypes } = useTypes();

  // 1) جهّز لستة العروض السارية + دالة اختيار أفضل عرض
  const activeOffers = useMemo(
    () => (offers || []).filter(isOfferActive) as Offer[],
    [offers]
  );

  const bestOfferFor = (product: any): Offer | null => {
    const cands = activeOffers.filter((o) => {
      if (o.applies_to === "product") return o.product_id === product.id;
      if (o.applies_to === "category")
        return o.category_id === product.category_id;
      if (o.applies_to === "all") return true;
      return false;
    });
    if (!cands.length) return null;
    const rank = (o: Offer) =>
      o.applies_to === "product" ? 3 : o.applies_to === "category" ? 2 : 1;
    return cands.sort(
      (a, b) =>
        rank(b) - rank(a) || (+b.discount_value || 0) - (+a.discount_value || 0)
    )[0]!;
  };

  // 2) جهّز “specials” كقائمة الأساس للـstore (ID/حقول الفلاتر فقط)
  const specials = useMemo(() => {
    if (!products?.length || !activeOffers.length) return [];
    return products
      .filter((p) => p.is_active && (p.quantity ?? 0) > 0)
      .filter((p) => bestOfferFor(p)) // لازم يكون له عرض
      .map((p) => ({
        id: p.id,
        name_ar: p.name_ar,
        name_en: p.name_en,
        price: p.price,
        quantity: p.quantity,
        category_id: p.category_id,
        type: p.type,
        created_at: p.created_at,
      }));
  }, [products, activeOffers]);

  // 3) اربط بالـstore (بدون ما نرجّع object جديد في selector)
  const filteredProducts = useFilterStore((s) => s.filteredProducts);
  const setProducts = useFilterStore((s) => s.setProducts);

  useEffect(() => {
    setProducts(specials);
  }, [specials, setProducts]);

  // 4) Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;
  useEffect(() => setCurrentPage(1), [filteredProducts]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const pageItems = filteredProducts
    .filter((p: any) => (p.quantity ?? 0) > 0)
    .slice(startIndex, startIndex + perPage);

  const goPage = (p: number) => {
    setCurrentPage(p);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 5) Fallback لحساب الصورة/النوع/البادج وقت الرندر (حتى لو الـstore فقدهم)
  const getCardData = (item: any) => {
    // استرجع الـproduct الكامل لو محتاج
    const full = products?.find((p) => p.id === item.id) || item;

    // الصورة (الأولوية is_main)
    const media =
      productsMedia?.find((m) => m.product_id === item.id && m.is_main) ||
      productsMedia?.find((m) => m.product_id === item.id) ||
      null;
    const img = media?.file_url || "";

    // النوع
    const pType = productTypes?.find((t) => t.id === full.type) || null;
    const typeLabel = isRTL ? pType?.name_ar ?? "" : pType?.name_en ?? "";

    // العرض
    const offer = bestOfferFor(full);

    return { img, typeLabel, offer };
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {filteredProducts.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-
          {Math.min(startIndex + pageItems.length, filteredProducts.length)} of{" "}
          {filteredProducts.length} offers
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3">
        {pageItems.map((item: any) => {
          const { img, typeLabel, offer } = getCardData(item);

          return (
            <div key={item.id} className="w-full">
              <ProductsCard
                applies_to={offer?.applies_to || ""}
                products_category_id={item.category_id}
                categories_category_id={offer?.category_id ?? ""}
                discount_type={offer?.discount_type || ""}
                discount_value={offer?.discount_value || 0}
                name_ar={item.name_ar}
                name_en={item.name_en}
                price={item.price}
                quantity={item.quantity}
                type={typeLabel}
                img={img}
                productId={item.id}
              />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => goPage(currentPage - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={currentPage === p ? "default" : "outline"}
              onClick={() => goPage(p)}
              className="w-10 h-10"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => goPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* حالات */}
      {filteredProducts.length === 0 && specials.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            No offers match your filters
          </div>
          <div className="text-gray-400 text-sm">Try adjusting the filters</div>
        </div>
      )}
      {specials.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No active offers right now
          </div>
        </div>
      )}
    </div>
  );
}
