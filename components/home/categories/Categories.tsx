"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "@/components/styles.css";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export const Categories = () => {
  const { categories } = useCategories();
  const { products } = useProducts();
  const t = useTranslations("HomeCategories");
  const locale = useLocale();
  console.log(products);

  // Count products by category
  const productsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products?.forEach((product) => {
      const categoryId = product.category_id;
      counts[categoryId] = (counts[categoryId] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="categories py-8">
      <Swiper
        slidesPerView={3}
        spaceBetween={20}
        className="mySwiper container mx-auto"
        breakpoints={{
          0: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1020: {
            slidesPerView: 3,
          },
        }}
      >
        {categories.map((e, index) => (
          <SwiperSlide key={index}>
            <div className="md:container md:mx-auto">
              <Link
                href={`/shop/${e.id}`}
                className="flex items-center justify-center"
              >
                <div className="bg-[#e4f2ff] w-[180px] h-[180px] max-md:w-[100px] max-md:h-[100px] gap-3 rounded-full flex items-center justify-center">
                  <Image
                    src={e?.image_url}
                    width={100}
                    height={100}
                    alt="categories"
                    className="max-md:!w-[40px] scale"
                  />
                </div>
              </Link>
              <div className="pt-3">
                <Link
                  href={"/"}
                  className="text-[20px] font-bold duration-300 transition-colors hover:text-[#0c55aa]"
                >
                  {locale === "ar" ? e.name_ar : e.name_en}
                </Link>
                <p className="text-[14px] text-[#55585b] text-center">
                  {productsByCategory[e.id] || 0} {t("products")}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
