import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { GOVERNORATES, DEFAULT_CURRENCY, GovKey } from "@/lib/shipping";
import { headers } from "next/headers";

const supabase = supabaseAdmin();

const ItemSchema = z.object({
  id: z.string(),
  name_ar: z.string().optional(),
  name_en: z.string().optional(),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
  img: z.string().url().optional(),
});

const BodySchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional(),
  }),
  address: z.object({
    governorate: z.string(),
    address1: z.string().min(5),
    address2: z.string().optional(),
  }),
  items: z.array(ItemSchema).min(1),
  notes: z.string().optional(),
  currency: z.string().default(DEFAULT_CURRENCY),
  locale: z.string().default("ar"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = BodySchema.parse(json);

    const govKey = data.address.governorate as GovKey;
    if (!(govKey in GOVERNORATES)) {
      throw new Error("Invalid governorate");
    }

    const shipping_fee = GOVERNORATES[govKey].fee;
    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = subtotal + shipping_fee;

    // إدراج في orders
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_name: data.customer.name,
        customer_email: data.customer.email ?? null,
        customer_phone: data.customer.phone,
        address1: data.address.address1,
        address2: data.address.address2 ?? null,
        governorate_key: govKey,
        shipping_fee,
        subtotal,
        total,
        currency: data.currency,
        locale: data.locale,
        status: "pending",
        notes: data.notes ?? null,
      })
      .select("id")
      .single();

    if (orderErr) throw orderErr;
    const orderId = orderRow!.id as string;

    // إدراج العناصر
    const itemsPayload = data.items.map((i) => ({
      order_id: orderId,
      product_id: i.id,
      name_ar: i.name_ar ?? null,
      name_en: i.name_en ?? null,
      price: i.price,
      qty: i.qty,
      img: i.img ?? null,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // (اختياري) ابعت إيميل إشعار
    try {
      const h = await headers();
      const proto = h.get("x-forwarded-proto") ?? "http";
      const host = h.get("x-forwarded-host") ?? h.get("host");
      const baseUrl = `${proto}://${host}`;
      await fetch(`${baseUrl}/api/order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
            address: `${GOVERNORATES[govKey].en} | ${data.address.address1}${
              data.address.address2 ? " - " + data.address.address2 : ""
            }`,
          },
          items: data.items.map((i) => ({
            id: i.id,
            name_ar: i.name_ar,
            name_en: i.name_en,
            price: i.price,
            qty: i.qty,
            img: i.img,
          })),
          currency: data.currency,
          locale: data.locale,
          notes: data.notes,
        }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ ok: true, orderId }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
