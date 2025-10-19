"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useShopStore } from "@/store/useShopStore";
import { ProductsCardProps } from "@/types/ProductsCard";
import { Products } from "@/types/Products";
import { toast } from "sonner";

const PRIMARY = "#16a34a";

export const ProductsCard = ({
  type,
  name_ar,
  name_en,
  price,
  quantity,
  products_category_id,
  categories_category_id,
  applies_to,
  discount_value,
  discount_type,
  img,
  productId,
}: ProductsCardProps) => {
  const t = useTranslations("productsCard");
  const locale = useLocale();
  const isOutOfStock = quantity === 0;

  // متجر
  const addToCart = useShopStore((s) => s.addToCart);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const wishlist = useShopStore((s) => s.wishlist);

  // هل المنتج في المفضلة؟
  const isInWishlist = wishlist.some((p) => p.id === productId);

  // ===== منطق الخصم =====
  const basePrice = Number(price) || 0;

  // العرض موجود لو:
  // - applies_to === "product" (ده كارت المنتج نفسه)
  // - applies_to === "category" && category match
  // - applies_to === "all"
  const hasDiscount =
    !!discount_type &&
    !!(Number(discount_value) || 0) &&
    (applies_to === "product" ||
      applies_to === "all" ||
      (applies_to === "category" &&
        products_category_id === categories_category_id));

  const finalPrice = hasDiscount
    ? discount_type === "percentage"
      ? Math.max(0, basePrice * (1 - (Number(discount_value) || 0) / 100))
      : Math.max(0, basePrice - (Number(discount_value) || 0))
    : basePrice;

  // إعداد كائن المنتج للاستخدام في السلة/المفضلة
  // مهم: price = finalPrice علشان السلة تستقبل السعر بعد الخصم
  const productData: Products = {
    id: productId,
    name_ar,
    name_en,
    price: Number(finalPrice.toFixed(2)), // ← السعر النهائي اللي يدخل السلة
    img,
    quantity,
    productType: type, // عشان يظهر النوع في الشيت
    // حقول إضافية (اختياري) هتفيدك في الميني كارت/الشيك آوت
    original_price: basePrice,
    applied_offer: hasDiscount
      ? {
          applies_to,
          discount_type,
          discount_value,
          categories_category_id,
          products_category_id,
        }
      : null,
  } as unknown as Products;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(productData, 1);
    toast.success(locale === "ar" ? "تمت الإضافة" : "Added to cart", {
      description:
        locale === "ar"
          ? name_ar ?? "تم إضافة المنتج إلى السلة"
          : name_en ?? "Product was added to your cart",
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // مايفتحش اللينك
    e.stopPropagation();
    toggleWishlist(productData);
  };

  return (
    <div className="group relative w-full bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden h-[480px] flex flex-col">
      {/* أيقونة القلب (تظهر في الهوفر) */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 shadow hover:scale-110"
        aria-label={
          isInWishlist
            ? t("removeFromWishlist") ?? "Remove from wishlist"
            : t("addToWishlist") ?? "Add to wishlist"
        }
      >
        <Heart
          size={20}
          className={isInWishlist ? "text-red-500" : "text-gray-400"}
          fill={isInWishlist ? "currentColor" : "transparent"}
          stroke="currentColor"
        />
      </button>

      {/* صورة + بادج خصم */}
      <div className="relative h-[250px] flex items-center justify-center">
        {hasDiscount && !isOutOfStock && (
          <span
            className="absolute top-3 left-3 text-xs z-50 font-bold text-white px-2 py-1 rounded-md"
            style={{ backgroundColor: PRIMARY }}
          >
            -
            {discount_type === "percentage"
              ? `${discount_value}%`
              : `${discount_value}`}
          </span>
        )}

        <Link href={`/${productId}`} className="block w-full h-full">
          {img ? (
            <Image
              src={img}
              alt={
                locale === "ar" ? name_ar || "product" : name_en || "product"
              }
              fill
              className="object-contain p-4"
              sizes="(max-width:768px) 100vw, 250px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </Link>
      </div>

      {/* التفاصيل */}
      <div className="flex-1 flex flex-col justify-between p-5">
        <Link href={`/${productId}`} className="space-y-2">
          {/* النوع كـ Label */}
          <p
            className={`text-[11px] tracking-widest text-gray-500 font-semibold uppercase ${
              locale === "ar" ? "text-right" : "text-left"
            }`}
          >
            {type || t("unspecified")}
          </p>

          {/* الاسم */}
          <h3
            className={`text-2xl font-semibold text-gray-900 leading-6 line-clamp-2 min-h-[3.2rem] ${
              locale === "ar" ? "text-right" : "text-left"
            }`}
          >
            {locale === "ar" ? name_ar : name_en}
          </h3>

          {/* الأسعار */}
          <div className="flex items-center gap-3">
            <div dir="ltr">
              {hasDiscount && (
                <span className="line-through text-gray-400 text-sm">
                  {basePrice.toFixed(2)} L.E
                </span>
              )}
              <span className="font-bold text-lg" style={{ color: PRIMARY }}>
                {finalPrice.toFixed(2)} L.E
              </span>
            </div>
          </div>
        </Link>

        {/* زر الإضافة للسلة */}
        <Button
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="mt-4 w-full h-11 rounded-full text-white font-semibold transition-all"
          style={{ backgroundColor: isOutOfStock ? "#9CA3AF" : PRIMARY }}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {isOutOfStock ? t("outOfStock") ?? "Out of Stock" : t("addToCart")}
        </Button>
      </div>
    </div>
  );
};
