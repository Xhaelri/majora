// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { Meow_Script, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import CartProvider from "@/context/CartContext";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const corinthia = Meow_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-corinthia",
  display: "swap",
});
const notoSans = Noto_Sans_Arabic({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-notoSans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SEKRA | Women's Fashion & Clothing",
    template: "%s | SEKRA",
  },
  description:
    "Discover SEKRA's latest collection of women's clothing, featuring elegant dresses, stylish tops, kimonos, and more. Shop now for the best in fashion and exclusive deals!",
  keywords: [
    "women's clothing",
    "fashion",
    "dresses",
    "tops",
    "kimonos",
    "kaftans",
    "SEKRA",
    "online shopping",
    "women's fashion",
    "sale",
  ],
  openGraph: {
    title: "SEKRA | Women's Fashion & Clothing",
    description:
      "Explore SEKRA's curated collection of women's fashion. Shop dresses, tops, kimonos, and more with exclusive styles and seasonal sales.",
    url: "",
    siteName: "SEKRA",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "SEKRA Women's Fashion Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEKRA | Women's Fashion & Clothing",
    description:
      "Shop the latest women's fashion at SEKRA. Discover dresses, tops, kimonos, and exclusive deals!",
    images: [""],
  },
  alternates: {
    canonical: "",
    languages: {
      "en-US": "",
      ar: "",
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  console.log("📄 Layout locale:", locale);

  // Validate locale
  if (!routing.locales.includes(locale as "ar" | "en")) {
    console.log("📄 Invalid locale in layout, redirecting to 404");
    notFound();
  }

  // IMPORTANT: Set the request locale for static generation
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();
  console.log(
    "📄 Layout messages loaded for",
    locale,
    "- Keys:",
    Object.keys(messages).slice(0, 5)
  );

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${corinthia.variable} ${notoSans.variable} ${
          locale === "ar" ? "font-notoSans" : ""
        } antialiased light min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <CartProvider>
              <Header />
              <Toaster
                position="top-right"
                expand={false}
                offset={60}
                mobileOffset={60}
                duration={2000}
                invert
                theme="light"
              />
              <main className="flex-grow">{children}</main>
              <Footer />
            </CartProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
