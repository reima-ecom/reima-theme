import type {
  Searcher,
  SearchResultProduct,
  SearchResultTopHit,
} from "./search-domain.ts";

type LoopSearchRequest = {
  query: string;
};

/** https://docs.loop54.com/latest/api/docs.html#tag/User-initiated/paths/~1search/post */
type LoopSearchResponse = {
  makesSense: boolean;
  results: {
    count: number;
    items: LoopSearchResponseItem[];
  };
};

type LoopSearchResponseItem = {
  type: string;
  id: string;
  attributes: {
    name: string;
    type: string;
    values: string[];
  }[];
};

type LoopErrorResponse = {
  /** The HTTP status code of the response. */
  code: number;
  /** The HTTP status string of the response. */
  status: string;
  /** The name of the error. */
  title: string;
  /** The more detailed information about the error. Note: not always shown. */
  detail: string;
  /** The input parameter, if any, that caused the error. */
  parameter: string;
};

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

const loopItemToProduct = (
  item: LoopSearchResponseItem,
): SearchResultProduct => {
  const attributes = item.attributes.reduce(
    (obj, attr) => ({ ...obj, [attr.name]: attr.values[0] }),
    {} as Record<string, unknown>,
  );
  return {
    url: "#",
    title: attributes["Name"] as string,
    price: attributes["Price"] as number,
    imageUrl: attributes["ImageURL"] as string,
  };
};

export const createSearcher = (baseUrl: string): Searcher =>
  async (query) => {
    if (!query) {
      return {
        products: [],
        topHits: [],
      };
    } else if (query === "test") {
      return {
        products: productsDemo,
        topHits: topHitsDemo,
      };
    }

    const requestBody: LoopSearchRequest = { query };
    const searchResponse = await fetch(`${baseUrl}/search`, {
      method: "POST",
      headers: { "Api-Version": "V3", "User-Id": "Test" },
      body: JSON.stringify(requestBody),
    });

    if (!searchResponse.ok) {
      const error: LoopErrorResponse = await searchResponse.json();
      console.error(error);
      throw new Error(`Loop54 returned error ${error.code}: ${error.title}`);
    }

    const response: LoopSearchResponse = await searchResponse.json();

    const products: SearchResultProduct[] = response.results.items.map((item) =>
      loopItemToProduct(item)
    );
    const topHits: SearchResultTopHit[] = [];

    return { products, topHits };
  };
