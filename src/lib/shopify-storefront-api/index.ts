import { Connection } from "./types";

const apiHost = process.env.STOREFRONT_API_HOST;

const privateToken = process.env.STOREFRONT_PRIVATE_API_TOKEN;

// export const shopifyStoreFrontClient = createStorefrontApiClient({
//   storeDomain: apiHost,
//   apiVersion: "2025-01",
//   privateAccessToken: privateToken,
//   customFetchApi: fetch,
// });

// export const shopifyAdminClient = createAdminApiClient({
//   storeDomain: apiHost,
//   apiVersion: '2025-01',
//   accessToken: privateToken,
// });

export const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};
