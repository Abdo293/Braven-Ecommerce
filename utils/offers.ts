export type Offer = {
  id: string;
  discount_type: "percentage" | "fixed" | string;
  discount_value: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  applies_to: "product" | "category" | "all" | string;
  category_id?: string | null;
  product_id?: string | null;
};

export const isOfferActive = (offer?: Offer | null) => {
  if (!offer || offer.is_active === false) return false;
  const now = Date.now();
  const start = offer.start_date
    ? new Date(offer.start_date).getTime()
    : -Infinity;
  const end = offer.end_date ? new Date(offer.end_date).getTime() : Infinity;
  return now >= start && now <= end;
};

const rank = (o: Offer) =>
  o.applies_to === "product" ? 3 : o.applies_to === "category" ? 2 : 1;

export const bestOfferFor = (
  product: { id: string; category_id?: string | null },
  offers: Offer[]
) => {
  const active = (offers || []).filter(isOfferActive);
  const cands = active.filter((o) => {
    if (o.applies_to === "product") return o.product_id === product.id;
    if (o.applies_to === "category")
      return o.category_id === product.category_id;
    if (o.applies_to === "all") return true;
    return false;
  });
  if (!cands.length) return null;
  return cands.sort(
    (a, b) =>
      rank(b) - rank(a) || (+b.discount_value || 0) - (+a.discount_value || 0)
  )[0]!;
};

export const applyOfferToPrice = (basePrice: number, offer?: Offer | null) => {
  if (!offer) return { final: basePrice, percent: 0 };
  const base = +basePrice || 0;
  const val = +offer.discount_value || 0;

  if (offer.discount_type === "percentage") {
    const final = Math.max(0, base * (1 - val / 100));
    return { final, percent: Math.round(val) };
  }
  if (offer.discount_type === "fixed") {
    const final = Math.max(0, base - val);
    const percent = base > 0 ? Math.round((val / base) * 100) : 0;
    return { final, percent };
  }
  return { final: base, percent: 0 };
};

export const priceForCart = (
  product: { id: string; category_id?: string | null; price: number | string },
  offers: Offer[]
) => {
  const base = Number(product.price) || 0;
  const offer = bestOfferFor(product, offers);
  const { final, percent } = applyOfferToPrice(base, offer);
  return {
    unitPrice: +final.toFixed(2),
    originalPrice: base,
    discountPercent: percent,
    offer,
  };
};
