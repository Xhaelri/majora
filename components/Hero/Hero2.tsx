import Image from "next/image";
import React from "react";
import { heroImages2 } from "@/constants/constants";
import Link from "next/link";
import { useTranslations } from 'next-intl';

const Hero2 = () => {
  const t = useTranslations('hero');
  
  return (
    <section className="flex flex-col">
      {/* First image with centered text - Optimized for LCP */}
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

          <h1 className="absolute inset-0 flex items-center justify-center text-white text-5xl md:text-7xl font-semibold mb-20 uppercase">
            {t('newNow')}
          </h1>
          <h1 className="absolute inset-0 flex items-center justify-center text-white text-sm md:text-xl font-semibold mt-10 md:mt-20 uppercase">
            {t('discoverMore')}
          </h1>
        </div>
      </Link>

      {/* Second row - Lazy load these images */}
      <div className="flex md:flex-row">
        <div className="relative w-full md:w-1/2">
          <Link href={"/categories/tops-shirts"}>
            <div className="aspect-[4/6] md:aspect-auto md:h-screen">
              <Image
                className="w-full h-full object-cover"
                src={heroImages2[1].src}
                alt={heroImages2[1].alt}
                width={500}
                height={500}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={80}
              />
            </div>
            <h1 className="absolute bottom-4 left-4 text-white text-md font-semibold">
              {t('tops')}
            </h1>
            <h1 className="absolute bottom-4 right-4 text-white hidden md:inline text-md font-semibold">
              {t('seeAll')}
            </h1>
          </Link>
        </div>

        <div className="relative w-full md:w-1/2">
          <Link href={"/categories/bottoms"}>
            <div className="aspect-[4/6] md:aspect-auto md:h-screen">
              <Image
                className="w-full h-full object-cover"
                src={heroImages2[2].src}
                alt={heroImages2[2].alt}
                width={500}
                height={500}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={80}
              />
            </div>
            <h1 className="absolute bottom-4 left-4 text-white text-md font-semibold">
              {t('bottoms')}
            </h1>
            <h1 className="absolute bottom-4 right-4 text-white hidden md:inline text-md font-semibold">
              {t('seeAll')}
            </h1>
          </Link>
        </div>
      </div>

      {/* Third row - Lazy load these images */}
      <div className="flex md:flex-row">
        <div className="relative w-full md:w-1/2">
          <Link href={"/categories/dresses"}>
            <div className="aspect-[4/6] md:aspect-auto md:h-screen">
              <Image
                className="w-full h-full object-cover"
                src={heroImages2[3].src}
                alt={heroImages2[3].alt}
                width={500}
                height={500}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={80}
              />
            </div>
            <h1 className="absolute bottom-4 left-4 text-white text-md font-semibold">
              {t('dresses')}
            </h1>
            <h1 className="absolute bottom-4 right-4 text-white hidden md:inline text-md font-semibold">
              {t('seeAll')}
            </h1>
          </Link>
        </div>

        <div className="relative w-full md:w-1/2">
          <Link href={"/categories/sets"}>
            <div className="aspect-[4/6] md:aspect-auto md:h-screen">
              <Image
                className="w-full h-full object-cover"
                src={heroImages2[4].src}
                alt={heroImages2[4].alt}
                width={500}
                height={500}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={80}
              />
            </div>
            <h1 className="absolute bottom-4 left-4 text-white text-md font-semibold">
              {t('sets')}
            </h1>
            <h1 className="absolute bottom-4 right-4 text-white hidden md:inline text-md font-semibold">
              {t('seeAll')}
            </h1>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero2;