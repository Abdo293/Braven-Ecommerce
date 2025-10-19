"use client";
import Link from "next/link";
import { LanguageSwitcher } from "../../LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { useOffer } from "@/hooks/useOffers";
import { useMemo } from "react";

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

function isOfferLive(o: Offer, now = new Date()) {
  if (!o.is_active) return false;
  const startsOk = !o.start_date || new Date(o.start_date) <= now;
  const endsOk = !o.end_date || new Date(o.end_date) >= now;
  const scopeOk =
    o.applies_to === "all" || (o.applies_to === "category" && !!o.category_id);
  // بنستبعد عروض المنتج الواحد
  return startsOk && endsOk && scopeOk;
}

export const TopBar = () => {
  const { offers } = useOffer();
  const t = useTranslations("header");
  const locale = useLocale();

  // اختَر عرض واحد مناسب (الأقرب للانتهاء كأولوية)
  const currentOffer = useMemo(() => {
    const now = new Date();
    const live = (offers || []).filter((o: Offer) => isOfferLive(o, now));
    if (!live.length) return null;

    // ترتيب: ينتهي قريباً أولاً، ولو تعادل ناخد الأعلى خصماً
    live.sort((a, b) => {
      const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
      const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;
      if (aEnd !== bEnd) return aEnd - bEnd;

      const score = (o: Offer) =>
        o.discount_type === "percentage" ? o.discount_value : o.discount_value;
      return score(b) - score(a);
    });

    return live[0];
  }, [offers]);

  // لو مفيش عرض شغّال، تقدر تخفي البار كله أو تعرض رسالة افتراضية
  if (!currentOffer) {
    return (
      <div className="bg-green-500">
        <div className="container mx-auto py-3 flex justify-between items-center">
          <div className="max-md:w-full">
            <p className="text-white max-md:flex max-md:justify-center max-md:items-center">
              <Link href="/shop" className="underline font-semibold">
                {t("topBar.shopNow")}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3 max-md:hidden">
            <Link href="/contact" className="text-white">
              {t("topBar.helpCenter")}
            </Link>
            <LanguageSwitcher color="text-white" />
          </div>
        </div>
      </div>
    );
  }

  const title =
    locale === "ar"
      ? currentOffer.title_ar || currentOffer.title_en || ""
      : currentOffer.title_en || currentOffer.title_ar || "";

  const targetHref =
    currentOffer.applies_to === "category" && currentOffer.category_id
      ? `/shop?cat=${currentOffer.category_id}`
      : "/shop";

  return (
    <div className="bg-green-500">
      <div className="container mx-auto py-3 flex justify-between items-center">
        <div className="max-md:w-full">
          <p className="text-white max-md:flex max-md:justify-center max-md:items-center gap-1">
            <span className="font-semibold">{title ? `${title}` : ""}</span>
            {" — "}
            <Link href={targetHref} className="underline font-semibold">
              {t("topBar.shopNow")}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3 max-md:hidden">
          <Link href="/contact" className="text-white">
            {t("topBar.helpCenter")}
          </Link>
          <LanguageSwitcher color="text-white" />
        </div>
      </div>
    </div>
  );
};
