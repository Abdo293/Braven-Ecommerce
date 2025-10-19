import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit") || 8), 50);

    if (!q) return NextResponse.json({ ok: true, items: [] });

    const supabase = await createClient();
    const like = `%${q}%`;

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name_ar,
        name_en,
        price,
        is_active,
        product_media (
          file_url,
          public_id
        )
      `
      )
      .or(`name_ar.ilike.${like},name_en.ilike.${like}`)
      .limit(limit);

    if (error) throw error;

    const rows = (data || []).filter((p: any) => p.is_active !== false);

    const items = rows.map((p: any) => {
      const media = Array.isArray(p.product_media) ? p.product_media : [];
      const first = media[0] || null; // من غير ترتيب

      return {
        id: p.id,
        name_ar: p.name_ar ?? null,
        name_en: p.name_en ?? null,
        price: p.price != null ? Number(p.price) : null,
        img: first?.file_url ?? null,
        public_id: first?.public_id ?? null,
      };
    });

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
