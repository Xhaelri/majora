  import type { Metadata } from "next";
  import { getTranslations } from "next-intl/server";
  import { routing } from "@/i18n/routing";

  // Generate static params for locales
  export async function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
  }

  // Generate metadata
  export async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "NotFound" });
    return {
      title: t("title") || "Page Not Found",
      description: t("description") || "The page you are looking for does not exist.",
    };
  }

  export default async function NotFound({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "NotFound" });

    return (
      <div className="flex flex-col items-center justify-center gap-6 container animate-in fade-in duration-700">
        <h1 className="text-5xl md:text-7xl font-corinthia text-primary">
          {t("heading") || "404 - Not Found"}
        </h1>
        <p className="text-lg font-notoSans text-muted-foreground max-w-md text-center">
          {t("message") || "This page does not exist."}
        </p>
        <a
          href={`/${locale}`}
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md radius-md hoverEffect hover:bg-primary/90"
        >
          {t("returnHome") || "Return to Home"}
        </a>
      </div>
    );
  }