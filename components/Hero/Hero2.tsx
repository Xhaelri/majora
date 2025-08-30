"use client"
import Image from "next/image";
import { heroImages2 } from "@/constants/constants";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const Hero2 = () => {
  const t = useTranslations("hero");

  // Skeleton Image Component
  const SkeletonImage = ({
    src,
    alt,
    href,
    label,
  }: {
    src: string;
    alt: string;
    href: string;
    label: string;
  }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const handleLoad = () => {
      setLoaded(true);
      setError(false);
    };

    const handleError = () => {
      setError(true);
      setLoaded(true); // Still set loaded to true to hide skeleton
    };

    return (
      <div className="relative w-full md:w-1/2">
        <Link href={href}>
          <div className="aspect-[4/6] md:aspect-auto md:h-screen relative overflow-hidden rounded-md">
            {/* Skeleton Loader */}
            {!loaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            )}
            
            {/* Error State */}
            {error ? (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm">Image failed to load</p>
                </div>
              </div>
            ) : (
              <Image
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                  loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
                src={src}
                alt={alt}
                width={500}
                height={500}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={80}
                onLoad={handleLoad}
                onError={handleError}
              />
            )}
            
            {/* Labels with fade-in effect */}
            <div className={`absolute bottom-4 left-4 transition-opacity duration-700 delay-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-white text-md font-semibold drop-shadow-lg">
                {label}
              </h1>
            </div>
            <div className={`absolute bottom-4 right-4 hidden md:inline transition-opacity duration-700 delay-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-white text-md font-semibold drop-shadow-lg">
                {t("seeAll")}
              </h1>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <section className="flex flex-col">
      {/* First image - keep as is */}
      <Link href={"/products"}>
        <div className="relative">
          <Image
            className="h-screen object-cover object-[-500px] md:object-center md:w-full"
            src={heroImages2[0].src}
            alt={heroImages2[0].alt}
            width={1920}
            height={1080}
            priority={true}
            loading="eager"
            sizes="(max-width: 768px) 100vw, 100vw"
            fetchPriority="high"
            quality={90}
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-white text-5xl md:text-7xl font-semibold mb-20 uppercase drop-shadow-lg">
            {t("newNow")}
          </h1>
          <h1 className="absolute inset-0 flex items-center justify-center text-white text-sm md:text-xl font-semibold mt-10 md:mt-20 uppercase drop-shadow-lg">
            {t("discoverMore")}
          </h1>
        </div>
      </Link>

      {/* Second row with Skeleton */}
      <div className="flex flex-col md:flex-row">
        <SkeletonImage
          src={heroImages2[1].src}
          alt={heroImages2[1].alt}
          href="/categories/tops-shirts"
          label={t("tops")}
        />
        <SkeletonImage
          src={heroImages2[2].src}
          alt={heroImages2[2].alt}
          href="/categories/bottoms"
          label={t("bottoms")}
        />
      </div>

      {/* Third row with Skeleton */}
      <div className="flex flex-col md:flex-row">
        <SkeletonImage
          src={heroImages2[3].src}
          alt={heroImages2[3].alt}
          href="/categories/dresses"
          label={t("dresses")}
        />
        <SkeletonImage
          src={heroImages2[4].src}
          alt={heroImages2[4].alt}
          href="/categories/sets"
          label={t("sets")}
        />
      </div>
    </section>
  );
};

export default Hero2;