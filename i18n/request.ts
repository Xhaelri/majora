// i18n/request.ts - Add debugging
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  console.log("🌐 Request locale:", locale);
  console.log("🌐 Available locales:", routing.locales);

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as "en" | "ar")) {
    console.log("🌐 Invalid locale, using default:", routing.defaultLocale);
    locale = routing.defaultLocale;
  }

  console.log("🌐 Final locale:", locale);

  try {
    const messages = (await import(`@/translation/dictionaries/${locale}.json`))
      .default;
    console.log(
      "🌐 Messages loaded for locale:",
      locale,
      Object.keys(messages)
    );

    return {
      locale,
      messages,
      timeZone: "Africa/Cairo",
      now: new Date(),
    };
  } catch (error) {
    console.error("🌐 Error loading messages:", error);
    throw error;
  }
});
