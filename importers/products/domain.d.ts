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
  hasOnlyDefaultVariant?: boolean;
  variants: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: {
      node: VariantNode;
    }[];
  };
  images: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: {
      node: ProductImageNode;
    }[];
  };
  media: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: {
      node: ProductMediaNode;
    }[];
  };
};

type VariantNode = any;

type ProductImageNode = {
  originalSrc: string;
  altText: string;
};

type ProductMediaNode = {
  sources: ProductVideoNode[];
};

type ProductVideoNode = {
  mimeType: string;
  url: string;
};
