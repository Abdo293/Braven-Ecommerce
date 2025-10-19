"use client";

import { useOffer } from "@/hooks/useOffers";
import { useProducts } from "@/hooks/useProducts";
import { useProductsMedia } from "@/hooks/useProductsMedia";
import { useLocale, useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useShopStore } from "@/store/useShopStore";
import { toast } from "sonner";
import { priceForCart } from "@/utils/offers";

const PRIMARY = "#16a34a";

export const DealOfTheWeek = () => {
  const { products } = useProducts();
  const { offers } = useOffer();
  const { productsMedia } = useProductsMedia();
  const t = useTranslations("dealOfTheWeek");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const addToCart = useShopStore((s) => s.addToCart);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const handleAddToCart = (product: any, productMedia?: any) => {
    const { unitPrice, originalPrice, offer } = priceForCart(
      {
        id: product.id,
        category_id: product.category_id,
        price: product.price,
      },
      offers || []
    );

    addToCart(
      {
        id: product.id,
        name_ar: product.name_ar,
        name_en: product.name_en,
        // الأهم ↓↓↓
        price: unitPrice,
        original_price: originalPrice,
        applied_offer_id: offer?.id ?? null,
        discount_type: offer?.discount_type ?? null,
        discount_value: offer?.discount_value ?? null,

        img: productMedia?.file_url || "",
        quantity: product.quantity,
      } as any,
      1
    );

    toast.success(isRTL ? "تمت الإضافة" : "Added to cart", {
      description: isRTL
        ? product.name_ar ?? "تم إضافة المنتج إلى السلة"
        : product.name_en ?? "Product was added to your cart",
    });

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const isOfferActive = (offer: any) => {
    if (!offer || !offer.is_active) return false;
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    return now >= startDate && now <= endDate;
  };

  const getDealsData = () => {
    if (!products || !offers || !productsMedia) return [];

    // Filter out product-specific offers - only keep category and "all" offers
    const eligibleOffers = offers.filter(
      (offer) => offer.applies_to !== "product" && isOfferActive(offer)
    );

    // Get all product IDs that have product-specific offers (to exclude them completely)
    const productsWithSpecificOffers = new Set(
      offers
        .filter((offer) => offer.applies_to === "product")
        .map((offer) => offer.product_id)
        .filter(Boolean)
    );

    const productsWithOffers = products
      .filter(
        (product) =>
          product.is_active &&
          product.quantity > 0 &&
          !productsWithSpecificOffers.has(product.id) // Exclude products with specific offers
      )
      .map((product) => {
        const relevantOffers = eligibleOffers.filter((offer) => {
          // Only check for category and "all" offers
          if (offer.applies_to === "all") return true;
          if (
            offer.applies_to === "category" &&
            offer.category_id === product.category_id
          )
            return true;
          return false;
        });

        const bestOffer =
          relevantOffers.length > 0
            ? relevantOffers.sort((a, b) => {
                // Prioritize "all" offers over category offers
                if (a.applies_to === "all" && b.applies_to === "category")
                  return -1;
                if (a.applies_to === "category" && b.applies_to === "all")
                  return 1;
                return (b.discount_value || 0) - (a.discount_value || 0);
              })[0]
            : null;

        const productMedia = productsMedia.find(
          (m) => m.product_id === product.id
        );

        return { product, relevantOffer: bestOffer, productMedia };
      })
      .filter((d) => d.relevantOffer) // Only products with eligible offers
      .slice(0, 10);

    return productsWithOffers;
  };

  const dealsData = getDealsData();
  if (!dealsData.length) return null;

  return (
    <div
      className="container mx-auto max-md:px-4 py-16 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header: يمين/شمال حسب اللغة */}
      <div className={`text-center mb-10`}>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">{t("title")}</h2>
        <p className="text-gray-500">{t("dontMess")}</p>
      </div>

      {/* ===== Slider ===== */}
      <div className="relative group overflow-hidden">
        {/* Prev */}
        <button
          className={`swiper-button-prev-custom absolute ${
            isRTL ? "right-2 md:right-[-24px]" : "left-2 md:left-[-24px]"
          } top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto`}
          aria-label="Previous"
        >
          {isRTL ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* Next */}
        <button
          className={`swiper-button-next-custom absolute ${
            isRTL ? "left-2 md:left-[-24px]" : "right-2 md:right-[-24px]"
          } top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto`}
          aria-label="Next"
        >
          {isRTL ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        <Swiper
          key={isRTL ? "rtl" : "ltr"}
          modules={[Navigation]}
          className="deals-swiper"
          slidesPerView={1} // Default: 1 slide on mobile
          spaceBetween={16}
          navigation={{
            nextEl: isRTL
              ? ".swiper-button-prev-custom"
              : ".swiper-button-next-custom",
            prevEl: isRTL
              ? ".swiper-button-next-custom"
              : ".swiper-button-prev-custom",
          }}
          breakpoints={{
            // Mobile: 1 slide
            640: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            // Medium screens (md): 2 slides
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            // Large screens (lg): 3 slides
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          dir={isRTL ? "rtl" : "ltr"}
          loop={dealsData.length > 3} // Enable loop only if we have more items than max visible
        >
          {dealsData.map(({ product, productMedia, relevantOffer }) => {
            const base = Number(product.price) || 0;
            const isPercent = relevantOffer?.discount_type === "percentage";
            const value = Number(relevantOffer?.discount_value) || 0;
            const discountedPrice = isPercent
              ? Math.max(0, base * (1 - value / 100))
              : Math.max(0, base - value);
            const discountPercentage = isPercent
              ? Math.round(value)
              : base > 0
              ? Math.round((value / base) * 100)
              : 0;

            return (
              <SwiperSlide key={product.id}>
                <div
                  className="rounded-2xl border-2 bg-white overflow-hidden transition-all duration-300 h-full"
                  style={{ borderColor: PRIMARY }}
                >
                  {/* عمودي على الموبايل، أفقي من md */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 items-start md:items-center h-full">
                    {/* Image */}
                    <div className="relative w-full md:w-40 h-44 md:h-40 shrink-0 rounded-lg overflow-hidden mx-auto md:mx-0">
                      <Link href={`/${product.id}`}>
                        {productMedia?.file_url ? (
                          <Image
                            src={productMedia.file_url}
                            alt={product.name_en}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Tag className="w-6 h-6" />
                          </div>
                        )}
                      </Link>

                      {discountPercentage > 0 && (
                        <span
                          className="absolute top-2 left-2 text-xs font-bold text-white px-2 py-1 rounded-md"
                          style={{ backgroundColor: PRIMARY }}
                          dir="ltr"
                        >
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 min-w-0 ${
                        isRTL ? "text-right" : "text-left"
                      } flex flex-col h-full`}
                    >
                      <Link href={`/${product.id}`} className="block">
                        <h3 className="text-[15px] font-semibold text-gray-900 leading-6 line-clamp-2">
                          {isRTL ? product.name_ar : product.name_en}
                        </h3>
                      </Link>

                      {/* Prices */}
                      <div
                        className={`mt-2 flex items-center gap-3 ${
                          isRTL
                            ? "flex-row-reverse justify-end text-end"
                            : "justify-start text-start"
                        }`}
                      >
                        {discountPercentage > 0 ? (
                          <>
                            <span
                              className="text-gray-400 line-through text-sm"
                              dir="ltr"
                            >
                              {base} L.E
                            </span>
                            <span
                              className="font-extrabold text-lg"
                              style={{ color: PRIMARY }}
                              dir="ltr"
                            >
                              {discountedPrice.toFixed(2)} L.E
                            </span>
                          </>
                        ) : (
                          <span
                            className="font-extrabold text-lg"
                            style={{ color: PRIMARY }}
                            dir="ltr"
                          >
                            {base} L.E
                          </span>
                        )}
                      </div>

                      {/* Timer */}
                      {relevantOffer && (
                        <div
                          className={`mt-3 inline-block ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          <CountdownTimer endDate={relevantOffer.end_date} />
                        </div>
                      )}

                      {/* Add to Cart (يلزق لتحت) */}
                      <div
                        className={`mt-auto pt-4 flex w-full ${
                          isRTL ? "justify-start md:justify-end" : "justify-end"
                        }`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <Button
                          onClick={() => handleAddToCart(product, productMedia)}
                          className="w-full md:w-44 h-11 rounded-full font-semibold text-white flex items-center justify-center gap-2"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {justAddedId === product.id
                            ? isRTL
                              ? "تمت الإضافة"
                              : "Added!"
                            : t("addToCart")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};
