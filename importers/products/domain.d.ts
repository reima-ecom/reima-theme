type Product = {
  handle: string;
  title: string;
};

type ProductNode = {
  handle: string;
  title: string;
  descriptionHtml: string;
  collections: {
    edges: {
      node: {
        handle: string;
      };
    }[];
  };
  variants: {
    pageInfo: {
      hasNextPage: boolean;
    };
  };
  images: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: {
      node: ProductImageNode;
    }[];
  };
};

type ProductImageNode = {
  originalSrc: string;
};
