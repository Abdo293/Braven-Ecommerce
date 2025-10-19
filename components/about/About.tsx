// app/(marketing)/about/page.tsx
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Target,
  Facebook,
  Instagram,
  MessageCircle,
  Phone,
  ArrowRight,
} from "lucide-react";

// ====== محتوى الصفحه حسب اللغة ======
const CONTENT = {
  ar: {
    title: "من نحن",
    about:
      "نحن منصة تسوّق إلكترونية شاملة تهدف إلى تلبية احتياجات الجميع من الرجال والنساء، عبر تقديم مجموعة متنوعة من المنتجات بأفضل الأسعار وأعلى جودة. رؤيتنا هي أن نصبح الوجهة المثالية للتسوّق، حيث تجد كل ما تحتاجه بسهولة وسرعة.",
    teamTitle: "فريق العمل",
    team: "فريقنا في Marketellaa يعمل بكل جد وإخلاص لتقديم أفضل تجربة تسوق لكم. نحن ملتزمون بتوفير كل ما تحتاجونه بجودة عالية وخدمة مميزة، لأن راحتكم ورضاكم هي أولويتنا دائمًا. معًا نعمل على تحقيق الأفضل لكم!",
    socialsTitle: "تواصل معنا",
    facebook: "فيسبوك",
    instagram: "إنستجرام",
    whatsapp: "واتساب",
    phoneLabel: "اتصل بنا",
    shopNow: "تسوّق الآن",
    brand: "Marketellaa",
    metaDesc:
      "Marketellaa — منصة تسوق إلكترونية تقدم منتجات متنوعة للرجال والنساء بأفضل سعر وجودة، ودعم سريع عبر فيسبوك، إنستجرام، وواتساب.",
    scope: "على مدار الساعة لخدمتكم",
  },
  en: {
    title: "About Us",
    about:
      "We are a comprehensive e-commerce platform serving both men and women with a wide variety of products at the best prices and top quality. Our vision is to become the perfect shopping destination where you can find everything you need easily and quickly.",
    teamTitle: "Our Team",
    team: "The Marketellaa team works hard to deliver the best shopping experience. We’re committed to high quality and excellent service—your comfort and satisfaction are always our top priority. Together, we strive to bring you the best!",
    socialsTitle: "Get in touch",
    facebook: "Facebook",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    phoneLabel: "Call us",
    shopNow: "Shop Now",
    brand: "Marketellaa",
    metaDesc:
      "Marketellaa — An e-commerce platform offering diverse products for men and women with great prices and quality, plus fast support via Facebook, Instagram, and WhatsApp.",
    scope: "We’re here for you 24/7",
  },
};

// ====== بيانات التواصل (ثابتة) ======
const SOCIALS = {
  facebook: "https://web.facebook.com/profile.php?id=61569051909885",
  instagram: "https://www.instagram.com/marketellaa/",
  // هنظبط رقم واتساب: لو بدأ بـ 0 هنضيف كود مصر +20 تلقائيًا
  whatsappRaw: "01044346476",
  phoneDisplay: "01044346476",
};

function toWhatsappHref(raw: string): string {
  const cleaned = raw.replace(/\D/g, ""); // ارقام بس
  const withCountry = cleaned.startsWith("0")
    ? `20${cleaned.slice(1)}`
    : cleaned; // +20 لمصر
  return `https://wa.me/${withCountry}`;
}

// ====== SEO Metadata (مُحلي حسب اللغة) ======
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const L = locale?.startsWith("ar") ? CONTENT.ar : CONTENT.en;
  return {
    title: `${L.title} • ${L.brand}`,
    description: L.metaDesc,
    openGraph: {
      title: `${L.title} • ${L.brand}`,
      description: L.metaDesc,
      type: "website",
      url: "/about",
      siteName: "Marketellaa",
    },
  };
}

export async function AboutPage() {
  const locale = await getLocale();
  const L = locale?.startsWith("ar") ? CONTENT.ar : CONTENT.en;
  const wa = toWhatsappHref(SOCIALS.whatsappRaw);

  return (
    <main className="min-h-[70vh]">
      {/* Content */}
      <section className="container mx-auto px-4 py-10 grid gap-6 md:grid-cols-3">
        {/* About card */}
        <Card className="md:col-span-2 border-green-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {L.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-7 text-muted-foreground">
            <p>{L.about}</p>
          </CardContent>
        </Card>

        {/* Team card */}
        <Card className="border-green-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              {L.teamTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="leading-7 text-muted-foreground">
            <p>{L.team}</p>
          </CardContent>
        </Card>

        {/* Socials / Contact */}
        <Card className="md:col-span-3 border-green-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {L.socialsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href={SOCIALS.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="group flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50 transition">
                  <div className="rounded-lg bg-green-600/10 p-2">
                    <Facebook className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{L.facebook}</div>
                    <div className="text-sm text-muted-foreground">
                      facebook.com
                    </div>
                  </div>
                </div>
              </Link>

              <Link
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="group flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50 transition">
                  <div className="rounded-lg bg-green-600/10 p-2">
                    <Instagram className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{L.instagram}</div>
                    <div className="text-sm text-muted-foreground">
                      instagram.com
                    </div>
                  </div>
                </div>
              </Link>

              <Link href={wa} target="_blank" rel="noopener noreferrer">
                <div className="group flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50 transition">
                  <div className="rounded-lg bg-green-600/10 p-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{L.whatsapp}</div>
                    <div className="text-sm text-muted-foreground">
                      {SOCIALS.phoneDisplay}
                    </div>
                  </div>
                </div>
              </Link>

              <a href={`tel:${SOCIALS.phoneDisplay}`} className="block">
                <div className="group flex items-center gap-3 rounded-xl border p-4 hover:border-green-400 hover:bg-green-50 transition">
                  <div className="rounded-lg bg-green-600/10 p-2">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{L.phoneLabel}</div>
                    <div className="text-sm text-muted-foreground">
                      {SOCIALS.phoneDisplay}
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/shop">
                <Button className="rounded-full">{L.shopNow}</Button>
              </Link>
              <Link href={wa} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {L.whatsapp}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* JSON-LD منظمة */}
      <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Marketellaa",
            url: "https://example.com", // عدّلها للدومين بتاعك
            sameAs: [
              SOCIALS.facebook,
              SOCIALS.instagram,
              toWhatsappHref(SOCIALS.whatsappRaw),
            ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer support",
                telephone: SOCIALS.phoneDisplay,
                areaServed: "EG",
                availableLanguage: ["ar", "en"],
              },
            ],
          }),
        }}
      />
    </main>
  );
}
