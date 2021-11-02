import type {
  Searcher,
  SearchResultProduct,
  SearchResultTopHit,
} from "./search-domain.ts";

const productsDemo: SearchResultProduct[] = [
  {
    title: "Reflecting winter mittens Vilkku",
    price: 32.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/14_01_01.jpg",
  },
  {
    title: "Kids’ waterproof trousers Lammikko",
    price: 26.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/522233-2350.jpg",
  },
  {
    title: "Kids’ hooded raincoat Lampi",
    price: 34.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/02_01_01.jpg",
  },
  {
    title: "Kids’ Jacket Frebben",
    price: 109.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/03_02_01.jpg",
  },
  {
    title: "Kids’ fleece jacket Hopper",
    price: 109.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/526355-2850.jpg",
  },
  {
    title: "Kids’ winter shoes Freddo",
    price: 74.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/07_01_01.jpg",
  },
  {
    title: "Snowsuit Gotland",
    price: 129.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/08_01_01.jpg",
  },
  {
    title: "Reimatec Kiddo overall Kapelli",
    price: 89.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/520242A-2400.jpg",
  },
  {
    title: "Anti-Bite Pants Sillat",
    price: 59.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/532225-3880.jpg",
  },
  {
    title: "Xylitol Cool t-shirt Vauhdikas",
    price: 22.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/536545-9990.jpg",
  },
  {
    title: "Xylitol Cool shorts Ilmassa",
    price: 22.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/536543-7330.jpg",
  },
  {
    title: "Xylitol Cool jacket Harkat",
    price: 22.95,
    url: "/",
    imageUrl:
      "https://res.cloudinary.com/fantastic/image/upload/f_auto/c_scale,w_800/Reima/products/536548-4607.jpg",
  },
];
const topHitsDemo: SearchResultTopHit[] = [
  { title: "Kid's Jackets", url: "#" },
  { title: "Rain jackets", url: "#" },
  { title: "Winter Jackets", url: "#" },
  { title: "Fleece Jackets", url: "#" },
  { title: "Ski & Snowboard Jackets", url: "#" },
  { title: "Light Jackets", url: "#" },
];

export const search: Searcher = (query) => {
  if (!query) {
    return Promise.resolve({
      products: [],
      topHits: [],
    });
  }
  return Promise.resolve({
    products: productsDemo,
    topHits: topHitsDemo,
  });
};
