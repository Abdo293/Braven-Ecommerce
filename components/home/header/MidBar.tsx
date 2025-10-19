"use client";

import Image from "next/image";
import { Input } from "../../ui/input";
import { useLocale, useTranslations } from "next-intl";
import { Search, ShoppingCart, Heart } from "lucide-react";
import CartSheet from "@/components/cart/AddToCartSheet";
import { useShopStore } from "@/store/useShopStore";
import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

export const MidBar = () => {
  const t = useTranslations("header");
  const locale = useLocale();
  const isArabic = locale === "ar";

  // افتح الشيت لما تدوس على أيقونة السلة
  const openCart = useShopStore((s) => s.openCart);
  const cartCount = useShopStore((s) => s.cart.length);
  const wishlistCount = useShopStore((s) => s.wishlist.length);

  return (
    <div className="py-3">
      <div className="container mx-auto flex justify-between items-center px-3">
        <Link href="/" className="flex items-center">
          <Image src={"/logo.png"} height={350} width={100} alt="Logo" />
        </Link>

        <div className="relative w-full max-w-4xl max-md:hidden">
          <SearchBox />
        </div>

        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative"
            aria-label="Wishlist"
            // تقدر تربطه بفتح شيت تاني لو عايز
          >
            <Heart size={28} className="text-gray-800" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-red-500 text-white rounded-full px-1.5">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-1 leading-4"
            aria-label="Open cart"
          >
            <ShoppingCart size={28} className="text-gray-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-green-600 text-white rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* لازم يكون متثبت مرة واحدة في الشجرة */}
          <CartSheet />
        </div>
      </div>

      <div>
        <div className="relative w-full max-w-md md:hidden px-3 md:mt-5 max-md:mt-1">
          <SearchBox />
        </div>
      </div>
    </div>
  );
};
