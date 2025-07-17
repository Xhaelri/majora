const hero1 = "https://res.cloudinary.com/dzdnady6n/image/upload/v1752776529/39A4817_f08c2cfe-ccd2-49ce-ba2e-d1f93e63ef11_1500x_sxraxn.webp";
const hero2 = "https://res.cloudinary.com/dzdnady6n/image/upload/v1752776557/mike-von-2UTk-Nip5aM-unsplash_prj869.webp";
const hero3 = "https://res.cloudinary.com/dzdnady6n/image/upload/v1752776532/xZikpVW1h3o1aOv4qxQ7vSvzQsY7g8qU82IFXqvb_llqqnh.webp";

export const headerData = [
  { title: "nav.newArrivals", href: "new-arrivals" },
  { title: "nav.topsShirts", href: "tops-shirts" },
  { title: "nav.kimonosKaftans", href: "kimonos-kaftans" },
];

export const mobileMenue = [
  { title: "nav.topsShirts", href: "tops-shirts" },
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
  // { src: hero4, alt: "hero4" },
];
export enum Environments {
  PROD = "production",
  DEV = "development",
}
