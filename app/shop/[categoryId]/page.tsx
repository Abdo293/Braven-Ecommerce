"use client";
import { ProductsCard } from "@/components/products-card/ProductsCard";
import { useCategories } from "@/hooks/useCategories";
import { useOffer } from "@/hooks/useOffers";
import { useProducts } from "@/hooks/useProducts";
import { useProductsMedia } from "@/hooks/useProductsMedia";
import { useTypes } from "@/hooks/useTypes";
import { useFilterStore } from "@/store/useFilterStore";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useMemo, useEffect } from "react";

function CategoriesProducts() {
  const { products } = useProducts();
  const { productsMedia } = useProductsMedia();
  const { offers } = useOffer();
  const { categories } = useCategories();
  const { productTypes } = useTypes();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const locale = useLocale();

  // Get filtered products from the store instead of local filtering
  const { filteredProducts } = useFilterStore();

  // Set the category filter when the component mounts or categoryId changes
  useEffect(() => {
    if (categoryId) {
      // Use existing toggleCategory method - first clear, then add
      const { filters, toggleCategory } = useFilterStore.getState();

      // Clear existing category filters
      filters.categories.forEach((catId) => {
        if (catId !== categoryId) {
          toggleCategory(catId);
        }
      });

      // Add current category if not already selected
      if (!filters.categories.includes(categoryId)) {
        toggleCategory(categoryId);
      }
    }
  }, [categoryId]);

  // Get current category info
  const currentCategory = categories.find(
    (category) => category.id === categoryId
  );

  // Use the filtered products from the store, but ensure they match the current category
  const displayProducts = useMemo(() => {
    return filteredProducts.filter(
      (product) => product.category_id === categoryId && product.quantity !== 0
    );
  }, [filteredProducts, categoryId]);

  return (
    <div>
      <h2 className="font-bold pb-3 text-3xl">
        {locale === "ar" ? currentCategory?.name_ar : currentCategory?.name_en}
      </h2>
      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5">
        {displayProducts.map((product) => {
          const relevantOffer = offers.find((offer) =>
            offer.applies_to === "product"
              ? offer.product_id === product.id
              : offer.category_id === product.category_id
          );

          const productMedia = productsMedia.find(
            (media) => media.product_id === product.id && media.is_main === true
          );

          const productsTypes = productTypes.find(
            (type) => type.id === product.type
          );

          return (
            <div key={product.id}>
              <ProductsCard
                applies_to={relevantOffer?.applies_to || ""}
                products_category_id={product.category_id}
                categories_category_id={relevantOffer?.category_id ?? ""}
                discount_type={relevantOffer?.discount_type || ""}
                discount_value={relevantOffer?.discount_value || 0}
                name_ar={product.name_ar}
                name_en={product.name_en}
                price={product.price}
                quantity={product.quantity}
                type={
                  locale === "en"
                    ? productsTypes?.name_en ?? ""
                    : productsTypes?.name_ar ?? ""
                }
                img={productMedia?.file_url || ""}
                productId={product.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoriesProducts;
