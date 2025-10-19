export interface Products {
  id: string;
  description_ar?: string;
  description_en?: string;
  is_active?: boolean;
  name_ar: string;
  name_en: string;
  price: number;
  quantity: number;
  type?: string;
  category_id: string;
  img: string;
  created_at: string;
}
