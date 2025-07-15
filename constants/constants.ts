import hero1 from "@/public/assets/corey-saldana-pIKQbdSzF_k-unsplash.jpg";
import hero2 from "@/public/assets/jon-ly-Xn7GvimQrk8-unsplash.jpg";
import hero3 from "@/public/assets/mike-von-2UTk-Nip5aM-unsplash.jpg";
import hero4 from "@/public/assets/jon-ly-Xn7GvimQrk8-unsplash.jpg";

export const headerData = [
  { title: "nav.newArrivals", href: "new-arrivals" },
  { title: "nav.topsShirts", href: "tops-shirts" },
  { title: "nav.kimonosKaftans", href: "kimonos-kaftans" },
];

export const mobileMenue = [
  { title: "nav.newArrivals", href: "new-arrivals" },
  { title: "nav.topsShirts", href: "tops-shirts" },
  { title: "nav.kimonosKaftans", href: "kimonos-kaftans" },
  { title: "nav.sets", href: "sets" },
  { title: "nav.bottoms", href: "bottoms" },
  { title: "nav.dresses", href: "dresses" },
  { title: "nav.sale", href: "sale" },
];
export const Menu = [{ title: "menu" }];

export const heroData = [
  {
    button: "common.shop",
    title: "hero.ss25",
    desc: "hero.liveNow",
    variant: "center",
  },
  { button: "common.shop", title: "hero.shopAll" },
  { button: "common.shop", title: "hero.bestSeller" },
  { button: "common.shop", title: "hero.winterSale" },
];

export const heroImages = [
  { src: hero1, alt: "hero1" },
  { src: hero2, alt: "hero2" },
  { src: hero3, alt: "hero3" },
  { src: hero4, alt: "hero4" },
];
export enum Environments {
  PROD = "production",
  DEV = "development",
}
