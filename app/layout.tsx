import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/home/header/Header";
import { Footer } from "@/components/home/footer/Footer";
import { Toaster } from "sonner";

const cairo = Cairo({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Braven - store",
  description: "Ecommerce website for fashion and apparel",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${cairo.className}`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
