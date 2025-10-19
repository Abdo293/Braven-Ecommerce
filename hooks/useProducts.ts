import { Products } from "@/types/Products";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export const useProducts = () => {
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return { products, loading };
};
