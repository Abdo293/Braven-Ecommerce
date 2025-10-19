import { ProductsMedia } from "@/types/ProductsMedia";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export const useProductsMedia = () => {
  const [productsMedia, setProductsMedia] = useState<ProductsMedia[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const { data } = await supabase.from("product_media").select("*");
      if (data) setProductsMedia(data);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return { productsMedia, loading };
};
