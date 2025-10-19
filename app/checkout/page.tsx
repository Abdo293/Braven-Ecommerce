"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useShopStore } from "@/store/useShopStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Products } from "@/types/Products";

import { DEFAULT_CURRENCY, GOVERNORATES, GovKey } from "@/lib/shipping";
import { createClient } from "@/utils/supabase/client";

function pickName(p: Products, locale: string) {
  const anyP = p as any;
  return locale.startsWith("ar")
    ? anyP?.name_ar || anyP?.name_en || "بدون اسم"
    : anyP?.name_en || anyP?.name_ar || "Untitled";
}

function formatCurrency(
  n: number,
  locale: string,
  currency = DEFAULT_CURRENCY
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    n
  );
}

const schema = z.object({
  fullName: z.string().min(2, "required"),
  phone: z.string().min(6, "required"),
  email: z.string().email().optional().or(z.literal("")),
  governorate: z.custom<GovKey>(
    (v) => typeof v === "string" && v in GOVERNORATES,
    { message: "required" }
  ),
  address1: z.string().min(5, "required"),
  address2: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Coupon = {
  id: string;
  code: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number | null;
  min_order_value: number | null;
};

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();

  const supabase = createClient();

  const cart = useShopStore((s) => s.cart);
  const clearCart = useShopStore((s) => s.clearCart);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      governorate: undefined,
      address1: "",
      address2: "",
      notes: "",
    },
  });

  const selectedGov: GovKey | undefined = form.watch("governorate") as any;
  const shippingFee = selectedGov ? GOVERNORATES[selectedGov].fee : 0;

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (s, p) => s + (Number((p as any).price) || 0) * (p.cartQty || 1),
        0
      ),
    [cart]
  );

  // ======================= Coupon state =======================
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<string>("");
  const [applying, setApplying] = useState(false);

  const calcDiscount = (sum: number, cpn: Coupon | null) => {
    if (!cpn) return { final: sum, discount: 0 };
    if (cpn.min_order_value && sum < cpn.min_order_value) {
      return { final: sum, discount: 0 };
    }
    if (cpn.discount_type === "percentage") {
      const discount = (sum * (cpn.discount_value || 0)) / 100;
      const final = Math.max(0, sum - discount);
      return { final, discount };
    } else {
      const discount = cpn.discount_value || 0;
      const final = Math.max(0, sum - discount);
      return { final, discount: Math.min(discount, sum) };
    }
  };

  const { final: couponSubtotal, discount: couponDiscount } = useMemo(
    () => calcDiscount(subtotal, appliedCoupon),
    [subtotal, appliedCoupon]
  );

  const total = couponSubtotal + shippingFee;

  const applyCoupon = async () => {
    setCouponMsg("");
    setApplying(true);
    try {
      const code = couponCode.trim();
      if (!code) {
        setCouponMsg("برجاء إدخال كود الكوبون.");
        return;
      }

      // 1) هات الكوبون
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !coupon) {
        setCouponMsg("الكوبون غير موجود.");
        return;
      }
      const c = coupon as Coupon;

      // 2) حالة ومواعيد
      if (!c.is_active) {
        setCouponMsg("الكوبون غير مفعل.");
        return;
      }
      const now = new Date();
      if (c.start_date && now < new Date(c.start_date)) {
        setCouponMsg("الكوبون لم يبدأ بعد.");
        return;
      }
      if (c.end_date && now > new Date(c.end_date)) {
        setCouponMsg("الكوبون منتهي.");
        return;
      }

      // 3) حد الاستخدام
      if (c.usage_limit !== null && c.usage_limit !== undefined) {
        const { count, error: usageError } = await supabase
          .from("coupon_usages")
          .select("*", { count: "exact", head: true })
          .eq("coupon_id", c.id);

        if (usageError) {
          setCouponMsg("حدث خطأ أثناء التحقق من عدد مرات الاستخدام.");
          return;
        }
        if ((count ?? 0) >= c.usage_limit) {
          setCouponMsg("تم الوصول إلى الحد الأقصى لاستخدام هذا الكوبون.");
          return;
        }
      }

      // 4) حد أدنى للطلب
      if (c.min_order_value && subtotal < c.min_order_value) {
        setCouponMsg(
          `الحد الأدنى لتفعيل الكوبون هو ${c.min_order_value} ${DEFAULT_CURRENCY}`
        );
        return;
      }

      // 5) سجّل الاستخدام (نفس مثالِك)
      await supabase.from("coupon_usages").insert({ coupon_id: c.id });

      setAppliedCoupon(c);
      const { final } = calcDiscount(subtotal, c);
      setCouponMsg(
        `تم تطبيق الكوبون بنجاح. السعر بعد الخصم: ${final.toFixed(
          2
        )} ${DEFAULT_CURRENCY}`
      );
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMsg("");
    // مابنمليش usage هنا علشان جدول الاستخدام بيتم بناءً على المثال بتاعك
  };
  // ======================= /Coupon state =======================

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: FormValues) {
    if (!cart.length) return;

    setLoading(true);
    try {
      // ابعت بيانات الكوبون للباك إند لإعادة التحقق وحساب الفاتورة النهائية
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: values.fullName,
            phone: values.phone,
            email: values.email || undefined,
          },
          address: {
            governorate: values.governorate,
            address1: values.address1,
            address2: values.address2 || undefined,
          },
          notes: values.notes || undefined,
          currency: DEFAULT_CURRENCY,
          locale,
          items: cart.map((p) => ({
            id: p.id,
            name_ar: (p as any).name_ar,
            name_en: (p as any).name_en,
            price: Number((p as any).price) || 0,
            qty: p.cartQty || 1,
            img: (p as any).img,
          })),
          coupon: appliedCoupon
            ? {
                code: appliedCoupon.code,
                discount_type: appliedCoupon.discount_type,
                discount_value: appliedCoupon.discount_value,
                discount_amount: couponDiscount,
              }
            : null,
          shipping_fee: shippingFee,
          subtotal, // قبل الخصم
          subtotal_after_coupon: couponSubtotal, // بعد الخصم
          total, // بعد الخصم + الشحن
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");

      clearCart();
      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="container mx-auto max-w-5xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>{t("emptyTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("emptyDesc")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid max-w-6xl gap-6 py-8 lg:grid-cols-3">
      {/* Left: form */}
      <div className="lg:col-span-2">
        <Card className="border-green-200/60">
          <CardHeader>
            <CardTitle className="text-xl">{t("shippingInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fullName")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("phone")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("email")}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({t("optional")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="governorate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("governorate")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value as any}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("selectGovernorate")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-72">
                            {Object.entries(GOVERNORATES).map(([key, v]) => (
                              <SelectItem key={key} value={key}>
                                {locale.startsWith("ar") ? v.ar : v.en} —{" "}
                                {formatCurrency(v.fee, locale)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("address1")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("address2")}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({t("optional")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("notes")}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({t("optional")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? t("placing") : t("placeOrder")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Right: summary */}
      <div>
        <Card className="border-green-200/60">
          <CardHeader>
            <CardTitle className="text-xl">{t("orderSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.map((p) => {
                const name = pickName(p as Products, locale);
                const img = (p as any).img || "/placeholder.svg";
                const qty = p.cartQty || 1;
                const price = Number((p as any).price) || 0;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-md ring-1 ring-green-100">
                      <Image
                        src={img}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="line-clamp-2 text-sm font-medium">
                        {name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {qty} × {formatCurrency(price, locale)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(price * qty, locale)}
                    </div>
                  </div>
                );
              })}

              {/* Coupon input */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ادخل كود الكوبون"
                    disabled={!!appliedCoupon || applying}
                  />
                  {!appliedCoupon ? (
                    <Button onClick={applyCoupon} disabled={applying}>
                      {applying ? "جارٍ التطبيق..." : "تطبيق"}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={removeCoupon}>
                      إزالة
                    </Button>
                  )}
                </div>
                {couponMsg && (
                  <div className="text-xs text-gray-600">{couponMsg}</div>
                )}
                {appliedCoupon && (
                  <div className="text-xs text-green-600">
                    تم تفعيل الكوبون: <b>{appliedCoupon.code}</b>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span>{t("subtotal")}</span>
                <span>{formatCurrency(subtotal, locale)}</span>
              </div>

              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>خصم الكوبون ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(couponDiscount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>{t("shipping")}</span>
                <span>
                  {shippingFee
                    ? formatCurrency(shippingFee, locale)
                    : t("selectGovernorate")}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>{t("total")}</span>
                <span>{formatCurrency(total, locale)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
