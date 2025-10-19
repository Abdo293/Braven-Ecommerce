// app/search/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";

type SearchParams = { q?: string | string[] };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>; // 👈 أهم تعديل
}) {
  const t = await getTranslations("search");
  const locale = await getLocale();

  const { q: rawQ } = await searchParams; // 👈 استنى الـ Promise
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim() ?? "";

  const supabase = await createClient();

  let items: any[] = [];
  if (q) {
    const like = `%${q}%`;
    const { data } = await supabase
      .from("products")
      .select("id,name_ar,name_en,price,img,productType,is_active")
      .or(
        `name_ar.ilike.${like},name_en.ilike.${like},productType.ilike.${like}`
      )
      .eq("is_active", true)
      .limit(60);
    items = data || [];
  }

  const titleOf = (p: any) =>
    (locale === "ar" ? p.name_ar || p.name_en : p.name_en || p.name_ar) || "";

  return (
    <section className="container mx-auto px-3 py-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {q && (
        <p className="text-sm text-muted-foreground mt-1">
          {t("resultsFor", { q })}
        </p>
      )}

      {!q ? (
        <p className="mt-6 text-muted-foreground">{t("emptyQuery")}</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="rounded-xl border hover:shadow-sm transition"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
                <Image
                  src={p.img || "/placeholder.svg"}
                  alt={titleOf(p)}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <div className="line-clamp-2 font-medium">{titleOf(p)}</div>
                {typeof p.price === "number" && (
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    {p.price}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
