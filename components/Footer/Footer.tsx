"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  const date = new Date();

  return (
    <footer className="bg-primary flex flex-col items-center mt-10 z-50">
      <section className="container flex flex-col justify-center text-sm items-start md:items-center text-primary-foreground">
        <section className="flex space-x-10 items-center mt-5 md:items-center md:justify-center w-full mb-5">
          <h1>{t("socialMedia.instagram")}</h1>
          <h1>{t("socialMedia.facebook")}</h1>
          <h1>{t("socialMedia.tiktok")}</h1>
        </section>
        <section className="flex flex-col space-y-2 md:items-center">
          <h1>{t("legal.termsAndConditions")}</h1>
          <h1>{t("legal.privacyPolicy")}</h1>
        </section>
      </section>
      <section className="flex items-center justify-center mb-2 text-primary-foreground font-extralight text-[12px] mt-5">
        <span>&copy;</span> {date.getFullYear()} Majora {t("copyright")}
      </section>
    </footer>
  );
}
