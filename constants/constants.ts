import hero1 from "@/assets/corey-saldana-pIKQbdSzF_k-unsplash.jpg";
import hero2 from "@/assets/jon-ly-Xn7GvimQrk8-unsplash.jpg";
import hero3 from "@/assets/mike-von-2UTk-Nip5aM-unsplash.jpg";
import hero4 from "@/assets/ilya-mirnyy-FEQ5DMeB6Tc-unsplash.jpg";

export const headerData = [
  // { title: "Home", href: "/" },
  { title: "New Arrivals", href: "new-arrivals" },
  { title: "Tops & Shirts", href: "tops-shirts" },
  { title: "Kimonos & kaftans", href: "kimonos-kaftans" },
  // { title: "Sale", href: "/sale" },
];
export const mobileMenue = [
  // { title: "Home", href: "/" },
  {
    title: "New Arrivals",
    //  items: ["Women", "Men", "Kids"],
    href: "new-arrivals",
  },
  { title: "Tops & Shirts", href: "tops-shirts" },
  { title: "Kimonos & kaftans", href: "kimonos-kaftans" },
  { title: "Sets", href: "sets" },
  {
    title: "Bottoms",
    href: "bottoms",
  },
  { title: "Dresses", href: "dresses" },
  { title: "Sale", href: "sale" },
];

export const heroImages = [
  { src: hero1, alt: "hero1" },
  { src: hero2, alt: "hero2" },
  { src: hero3, alt: "hero3" },
  { src: hero4, alt: "hero4" },
];
export const heroData = [
  { button: "SHOP", title: "SS'25", desc: "Live now", variant: "center" },
  { button: "SHOP", title: "SHOP ALL" },
  { button: "SHOP", title: "BEST SELLER" },
  { button: "SHOP", title: "WINTER SALE" },
];

export enum Directions {
  RTL = "rtl",
  LTR = "ltr",
}

export enum Languages {
  ENGLISH = "en",
  ARABIC = "ar",
}

export enum Routes {
  ROOT = "/",
  MENU = "menu",
  ABOUT = "about",
  CONTACT = "contact",
  AUTH = "auth",
  CART = "cart",
  PROFILE = "profile",
  ADMIN = "admin",
}

export enum Pages {
  LOGIN = "signin",
  Register = "signup",
  FORGOT_PASSWORD = "forgot-password",
  CATEGORIES = "categories",
  MENU_ITEMS = "menu-items",
  USERS = "users",
  ORDERS = "orders",
  NEW = "new",
  EDIT = "edit",
}

export enum InputTypes {
  TEXT = "text",
  EMAIL = "email",
  PASSWORD = "password",
  NUMBER = "number",
  DATE = "date",
  TIME = "time",
  DATE_TIME_LOCAL = "datetime-local",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SELECT = "select",
  TEXTAREA = "textarea",
  FILE = "file",
  IMAGE = "image",
  COLOR = "color",
  RANGE = "range",
  TEL = "tel",
  URL = "url",
  SEARCH = "search",
  MONTH = "month",
  WEEK = "week",
  HIDDEN = "hidden",
  MULTI_SELECT = "multi select",
}

export enum Navigate {
  NEXT = "next",
  PREV = "prev",
}
export enum Responses {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum SortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  NAME = "name",
  EMAIL = "email",
  PHONE = "phone",
  STATUS = "status",
  START_DATE = "startDate",
  END_DATE = "endDate",
}

export enum AuthMessages {
  LOGIN_SUCCESS = "Login successfully",
  LOGOUT_SUCCESS = "Logout successfully",
  REGISTER_SUCCESS = "Register successfully",
  FORGET_PASSWORD_SUCCESS = "Forget password successfully",
  RESET_PASSWORD_SUCCESS = "Reset password successfully",
}

export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum Environments {
  PROD = "production",
  DEV = "development",
}
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
