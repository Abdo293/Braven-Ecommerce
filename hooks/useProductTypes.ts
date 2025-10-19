"use client";
import { useMemo } from "react";

export const useProductTypes = (products: any[]) => {
  return useMemo(() => {
    const types = new Set();
    products?.forEach((product) => {
      if (product.type) {
        types.add(product.type);
      }
    });
    return Array.from(types).map((type) => ({
      id: type as string,
      name_en: type as string,
      name_ar: type as string, // Add proper Arabic translations if needed
    }));
  }, [products]);
};
