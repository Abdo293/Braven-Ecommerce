import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCategories } from "@/hooks/useCategories";

export const CategoriesSheet = () => {
  const { categories } = useCategories();
  const t = useTranslations("header");
  const locale = useLocale();
  return (
    <div>
      <Sheet>
        <SheetTrigger
          className={`flex items-center justify-center gap-2 bg-green-500 text-white h-13 w-13 ${
            locale === "ar" ? "rounded-l-3xl" : "rounded-r-3xl"
          }`}
        >
          <Menu size={25} />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-left border-b pb-2">
              {t("botBar.searchByCategories")}
            </SheetTitle>
            <SheetDescription className=" text-black">
              {categories.map((category) => (
                <p className="pt-5">
                  {locale === "ar" ? category.name_ar : category.name_en}
                </p>
              ))}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};
