import { Categories } from "@/types/Categories";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export const useCategories = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return { categories, loading };
};
