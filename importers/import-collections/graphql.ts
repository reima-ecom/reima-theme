export type GraphQLQuery = string;
export type GraphQLQueryable = <T>(graphQl: GraphQLQuery) => Promise<T>;

export const createAdminQueryable = (
  shopifyShop: string,
  shopifyBasicAuth: string,
): GraphQLQueryable =>
  async <T>(graphQl: string) => {
    const resp = await fetch(
      `https://${shopifyShop}.myshopify.com/admin/api/2020-01/graphql.json`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${shopifyBasicAuth}`,
        },
        method: "POST",
        body: JSON.stringify({ query: graphQl }),
      },
    );
    if (!resp.ok) throw new Error(`Could not query: ${resp.statusText}`);
    const { data, errors } = await resp.json();
    if (errors) {
      console.error(errors);
      throw new Error("Errors encountered - see above");
    }
    return data as T;
  };
