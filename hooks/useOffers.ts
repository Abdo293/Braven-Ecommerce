import { Offer } from "@/types/Offers";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export const useOffer = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const { data } = await supabase.from("offers").select("*");
      if (data) setOffers(data);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return { offers, loading };
};
