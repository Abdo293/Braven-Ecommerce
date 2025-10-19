import { useTranslations } from "next-intl";
import Link from "next/link";

export const Links = ({ className }: { className?: string }) => {
  const t = useTranslations("header");
  return (
    <>
      <li className={`${className} font-semibold`}>
        <Link href={"/"}>{t("botBar.home")}</Link>
      </li>
      <li className={`${className} font-semibold`}>
        <Link href={"/shop"}>{t("botBar.shop")}</Link>
      </li>
      <li className={`${className} font-semibold`}>
        <Link href={"/about"}>{t("botBar.about")}</Link>
      </li>
      <li className={`${className} font-semibold`}>
        <Link href={"/contact"}>{t("botBar.contact")}</Link>
      </li>
    </>
  );
};
