"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === "ar";
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇪🇬" },
  ];

  //   const currentLanguage = languages.find(lang => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    startTransition(() => {
      const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
      router.push(`/${newLocale}${pathWithoutLocale}`);
    });

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`
          flex items-center  px-1 py-2   
           hover:bg-gray-50 transition-colors duration-200
          ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-1
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Image
          src={"/assets/globe-thin-svgrepo-com.svg"}
          alt="Search-icon"
          width={"20"}
          height={"10"}
          className=" hover:text-gray-700 hoverEffect"
        />

        <Image
          src={"/assets/chevron-down-svgrepo-com.svg"}
          alt="Search-icon"
          width={"20"}
          height={"10"}
          className={` text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className={`absolute top-full ${
              isRTL ? "-right-25" : "-left-25"
            } mt-1 w-42 bg-white border border-gray-200  shadow-lg z-20`}
          >
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-gray-300 
                    transition-colors duration-150 flex items-center gap-3
                    ${
                      locale === language.code
                        ? "bg-gray-50 text-gray-600 font-medium"
                        : "text-gray-700"
                    }
                  `}
                  disabled={isPending}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                  {locale === language.code && (
                    <span className="ml-auto text-gray-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
