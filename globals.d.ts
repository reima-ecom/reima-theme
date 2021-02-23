interface Window {
  experiment?: string;
  site: {
    algolia?: {
      indexname: string;
      appid: string;
      apikey: string;
    };
    shopify: {
      store: string;
      token: string;
    };
    currency: string;
  };
  collection?: string;
  lazy: {
    [name: string]: string;
  };
  locale: string;
}
