"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Products } from "@/types/Products";
import { useShopStore } from "@/store/useShopStore";
import { PagesHeader } from "@/components/PagesHeader";
import { useTranslations, useLocale } from "next-intl";

const PRIMARY = "#16a34a";
const DEFAULT_CURRENCY = "EGP";
// لو عندك سجلات قديمة فيها public_id = path والبكت Public:
const SUPABASE_PROJECT = process.env.NEXT_PUBLIC_SUPABASE_URL; // عدّل لو مختلف
const SUPABASE_BUCKET = "media"; // عدّل لو مختلف

/* ----------------------- helpers ----------------------- */
function pickByLocale<T extends string | undefined>(
  ar: T,
  en: T,
  locale: string
) {
  return locale.startsWith("ar") ? ar ?? en : en ?? ar;
}
function isArabicText(s?: string) {
  return !!s && /[\u0600-\u06FF]/.test(s);
}
function titleOf(p: Products, locale: string) {
  const anyP = p as any;
  return pickByLocale<any>(anyP?.name_ar, anyP?.name_en, locale) || "بدون اسم";
}
function typeLabelOf(p: Products, locale: string) {
  const anyP = p as any;
  const fromSingle =
    anyP?.productType &&
    (isArabicText(anyP.productType)
      ? { ar: anyP.productType, en: undefined }
      : { ar: undefined, en: anyP.productType });
  const ar = anyP?.productType_ar ?? fromSingle?.ar;
  const en = anyP?.productType_en ?? fromSingle?.en;
  return pickByLocale<any>(ar, en, locale) || "";
}
function imageOf(p: Products) {
  const anyP = p as any;
  if (anyP?.file_url) return String(anyP.file_url);
  if (anyP?.img) return String(anyP.img);
  if (anyP?.public_id && typeof anyP.public_id === "string") {
    const path = anyP.public_id.replace(/^\/+/, "");
    return `https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
  }
  return "/placeholder.svg";
}
function formatCurrency(
  n?: number,
  currency = DEFAULT_CURRENCY,
  locale?: string
) {
  if (typeof n !== "number") return "";
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/* ======= نفس منطق ProductsCard تحديدًا ======= */
function computeDiscountForWishlist(p: Products) {
  const anyP = p as any;

  // السعر الأساسي هو اللي اتخزن ساعة الإضافة للكارت/المفضلة
  const basePrice = Number(anyP?.price) || 0;

  // بيانات العرض اللي خزّناها من الكارت
  const a = anyP?.applied_offer as {
    applies_to?: "product" | "category" | "all" | string;
    discount_type?: "percentage" | "fixed" | string;
    discount_value?: number | string;
    categories_category_id?: string | null;
    products_category_id?: string | null;
  } | null;

  // مطابق تمامًا لمنطق ProductsCard:
  const hasDiscount =
    !!a?.discount_type &&
    !!(Number(a?.discount_value) || 0) &&
    (a?.applies_to === "product" ||
      a?.applies_to === "all" ||
      (a?.applies_to === "category" &&
        a?.products_category_id === a?.categories_category_id));

  if (!hasDiscount) {
    return { hasDiscount: false, basePrice, finalPrice: basePrice, percent: 0 };
  }

  const val = Number(a!.discount_value) || 0;
  if (a!.discount_type === "percentage") {
    const finalPrice = Math.max(0, basePrice * (1 - val / 100));
    return {
      hasDiscount: true,
      basePrice,
      finalPrice,
      percent: Math.round(val),
    };
  } else {
    const finalPrice = Math.max(0, basePrice - val);
    const percent = basePrice > 0 ? Math.round((val / basePrice) * 100) : 0;
    return { hasDiscount: true, basePrice, finalPrice, percent };
  }
}

/* ----------------------- page ----------------------- */
export default function WishlistPage() {
  const locale = useLocale();
  const t = useTranslations("wishlist");

  const wishlist = useShopStore((s) => s.wishlist);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const addToCart = useShopStore((s) => s.addToCart);
  const openCart = useShopStore((s) => s.openCart);

  if (!wishlist.length) {
    return (
      <section className="">
        <div className="bg-[#f0f0f0]">
          <div className="container mx-auto max-md:px-3">
            <PagesHeader routes="wishlist" title={t("title")} />
          </div>
        </div>
        <div className="container mx-auto my-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{t("empty")}</p>
          <div className="mt-6">
            <Link href="/shop">
              <Button>{t("continue")}</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="bg-[#f0f0f0]">
        <div className="container mx-auto max-md:px-3">
          <PagesHeader routes="wishlist" title={t("title")} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 container mx-auto my-8">
        {wishlist.map((p) => {
          const img = imageOf(p);
          const title = titleOf(p, locale);
          const typeLabel = typeLabelOf(p, locale);

          // ← نفس المعادلات المستخدمه في الكارت
          const { hasDiscount, basePrice, finalPrice, percent } =
            computeDiscountForWishlist(p);

          return (
            <Card
              key={p.id}
              className="relative overflow-hidden rounded-2xl border-green-200/60 shadow-sm hover:shadow-md transition-all"
            >
              {/* remove from wishlist */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8 rounded-full border border-green-200 hover:bg-green-50"
                onClick={() => toggleWishlist(p)}
                aria-label="Remove from wishlist"
              >
                <X className="h-4 w-4 text-green-600" />
              </Button>

              <CardContent className="p-4">
                {/* image + discount badge */}
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl">
                  {hasDiscount && (
                    <span className="absolute left-2 top-2 z-10 rounded-md bg-green-600 px-2 py-1 text-xs font-bold text-white">
                      -{percent}%
                    </span>
                  )}
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                  />
                </div>

                {/* type label */}
                {typeLabel ? (
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {typeLabel}
                  </div>
                ) : (
                  <div className="h-[13px]" />
                )}

                {/* title */}
                <h3 className="mt-1 line-clamp-2 text-2xl font-semibold">
                  {title}
                </h3>

                {/* price (زي الكارت) */}
                <div className="mt-2 text-lg">
                  {(p as any).original_price && (
                    <span className="mr-2 text-sm text-muted-foreground line-through">
                      {formatCurrency(
                        (p as any).original_price,
                        DEFAULT_CURRENCY,
                        locale
                      )}
                    </span>
                  )}
                  <span className="font-semibold" style={{ color: PRIMARY }}>
                    {formatCurrency(Number(p.price), DEFAULT_CURRENCY, locale)}
                  </span>
                </div>

                {/* add to cart (بنضيف بالسعر النهائي برضه) */}
                <Button
                  variant="ghost"
                  className="mt-4 w-full rounded-full border border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  onClick={() => {
                    addToCart({
                      ...(p as any),
                      price: Number((p as any).price),
                    });
                    openCart();
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t("addToCart")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
