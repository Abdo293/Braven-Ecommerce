"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useShopStore } from "@/store/useShopStore";
import { useTranslations } from "next-intl";

const GREEN =
  "bg-[#16a34a] text-white hover:bg-[#2eb34f] focus-visible:ring-[#34C759]";

export default function AddToCartSheet() {
  const {
    cart,
    removeFromCart,
    clearCart,
    isCartOpen,
    closeCart,
    increaseCartQty,
    decreaseCartQty,
    setCartQty,
  } = useShopStore();

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGY",
    }).format(n || 0);

  const subtotal = cart.reduce(
    (s, p) => s + (Number(p.price) || 0) * (p.cartQty || 1),
    0
  );

  const t = useTranslations("cart");

  return (
    <Sheet open={isCartOpen} onOpenChange={(o) => (o ? null : closeCart())}>
      <SheetContent className="w-full sm:max-w-md p-0">
        {/* Header */}
        <div className="px-5 pt-4">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-left text-[15px] tracking-wide">
              {t("title")}
            </SheetTitle>
          </SheetHeader>
        </div>

        <Separator />

        {/* Items */}
        <div className="px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            cart.map((item) => {
              const unit = Number(item.price) || 0;
              const qty = item.cartQty || 1;
              const line = unit * qty;
              const stock =
                typeof item.quantity === "number" ? item.quantity : Infinity;

              return (
                <div key={item.id} className="grid grid-cols-12 gap-3">
                  {/* product cell */}
                  <div className="col-span-8 flex gap-3">
                    <div className="relative w-16 h-16 overflow-hidden rounded-md bg-gray-100 shrink-0">
                      {item.img && (
                        <Image
                          src={item.img}
                          alt={item.name_en || "product"}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5 line-clamp-2">
                        {item.name_ar || item.name_en}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {money(unit)}
                      </p>

                      {/* Counter + delete */}
                      <div className="mt-2 flex items-center gap-3">
                        {/* pill counter */}
                        <div className="flex items-center border rounded-full h-9 pl-2 pr-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full"
                            onClick={() => decreaseCartQty(item.id)}
                            disabled={qty <= 1}
                            aria-label="Decrease quantity"
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
                            aria-label="Increase quantity"
                          >
                            +
                          </Button>
                        </div>

                        {/* green circular delete */}
                        <Button
                          type="button"
                          size="icon"
                          className={`h-10 w-10 rounded-full ${GREEN}`}
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* total cell */}
                  <div className="col-span-4 flex justify-end">
                    <span className="font-semibold text-[#34C759]">
                      {money(line)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Separator />

        <SheetFooter className="border-t p-0">
          {/* Subtotal */}
          <div className="px-5 py-4 space-y-2 w-full">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t("total")}</span>
              <span className="font-bold text-[#34C759]">
                {money(subtotal)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-5 pb-5 grid grid-cols-2 gap-3 w-full">
            <Link href="/cart">
              <Button
                className={`w-full h-11 rounded-full ${GREEN}`}
                onClick={closeCart}
              >
                {t("viewCart")}
              </Button>
            </Link>
            <Link href="/checkout">
              <Button
                className={`w-full h-11 rounded-full ${GREEN}`}
                onClick={closeCart}
              >
                {t("checkout")}
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
