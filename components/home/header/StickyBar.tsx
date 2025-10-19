"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, Heart } from "lucide-react";
import { LanguageSwitcher } from "../../LanguageSwitcher";
import { useShopStore } from "@/store/useShopStore";
import CartSheet from "@/components/cart/AddToCartSheet";
import { Links } from "./links";
import Image from "next/image";
import Link from "next/link";

export const StickyBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const openCart = useShopStore((s) => s.openCart);
  const cartCount = useShopStore((s) => s.cart.length);
  const wishlistCount = useShopStore((s) => s.wishlist.length);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show bar when scrolling down and header is not visible (adjust threshold as needed)
      const headerHeight = 150; // Approximate header height
      const shouldShow =
        currentScrollY > headerHeight && currentScrollY > lastScrollY;

      setIsVisible(shouldShow);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Mobile Sticky Bar - Top Position */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 py-1 shadow-lg transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link href="/">
            <Image src={"/logo.png"} height={350} width={90} alt="Logo" />
          </Link>
          {/* Language Switcher */}
          <div className="flex items-center">
            <ul className="hidden md:flex md:items-center md:space-x-4 mr-4">
              <Links />
            </ul>
          </div>

          {/* Center Actions */}
          <div className="flex items-center gap-6">
            {/* Wishlist */}
            <button
              type="button"
              className="relative flex flex-col items-center gap-1"
              aria-label="Wishlist"
            >
              <Heart size={24} className="text-gray-800" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 text-xs bg-red-500 text-white rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex flex-col items-center gap-1"
              aria-label="Open cart"
            >
              <ShoppingCart size={24} className="text-gray-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 text-xs bg-green-600 text-white rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cart Sheet - Only render once */}
      <CartSheet />
    </>
  );
};
