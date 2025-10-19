// components/search/SearchBox.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type ProductLite = {
  id: string;
  name_ar?: string | null;
  name_en?: string | null;
  price?: number | null;
  img?: string | null;
  productType?: string | null;
};

export function SearchBox({
  className,
  inputClassName,
  autoFocus = false,
}: {
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}) {
  const t = useTranslations("header");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ProductLite[]>([]);
  const [loading, setLoading] = useState(false);
  const acRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // جِيب عنوان مناسب للغة
  const titleOf = (p: ProductLite) =>
    (isArabic ? p.name_ar || p.name_en : p.name_en || p.name_ar) || "";

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // ابحث بعد تأخير بسيط (debounce)
  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    acRef.current?.abort();
    const ac = new AbortController();
    acRef.current = ac;

    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ac.signal,
        });
        const json = await res.json();
        if (json.ok) {
          setItems(json.items || []);
          setOpen((json.items || []).length > 0);
        } else {
          setItems([]);
          setOpen(false);
        }
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(id);
      ac.abort();
    };
  }, [q]);

  // Enter → صفحة نتائج
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && q.trim()) {
      e.preventDefault();
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          isArabic ? "left-5" : "right-5"
        )}
      />
      <Input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={t("midBar.search")}
        className={cn(
          `${isArabic ? "pr-5" : "pl-5"} py-6 rounded-full`,
          inputClassName
        )}
        autoFocus={autoFocus}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="search-suggestions"
      />

      {/* Dropdown الاقتراحات */}
      {open && (
        <div
          id="search-suggestions"
          className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg"
          onMouseDown={(e) => e.preventDefault()} // عشان مايفقدش الفوكس
        >
          {/* Loading */}
          {loading && (
            <div className="p-3 text-sm text-muted-foreground">
              {t("loading") || "Loading..."}
            </div>
          )}

          {/* Results */}
          {!loading && items.length > 0 && (
            <ul className="max-h-80 overflow-auto py-2">
              {items.map((p) => {
                const title = titleOf(p);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/${p.id}`} // غيّر المسار حسب عندك
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/60"
                      onClick={() => setOpen(false)}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={p.img || "/placeholder.svg"}
                          alt={title || "product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-1">
                          {title}
                        </div>
                        {typeof p.price === "number" && (
                          <div className="text-xs text-muted-foreground">
                            {p.price}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* لا نتائج */}
          {!loading && items.length === 0 && q.trim() && (
            <div className="p-3 text-sm text-muted-foreground">
              {t("noResults") || "No results"}
            </div>
          )}

          {/* زر "عرض كل النتائج"
          {!!q.trim() && (
            <button
              className="w-full border-t px-3 py-2 text-sm hover:bg-muted/60 text-left"
              onClick={() => {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              }}
            >
              {t("viewAll")} "{q.trim()}"
            </button>
          )} */}
        </div>
      )}
    </div>
  );
}
