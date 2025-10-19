import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface FilterState {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  categories: string[];
  types: string[];
  availability: "all" | "inStock" | "outOfStock";
  sortBy: string;
}

interface FilterStore {
  // State
  filters: FilterState;
  allProducts: any[];
  filteredProducts: any[];
  totalProducts: number;

  // Actions
  setFilters: (filters: Partial<FilterState>) => void;
  updatePriceRange: (field: "min" | "max", value: number | null) => void;
  toggleCategory: (categoryId: string) => void;
  toggleType: (typeId: string) => void;
  setAvailability: (availability: "all" | "inStock" | "outOfStock") => void;
  setSortBy: (sortBy: string) => void;
  clearAllFilters: () => void;
  setProducts: (products: any[]) => void;
  applyFilters: () => void;
}

const initialFilters: FilterState = {
  priceRange: { min: null, max: null },
  categories: [],
  types: [],
  availability: "all",
  sortBy: "featured",
};

export const useFilterStore = create<FilterStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      filters: initialFilters,
      allProducts: [],
      filteredProducts: [],
      totalProducts: 0,

      // Actions
      setFilters: (newFilters) => {
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
          }),
          false,
          "setFilters"
        );
        get().applyFilters();
      },

      updatePriceRange: (field, value) => {
        set(
          (state) => ({
            filters: {
              ...state.filters,
              priceRange: {
                ...state.filters.priceRange,
                [field]: value,
              },
            },
          }),
          false,
          "updatePriceRange"
        );
        get().applyFilters();
      },

      toggleCategory: (categoryId) => {
        set(
          (state) => ({
            filters: {
              ...state.filters,
              categories: state.filters.categories.includes(categoryId)
                ? state.filters.categories.filter((id) => id !== categoryId)
                : [...state.filters.categories, categoryId],
            },
          }),
          false,
          "toggleCategory"
        );
        get().applyFilters();
      },

      toggleType: (typeId) => {
        set(
          (state) => ({
            filters: {
              ...state.filters,
              types: state.filters.types.includes(typeId)
                ? state.filters.types.filter((id) => id !== typeId)
                : [...state.filters.types, typeId],
            },
          }),
          false,
          "toggleType"
        );
        get().applyFilters();
      },

      setAvailability: (availability) => {
        set(
          (state) => ({
            filters: { ...state.filters, availability },
          }),
          false,
          "setAvailability"
        );
        get().applyFilters();
      },

      setSortBy: (sortBy) => {
        set(
          (state) => ({
            filters: { ...state.filters, sortBy },
          }),
          false,
          "setSortBy"
        );
        get().applyFilters();
      },

      clearAllFilters: () => {
        set({ filters: initialFilters }, false, "clearAllFilters");
        get().applyFilters();
      },

      setProducts: (products) => {
        set(
          {
            allProducts: products || [],
            totalProducts: products?.length || 0,
          },
          false,
          "setProducts"
        );
        get().applyFilters();
      },

      applyFilters: () => {
        const { allProducts, filters } = get();

        if (!allProducts?.length) {
          set({ filteredProducts: [] }, false, "applyFilters/empty");
          return;
        }

        let result = [...allProducts];

        // Apply price range filter
        if (
          filters.priceRange.min !== null ||
          filters.priceRange.max !== null
        ) {
          result = result.filter((product) => {
            const price = parseFloat(product.price) || 0;
            const min = filters.priceRange.min || 0;
            const max = filters.priceRange.max || Infinity;
            return price >= min && price <= max;
          });
        }

        // Apply category filter
        if (filters.categories.length > 0) {
          result = result.filter((product) =>
            filters.categories.includes(product.category_id?.toString())
          );
        }

        // Apply type filter
        if (filters.types.length > 0) {
          result = result.filter((product) =>
            filters.types.includes(product.type)
          );
        }

        // Apply availability filter - FIXED VERSION
        if (filters.availability !== "all") {
          result = result.filter((product) => {
            // Handle different possible field names and data types
            let stockQuantity = product.quantity;

            // Convert to number if it's a string, but preserve 0 values
            let stock;
            if (stockQuantity === null || stockQuantity === undefined) {
              stock = 0;
            } else if (typeof stockQuantity === "string") {
              stock = parseInt(stockQuantity, 10);
              // If parseInt returns NaN, default to 0
              stock = isNaN(stock) ? 0 : stock;
            } else {
              stock = Number(stockQuantity);
              // If Number returns NaN, default to 0
              stock = isNaN(stock) ? 0 : stock;
            }

            // Additional check for boolean availability field if it exists
            const availabilityStatus = product.availability ?? product.in_stock;

            // Determine if product is in stock
            let isInStock = stock > 0;

            // If there's a boolean availability field, use it as well
            if (typeof availabilityStatus === "boolean") {
              isInStock = availabilityStatus && stock > 0;
            } else if (typeof availabilityStatus === "string") {
              isInStock =
                (availabilityStatus.toLowerCase() === "in_stock" ||
                  availabilityStatus.toLowerCase() === "available") &&
                stock > 0;
            }

            // Debug logging (remove in production)
            if (process.env.NODE_ENV === "development") {
              console.log(
                `Product: ${
                  product.name_en || product.name
                }, Raw Stock: ${stockQuantity}, Parsed Stock: ${stock}, IsInStock: ${isInStock}, Filter: ${
                  filters.availability
                }`
              );
            }

            // Return products based on the selected filter
            if (filters.availability === "inStock") {
              return isInStock; // Show only products with stock > 0
            } else if (filters.availability === "outOfStock") {
              return !isInStock; // Show only products with stock = 0
            }

            return true; // This should never be reached since we check for "all" above
          });
        }

        // Apply sorting
        result.sort((a, b) => {
          switch (filters.sortBy) {
            case "priceLowToHigh":
              return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
            case "priceHighToLow":
              return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
            case "nameAtoZ":
              return a.name_en?.localeCompare(b.name_en) || 0;
            case "nameZtoA":
              return b.name_en?.localeCompare(a.name_en) || 0;
            case "newest":
              return (
                new Date(b.created_at || 0).getTime() -
                new Date(a.created_at || 0).getTime()
              );
            case "oldest":
              return (
                new Date(a.created_at || 0).getTime() -
                new Date(b.created_at || 0).getTime()
              );
            default: // featured
              return 0;
          }
        });

        set({ filteredProducts: result }, false, "applyFilters/complete");
      },
    }),
    {
      name: "filter-store",
    }
  )
);
