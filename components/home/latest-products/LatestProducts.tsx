"use client";

import { useLocale } from "next-intl";
import { useState, useMemo, useEffect, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useOffer } from "@/hooks/useOffers";
import { useProductsMedia } from "@/hooks/useProductsMedia";
import { useCategories } from "@/hooks/useCategories";
import { useTypes } from "@/hooks/useTypes";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductsCard } from "@/components/products-card/ProductsCard";

const PRIMARY = "#16a34a";

export const LatestProducts = () => {
  const { products } = useProducts();
  const { offers } = useOffer();
  const { productsMedia } = useProductsMedia();
  const { categories } = useCategories();
  const { productTypes } = useTypes();
  const locale = useLocale();
  const isAr = locale === "ar";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const swiperRef = useRef<any>(null);

  // فلترة
  const filteredProducts = useMemo(() => {
    return selectedCategory === "all"
      ? products
      : products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  // أول كاتيجوري فيه منتجات
  useEffect(() => {
    if (selectedCategory !== "all") return;
    const first = categories.find((c) =>
      products.some((p) => p.category_id === c.id)
    );
    if (first) setSelectedCategory(first.id);
  }, [categories, products, selectedCategory]);

  // Helpers لتمرير الداتا للكارد
  const findOffer = (product: any) =>
    offers.find((o) =>
      o.applies_to === "product"
        ? o.product_id === product.id
        : o.category_id === product.category_id
    );

  const findMainImg = (pid: string) =>
    productsMedia.find((m) => m.product_id === pid && m.is_main)?.file_url ||
    "";

  const getTypeLabel = (product: any) => {
    const rec = productTypes.find((pt) => pt.id === product.type);
    return isAr ? rec?.name_ar : rec?.name_en;
  };

  return (
    <div className="container mx-auto px-4 py-14">
      {/* عنوان */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
        {locale === "ar" ? "أحدث المنتجات" : "Latest Products"}
      </h2>

      {/* Tabs Pills في الوسط */}
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        {categories
          .filter((c) => products.some((p) => p.category_id === c.id))
          .map((c) => {
            const active = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
                  active ? "text-white" : "bg-white text-gray-700"
                }`}
                style={{
                  backgroundColor: active ? PRIMARY : undefined,
                  borderColor: active ? "transparent" : "#e5e7eb",
                }}
              >
                {isAr ? c.name_ar : c.name_en}
              </button>
            );
          })}
      </div>

      {/* سلايدر: الأسهم تظهر في hover */}
      <div className="relative group w-full">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="hidden md:flex absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-200 shadow items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          aria-label="Prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="hidden md:flex absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-200 shadow items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={5}
          onSwiper={(sw) => (swiperRef.current = sw)}
          breakpoints={{
            320: { slidesPerView: 1.1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 }, // كان 3 تمام
            1280: { slidesPerView: 3, spaceBetween: 28 }, // بدّل من 4 إلى 3
            1536: { slidesPerView: 4, spaceBetween: 32 }, // بدّل من 5 إلى 4
          }}
        >
          {filteredProducts.slice(0, 10).map((product) => {
            if (product.quantity === 0) return null;

            const offer = findOffer(product);
            const img = findMainImg(product.id);
            const typeLabel = getTypeLabel(product);

            return (
              <SwiperSlide key={product.id}>
                <ProductsCard
                  applies_to={offer?.applies_to || ""}
                  products_category_id={product.category_id}
                  categories_category_id={offer?.category_id ?? ""}
                  discount_type={offer?.discount_type || ""}
                  discount_value={offer?.discount_value || 0}
                  name_ar={product.name_ar}
                  name_en={product.name_en}
                  price={product.price}
                  quantity={product.quantity}
                  type={typeLabel ?? ""}
                  img={img}
                  productId={product.id}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};
