"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { useShopStore } from "@/store/useShopStore";
import { useTranslations } from "next-intl";
import { PagesHeader } from "@/components/PagesHeader";

const PRIMARY =
  "bg-[#16a34a] text-white hover:bg-[#2eb34f] focus-visible:ring-[#34C759]";

export default function ViewCartPage() {
  const { cart, removeFromCart, increaseCartQty, decreaseCartQty, setCartQty } =
    useShopStore();

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
    }).format(n || 0);

  const subtotal = cart.reduce(
    (s, p) => s + (Number(p.price) || 0) * (p.cartQty || 1),
    0
  );
  const t = useTranslations("viewCart");
  const p = useTranslations("pagesTitle");

  return (
    <div>
      <div className="bg-[#f0f0f0]">
        <div className="container mx-auto max-md:px-3">
          <PagesHeader routes="cart" title={p("cart")} />
        </div>
      </div>
      <div className="container mx-auto px-4 py-10">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase mb-3">
          <div className="col-span-6">{t("product")}</div>
          <div className="col-span-3 text-center">{t("quantity")}</div>
          <div className="col-span-3 text-right">{t("total")}</div>
        </div>

        <Separator className="mb-4" />

        {/* Cart Items */}
        <div className="space-y-6">
          {cart.length === 0 ? (
            <p className="text-gray-500">{t("emptyCart")}</p>
          ) : (
            cart.map((item) => {
              const unit = Number(item.price) || 0;
              const qty = item.cartQty || 1;
              const line = unit * qty;
              const stock =
                typeof item.quantity === "number" ? item.quantity : Infinity;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-4"
                >
                  {/* Product Info */}
                  <div className="col-span-6 flex gap-4">
                    <div className="relative w-20 h-20 overflow-hidden rounded-md bg-gray-100 shrink-0">
                      {item.img && (
                        <Image
                          src={item.img}
                          alt={item.name_en || "product"}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {item.name_ar || item.name_en}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {money(unit)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3 flex items-center justify-center gap-3">
                    <div className="flex items-center border rounded-full h-9 pl-2 pr-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full"
                        onClick={() => decreaseCartQty(item.id)}
                        disabled={qty <= 1}
                      >
                        –
                      </Button>

                      <Input
                        className="h-7 w-12 border-0 text-center text-sm focus-visible:ring-0"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => {
                          const v = parseInt(
                            e.target.value.replace(/[^\d]/g, "") || "1",
                            10
                          );
                          setCartQty(item.id, v);
                        }}
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full"
                        onClick={() => increaseCartQty(item.id)}
                        disabled={qty >= stock}
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      className={`ml-3 h-9 w-9 rounded-full ${PRIMARY}`}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Total */}
                  <div className="col-span-3 text-right font-semibold text-[#16a34a]">
                    {money(line)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Separator className="my-6" />

        {/* Subtotal + Checkout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="flex items-center justify-between text-sm font-semibold">
              <span className="px-3 font-bold text-xl">{t("subtotal")}</span>
              <span className="text-[#16a34a] text-2xl font-bold">
                {" "}
                {money(subtotal)}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/checkout" className="w-full md:w-auto">
              <Button className={`w-full md:w-40 h-11 rounded-full ${PRIMARY}`}>
                {t("checkout")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
