"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useOffer } from "@/hooks/useOffers";
// لو عندك util جاهز للمتصفح:
import { createClient } from "@/utils/supabase/client"; // ← عدّل الاسم لو مختلف

type Offer = {
  id: string;
  is_active: boolean;
  applies_to: "all" | "category" | "product";
  product_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  title_ar?: string | null;
  title_en?: string | null;
};

type ProductLite = {
  id: string;
  name_ar: string | null;
  name_en: string | null;
};

function isLive(o: Offer, now = new Date()) {
  if (!o.is_active) return false;
  const startsOk = !o.start_date || new Date(o.start_date) <= now;
  const endsOk = !o.end_date || new Date(o.end_date) >= now;
  return startsOk && endsOk && o.applies_to === "product" && !!o.product_id;
}

export const ProductOffer = () => {
  const { offers } = useOffer();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("productOffer");
  const supabase = createClient();

  // اختَر أول عرض منتج شغّال (الأقرب لانتهاء الصلاحية)
  const current = useMemo(() => {
    const live = (offers || []).filter((o) => isLive(o));
    if (!live.length) return null;
    live.sort((a, b) => {
      const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
      const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;
      return aEnd - bEnd;
    });
    return live[0];
  }, [offers]);

  const [product, setProduct] = useState<ProductLite | null>(null);
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // هات بيانات المنتج وصورة واحدة
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!current?.product_id) {
        setProduct(null);
        setImg(null);
        return;
      }
      setLoading(true);
      try {
        // المنتج
        const { data: p } = await supabase
          .from("products")
          .select("id,name_ar,name_en")
          .eq("id", current.product_id)
          .single();

        // أول صورة (لو عندك عمود created_at يبقى حلو؛ لو مش موجود، هنشيل order)
        const { data: media } = await supabase
          .from("product_media")
          .select("file_url")
          .eq("product_id", current.product_id)
          .limit(1);

        if (!mounted) return;
        setProduct(p || null);
        setImg(media?.[0]?.file_url || null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [current, supabase]);

  if (!current || !product) return null;

  const title = isArabic
    ? product.name_ar || product.name_en || ""
    : product.name_en || product.name_ar || "";

  const discountText =
    current.discount_type === "percentage"
      ? `${current.discount_value}%`
      : `${current.discount_value}`;

  return (
    <div className="bg-[#F0F0F0]">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-6 p-6">
        {/* الصورة */}
        <div className="relative w-full">
          <div className="relative aspect-[16/10] w-full rounded-2xl">
            <Image
              src={img || "/placeholder.svg"}
              alt={title || "product"}
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* النص والزرار */}
        <div className="flex flex-col items-start gap-4">
          <p className="text-base font-medium tracking-widest text-muted-foreground">
            {t("limitedTime")}
          </p>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            {t("discountText", { discount: discountText, productName: title })}
          </h2>

          <Link href={`/${product.id}`}>
            <Button className="mt-2 rounded-full bg-green-500 hover:bg-green-700 px-6 py-5">
              {t("shopNow")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
