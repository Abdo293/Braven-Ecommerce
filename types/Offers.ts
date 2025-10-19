export interface Offer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: "all" | "category" | "product";
  category_id?: string | null;
  product_id?: string | null;
}
