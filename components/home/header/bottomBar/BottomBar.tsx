"use client";
import Link from "next/link";
import { Percent } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "../../../LanguageSwitcher";
import { Links } from "../links";
import { CategoriesDropDown } from "./categoriesDropDown";
import { CategoriesSheet } from "./categoriesSheet";
import { LinksSheet } from "./LinksSheet";

export const BottomBar = () => {
  const t = useTranslations("header");
  const locale = useLocale();

  return (
    <>
      <div className="border-y-1 py-2 max-md:px-3 sticky top-0">
        <div className="container mx-auto flex items-center justify-between gap-5">
          <div className="flex items-center gap-10 max-md:hidden">
            <div className="max-md:hidden">
              <CategoriesDropDown />
            </div>

            <ul className="flex items-center gap-5 max-md:hidden">
              <Links />
            </ul>
          </div>

          <div className="max-md:hidden">
            <Link
              href={"/shop/special-products"}
              className="flex items-center gap-2"
            >
              <Percent className="w-5 h-5 text-green-500" />
              <span className="font-semibold">{t("botBar.todayDeal")}</span>
            </Link>
          </div>

          {/* start mobile view */}
          <div className="md:hidden">
            <LinksSheet />
          </div>

          <div className="md:hidden text-black">
            <LanguageSwitcher color="text-black" />
          </div>
          {/* end mobile view */}
        </div>
      </div>

      {/* Move CategoriesSheet outside and use portal-like positioning */}
      <div
        className={`md:hidden fixed ${
          locale === "ar" ? "right-0" : "left-0"
        } top-1/2 transform -translate-y-1/2`}
        style={{
          zIndex: 999999,
          pointerEvents: "auto",
        }}
      >
        <CategoriesSheet />
      </div>
    </>
  );
};
