export type ID = string;

export type Node = { id: ID };
export enum NodeType {
  Collection,
  Product,
}

export const getNodeType = (id: ID): NodeType => {
  const match = id.match(/gid:\/\/shopify\/(\w+)\/.*/);
  if (!match) throw new Error(`Could not get type from id ${id}`);
  return NodeType[match[1] as keyof typeof NodeType];
};

// filters

export const filterType = (type: NodeType) =>
  (obj: Node) => getNodeType(obj.id) === type;

export const filterPublished = (obj: { publishedOnCurrentPublication: boolean }) =>
  obj.publishedOnCurrentPublication;