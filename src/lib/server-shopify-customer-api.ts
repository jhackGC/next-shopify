import type { Customer } from "@/types/shopify";
import { GraphQLClient } from "graphql-request";
import { cookies } from "next/headers";

interface TokenReturn {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  errors: string[];
}

// Server-side Customer Account API client
const getCustomerAccountClient = async () => {
  const accessToken = (await cookies()).get("access_token")?.value;
  //   console.log("### Access To`ken:", accessToken?.substring(0, 6) + "...");
  const customerApiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL;
  if (!customerApiUrl) {
    throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_API_URL is not set");
  }
  return new GraphQLClient(customerApiUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`, // according to the docs, this does not need to be prefixed with "Bearer"
    },
  });
};

// Configuration for Customer Account API (server-side only)
const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;
// Extract shop ID from the API URL instead of the client ID
const apiUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL!;
const authoriseUrl =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_AUTHORIZATION_ENDPOINT || "";
const tokenUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_TOKEN_ENDPOINT || "";
const logoutUrl =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_LOGOUT_ENDPOINT || "";

// Get the app URL from environment, fallback to localhost for development
export const getAppUrl = ({ inAuthFlow }: { inAuthFlow: boolean }) => {
  const inDev = process.env.ENV === "dev";
  // If we are in dev and we are using the auth flows, we return the proxied app URL
  // Check if we have an explicit APP_URL set
  if (inDev && inAuthFlow) {
    return process.env.PROXIED_LOCALHOST_APP_URL || "N/A";
  }

  // Fallback to localhost for local development
  return process.env.APP_URL ? process.env.APP_URL : "http://localhost:3000";
};

// validate required environment variables
if (!clientId) {
  throw new Error(
    "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID environment variable is required"
  );
}
if (!apiUrl) {
  throw new Error(
    "SHOPIFY_CUSTOMER_ACCOUNT_API_URL environment variable is required"
  );
}
if (!tokenUrl) {
  throw new Error(
    "SHOPIFY_CUSTOMER_ACCOUNT_API_TOKEN_ENDPOINT environment variable is required"
  );
}
if (!logoutUrl) {
  throw new Error(
    "SHOPIFY_CUSTOMER_ACCOUNT_API_LOGOUT_ENDPOINT environment variable is required"
  );
}

export const SERVER_CUSTOMER_CONFIG = {
  clientId,
  clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET!, // Now we can use a secret!
  apiUrl,
  signInCallbackRedirectUri: `${getAppUrl({
    inAuthFlow: true,
  })}/api/auth/callback`,
  scopes: ["openid", "email", "customer-account-api:full"].join(" "),

  authUrls: {
    authorize: authoriseUrl,
    token: tokenUrl,
    logout: logoutUrl,
  },
} as const;

// Server-side authentication functions
export async function getCustomerFromSession(): Promise<Customer | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const customerAccountClient = await getCustomerAccountClient();

    const query = `
      query GetCustomer {
        customer {
          emailAddress {
            emailAddress
          }
        }
      }
    `;

    const response = await customerAccountClient.request<{
      customer: Customer;
    }>(query);

    return response.customer;
  } catch (error) {
    console.error("Error fetching customer:", error);

    // Try to get more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return null;
  }
}

// Exchange authorization code for access token (server-side)
// export async function exchangeCodeForToken(code: string) {
//   console.log("### Exchange Code for Token:", code);

//   try {
//     const body = new URLSearchParams({
//       grant_type: "authorization_code",
//       client_id: SERVER_CUSTOMER_CONFIG.clientId,
//       client_secret: SERVER_CUSTOMER_CONFIG.clientSecret,
//       code,
//       //   redirect_uri: SERVER_CUSTOMER_CONFIG.signInCallbackRedirectUri, // do we need this?
//     });

//     console.log("### Exchange Code for Token body:", body);

//     console.log("### Token URL:", SERVER_CUSTOMER_CONFIG.authUrls.token);

//     const tokenResponse = await fetch(SERVER_CUSTOMER_CONFIG.authUrls.token, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body,
//     });

//     console.log("### Token Response Status:", tokenResponse.status);

//     if (!tokenResponse.ok) {
//       const errorText = await tokenResponse.text();
//       console.log("### Token Error Response:", errorText);
//       throw new Error(
//         `Failed to exchange code for token: ${tokenResponse.status} - ${errorText}`
//       );
//     }

//     console.log("### Token Response OK");
//     const tokenData = await tokenResponse.json();
//     console.log("### Token Data:", tokenData);

//     return tokenData;
//   } catch (error) {
//     console.error("Error exchanging code for token:", error);
//     throw error;
//   }
// }

// Confidential Client
// see https://shopify.dev/docs/api/customer#authorization

/**
 * as of 03/08/2025 from the docs:
 *
 * Confidential client only
 *
 * Headers containing authorization credentials are required in order to get an access
 * token. Check out the Authorization header section for more details.
 *
 * If a response code of 301 is returned, ensure the correct shop_id is specified in
 * the POST request.
 *
 * If a response code of 400 with a message of invalid_grant is returned,
 * then ensure that padding is removed (for example, =) from your
 * base64-encoded code challenge in the Authorization step.
 * Additionally, make sure to replace “+” with “-” and “/” with “_”
 * to ensure compatibility with URL encoding.
 *
 * If a response code of 401 with a message of invalid_client is returned,
 * then verify that the client_id is correct.
 * If a response code of 401 with a message of invalid_token in the www-authenticate
 * header is returned, then ensure that an origin header is specified in the request.
 * Verify that the origin header specified is set in the list of Javascript Origin(s)
 * in the Customer Account API settings page.
 *
 * If a response code of 403 with a message of You do not have permission to access
 * this website is returned, then ensure that a user-agent header is specified in
 * the request.
 *
 * If all is ok.
 * With this access token, you can now make requests to the Customer Account API.
 *
 * @param code - The authorization code received from the authorization server.
 * @returns
 */
export async function exchangeCodeForToken(code: string): Promise<any> {
  const body = new URLSearchParams();

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing CLIENT ID");
  }
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("Missing CLIENT SECRET");
  }
  body.append("grant_type", "authorization_code");
  body.append("client_id", clientId);
  body.append(
    "redirect_uri",
    `https://polished-sponge-finally.ngrok-free.app/auth/signInReturn`
  );
  body.append("code", code);

  // Encode client credentials for Basic Auth for confidential clients like this one.
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${credentials}`, // Confidential Client
  };

  const getTokenURL = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_TOKEN_ENDPOINT;
  if (!getTokenURL) {
    throw new Error("Missing SHOPIFY_CUSTOMER_ACCOUNT_API_TOKEN_ENDPOINT");
  }
  const response = await fetch(getTokenURL, {
    method: "POST",
    headers: headers,
    body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Token response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("### getToken error");
    });

  return response as TokenReturn;
}

// Generate PKCE challenge (server-side)
// export async function generatePKCEChallenge() {
//   const codeVerifier = generateRandomString(128);
//   const codeChallenge = await base64URLEncode(await sha256(codeVerifier));

//   return {
//     codeVerifier,
//     codeChallenge,
//     codeChallengeMethod: "S256",
//   };
// }

// Helper functions
// function generateRandomString(length: number): string {
//   const charset =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     result += charset.charAt(Math.floor(Math.random() * charset.length));
//   }
//   return result;
// }

// async function sha256(plain: string): Promise<ArrayBuffer> {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(plain);
//   return await crypto.subtle.digest("SHA-256", data);
// }

// async function base64URLEncode(buffer: ArrayBuffer): Promise<string> {
//   const bytes = new Uint8Array(buffer);
//   let string = "";
//   bytes.forEach((byte) => (string += String.fromCharCode(byte)));
//   return btoa(string).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
// }

export function getLoginUrl() {
  // Build authorization URL (no PKCE needed for confidential clients)
  const authUrl = new URL(SERVER_CUSTOMER_CONFIG.authUrls.authorize);
  authUrl.searchParams.append("client_id", SERVER_CUSTOMER_CONFIG.clientId);
  authUrl.searchParams.append(
    "redirect_uri",
    SERVER_CUSTOMER_CONFIG.signInCallbackRedirectUri
  );
  authUrl.searchParams.append("scope", SERVER_CUSTOMER_CONFIG.scopes);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("state", "random_state_string"); // Use a secure random state in production
  authUrl.searchParams.append(
    "nonce",
    Math.random().toString(36).substring(2, 15) // Generate a random nonce
  );
  return authUrl.toString();
}

export async function getLogoutUrl(id_token: string) {
  console.log("### Getting Logout URL...");
  const logoutUrl = new URL(SERVER_CUSTOMER_CONFIG.authUrls.logout);
  const redirectUrl = `${getAppUrl({
    inAuthFlow: true,
  })}`; // return to home page

  // return built logout URL
  return `${logoutUrl}?id_token_hint=${id_token}&post_logout_redirect_uri=${redirectUrl}`;
}

export const cleanAllAuthCookies = async () => {
  console.log("### Cleaning all auth cookies...");
  const cookiesToClear = ["access_token", "id_token", "refresh_token"];
  for (const cookieName of cookiesToClear) {
    (await cookies()).set(cookieName, "", { maxAge: -1 });
    // (await cookies()).delete(cookieName);
  }
};

export async function setSecureCookie({
  cookieName,
  cookieValue,
  expirationTime = 300,
}: {
  cookieName: string;
  cookieValue: any;
  expirationTime?: number; // default to 5 minutes
}) {
  (await cookies()).set(cookieName, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: expirationTime,
    path: "/",
  });
}
