"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useOffer } from "@/hooks/useOffers";
import { Button } from "../../ui/button";
import { useLocale, useTranslations } from "next-intl";

type Offer = {
  id: string;
  title_ar: string | null;
  title_en: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  applies_to: "all" | "category" | "product";
  category_id?: string | null;
  product_id?: string | null;
};

function isOfferLive(o: Offer, now: Date, categoryId?: string) {
  if (!o.is_active) return false;
  const startsOk = !o.start_date || new Date(o.start_date) <= now;
  const endsOk = !o.end_date || new Date(o.end_date) >= now;
  if (!(startsOk && endsOk)) return false;

  // استبعد عروض المنتج الواحد
  if (o.applies_to === "product") return false;

  // لو بتمرر categoryId (مثلاً صفحة قسم) نقي عروض هذا القسم فقط
  if (categoryId) {
    if (o.applies_to === "category") return o.category_id === categoryId;
    return o.applies_to === "all";
  }

  // على الهوم: اعرض all + أي عروض category (هنرتّبها لاحقًا)
  return (
    o.applies_to === "all" || (o.applies_to === "category" && !!o.category_id)
  );
}

export const HeroSction = ({ categoryId }: { categoryId?: string }) => {
  const { offers } = useOffer();
  const t = useTranslations("heroSection");
  const locale = useLocale();

  const currentOffer = useMemo(() => {
    const now = new Date();
    const live = (offers || []).filter((o: Offer) =>
      isOfferLive(o, now, categoryId)
    );
    if (!live.length) return null;

    // الأولوية: عرض لنفس القسم (لو categoryId موجود) > ينتهي قريبًا > أعلى خصم
    live.sort((a, b) => {
      const aCat =
        a.applies_to === "category" &&
        categoryId &&
        a.category_id === categoryId
          ? 1
          : 0;
      const bCat =
        b.applies_to === "category" &&
        categoryId &&
        b.category_id === categoryId
          ? 1
          : 0;
      if (aCat !== bCat) return bCat - aCat;

      const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
      const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;
      if (aEnd !== bEnd) return aEnd - bEnd;

      return b.discount_value - a.discount_value;
    });

    return live[0];
  }, [offers, categoryId]);

  const title =
    currentOffer &&
    (locale === "ar"
      ? currentOffer.title_ar || currentOffer.title_en
      : currentOffer.title_en || currentOffer.title_ar);

  const discountText =
    currentOffer &&
    (currentOffer.discount_type === "percentage"
      ? `${currentOffer.discount_value}%`
      : `${currentOffer.discount_value} ${t("currency")}`);

  const targetHref =
    currentOffer?.applies_to === "category" && currentOffer.category_id
      ? `/shop?cat=${currentOffer.category_id}`
      : "/shop";

  return (
    <div className="max-md:px-3 hero relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-[-1]"></div>
      <div className="container mx-auto rounded-3xl h-full text-center py-10 px-14 max-md:px-6 max-md:py-8 z-10">
        <div className="h-full flex flex-col justify-center items-center rounded-3xl py-10 px-6">
          <p className="font-bold text-2xl text-white">{t("weekSale")}</p>

          <p className="font-bold text-4xl py-5 text-white">{title}</p>

          <Link href={targetHref}>
            <Button
              variant="outline"
              className="bg-green-500 hover:!bg-green-600 hover:!text-white cursor-pointer text-white py-5 px-8 rounded-full font-bold"
            >
              {t("shopNow")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
