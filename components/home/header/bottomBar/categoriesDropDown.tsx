import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/hooks/useCategories";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export const CategoriesDropDown = () => {
  const { categories } = useCategories();
  const t = useTranslations("header");
  const locale = useLocale();

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className="border-none cursor-pointer font-semibold max-md:bg-green-500"
          >
            <Menu className="w-4 h-4" />
            <span className="max-md:hidden">
              {t("botBar.searchByCategories")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          {categories.map((category) => (
            <Link href={`/shop/${category.id}`}>
              <DropdownMenuItem key={category.id}>
                {locale === "ar" ? category.name_ar : category.name_en}
                <DropdownMenuSeparator />
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
