import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "use-intl";
import { Links } from "../links";

export const LinksSheet = () => {
  const t = useTranslations("header");
  const locale = useLocale();
  return (
    <Sheet>
      <SheetTrigger className="flex items-center gap-2">
        <Menu className="w-4 h-4" />
        {t("botBar.menu")}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-left border-b pb-2">
            {t("botBar.menu")}
          </SheetTitle>
          <SheetDescription className="flex text-black">
            <ul
              className={`${
                locale === "ar" ? "text-right" : "text-left"
              } flex flex-col items-center w-full`}
            >
              <Links className="w-full border-b py-3" />
            </ul>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
