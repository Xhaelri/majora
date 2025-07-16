 
  import type { Metadata } from "next";
  import { getTranslations } from "next-intl/server";
  import { routing } from "@/i18n/routing";
import NotFoundPage from '../not-found';


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


export default function CatchAllPage() {
 return NotFoundPage();
}