"use client";
import { ProductType } from "@/types/product-types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export const useTypes = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      const { data } = await supabase.from("product_type").select("*");
      if (data) setProductTypes(data);
      setLoading(false);
    };
    fetchTypes();
  }, []);

  return { productTypes, loading };
};
