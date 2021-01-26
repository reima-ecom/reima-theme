type Product = {
  handle: string
  title: string
}

type ProductNode = {
  handle: string;
  title: string;
  descriptionHtml: string;
  images: {
    edges: {
      node: ProductImageNode;
    }[];
  };
};

type ProductImageNode = {
  originalSrc: string;
}