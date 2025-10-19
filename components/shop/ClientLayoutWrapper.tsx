"use client";
import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProductTypes } from "@/hooks/useProductTypes";
import { useFilterStore } from "@/store/useFilterStore";
import GlobalProductFilters from "./GlobalProductFilters";
import { useTypes } from "@/hooks/useTypes";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const { products } = useProducts();
  const { categories } = useCategories();
  const setProducts = useFilterStore((state) => state.setProducts);

  const { productTypes } = useTypes();

  // Update products in store when they load
  useEffect(() => {
    if (products) {
      setProducts(products);
    }
  }, [products, setProducts]);

  // Transform categories to match the expected format
  const availableCategories =
    categories?.map((category) => ({
      id: category.id?.toString() || "",
      name_en: category.name_en || "",
      name_ar: category.name_ar || "",
    })) || [];

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r bg-white sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <GlobalProductFilters
            availableCategories={availableCategories}
            availableTypes={productTypes}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile Filter Button */}
        <div className="lg:hidden p-4 border-b bg-white sticky top-0 z-10">
          <GlobalProductFilters
            availableCategories={availableCategories}
            availableTypes={productTypes}
            isMobile={true}
          />
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
