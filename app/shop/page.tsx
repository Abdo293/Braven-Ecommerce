"use client";
import { ProductsCard } from "@/components/products-card/ProductsCard";
import { useOffer } from "@/hooks/useOffers";
import { useProducts } from "@/hooks/useProducts";
import { useProductsMedia } from "@/hooks/useProductsMedia";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTypes } from "@/hooks/useTypes";
import { useLocale } from "next-intl";

function ShopWithPagination() {
  const { products } = useProducts();
  const { offers } = useOffer();
  const { productsMedia } = useProductsMedia();
  const { productTypes } = useTypes();

  // Get filtered products from Zustand store
  const filteredProducts = useFilterStore((state) => state.filteredProducts);
  const setProducts = useFilterStore((state) => state.setProducts);

  const locale = useLocale();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Update the store with products when they load
  useEffect(() => {
    if (products?.length) {
      setProducts(products);
    }
  }, [products, setProducts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts
    .filter((product) => product.quantity !== 0)
    .slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 container mx-auto py-8">
      {/* Results Summary */}
      {filteredProducts.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}{" "}
          of {filteredProducts.length} products
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3">
        {currentProducts.map((product) => {
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
            <div key={product.id} className="w-full">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => handlePageChange(page)}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* No Results Message */}
      {filteredProducts.length === 0 && products?.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            No products found matching your filters
          </div>
          <div className="text-gray-400 text-sm">
            Try adjusting your filter criteria
          </div>
        </div>
      )}

      {/* Loading State */}
      {!products?.length && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Loading products...</div>
        </div>
      )}
    </div>
  );
}

export default ShopWithPagination;
