# Authentication Architecture - Next.js Shopify Store

This document provides a comprehensive overview of the **server-side authentication system** implemented in this Next.js Shopify application, covering secure OAuth 2.0 flows, server architecture, and security best practices.

> 📝 **Migration Note**: This system has been migrated from client-side to server-side authentication for enhanced security. See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for details about the changes made.

## Table of Contents

1. [Overview](#overview)
2. [Server-Side Architecture](#server-side-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Core Components](#core-components)
5. [Security Implementation](#security-implementation)
6. [API Routes](#api-routes)
7. [State Management](#state-management)
8. [Configuration](#configuration)
9. [Best Practices](#best-practices)

## Overview

The authentication system implements **secure server-side authentication** using Shopify's Customer Account API with **OAuth 2.0 and PKCE (Proof Key for Code Exchange)**. All sensitive authentication logic is handled on the server, with the client only interacting through secure API endpoints.

### Key Features

- 🔐 **Server-Side Authentication** - All customer API interactions happen on the server
- 🛡️ **OAuth 2.0 with PKCE** - Industry-standard secure authentication flow
- 🍪 **Secure HTTP-Only Cookies** - Tokens never exposed to client-side JavaScript
- 🔄 **Automatic Session Management** - Server handles token validation and renewal
- 📱 **Cross-Platform Support** - Works on web, mobile, and tablet devices
- 🎯 **Context-Based State Management** - Client context communicates only with server
- 🔒 **Zero Client-Side Secrets** - No sensitive credentials exposed to the browser

## Server-Side Architecture

### 1. Server-Only Customer API

All Shopify Customer Account API interactions are handled server-side in `/src/lib/server-customer-api.ts`:

```typescript
// Configuration for Customer Account API (server-side only)
export const SERVER_CUSTOMER_CONFIG = {
  clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!,
  clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET!, // Secret is safe on server
  apiUrl: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,

  scopes: [
    "openid",
    "email",
    "profile",
    "customer-account-api:read",
    "customer-account-api:write",
  ].join(" "),
};
```

### 2. Secure Token Handling

All customer tokens are stored in secure HTTP-only cookies that cannot be accessed by client-side JavaScript:

```typescript
export async function getCustomerFromSession(): Promise<Customer | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("shopify_customer_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const authenticatedClient = new GraphQLClient(
      SERVER_CUSTOMER_CONFIG.apiUrl,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response = await authenticatedClient.request<{ customer: Customer }>(
      query
    );
    return response.customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}
```

### 3. PKCE Implementation

Proof Key for Code Exchange (PKCE) is implemented server-side for maximum security:

````typescript
export async function generatePKCEChallenge() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await base64URLEncode(await sha256(codeVerifier));

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}
## Authentication Flow

### Complete Server-Side OAuth 2.0 PKCE Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant Shopify

    User->>Client: Click "Login"
    Client->>Server: POST /api/auth/login
    Server->>Server: Generate PKCE parameters
    Note over Server: code_verifier, code_challenge, state, nonce
    Server->>Server: Store PKCE params in session
    Server->>Client: Return authorization URL
    Client->>Shopify: Redirect to authorization URL
    Note over Shopify: /oauth/authorize?client_id=...&code_challenge=...
    User->>Shopify: Complete authentication
    Shopify->>Server: Redirect to callback with code
    Note over Server: /api/auth/callback?code=...&state=...
    Server->>Server: Verify state parameter
    Server->>Shopify: Exchange code for access token
    Note over Server: POST /oauth/token with code_verifier
    Shopify->>Server: Return access token
    Server->>Server: Store token in HTTP-only cookie
    Server->>Client: Redirect to application
    Client->>Server: GET /api/auth/me
    Server->>Shopify: Fetch customer data with token
    Shopify->>Server: Return customer profile
    Server->>Client: Return customer data
    Client->>Client: Update authentication state
````

### Detailed Step-by-Step Process

#### 1. **Initiate Authentication (Server-Side)**

```typescript
// /api/auth/login route
async function login() {
  // Generate PKCE parameters on server
  const { codeVerifier, codeChallenge } = await generatePKCEChallenge();
  const state = generateRandomString(32);
  const nonce = generateRandomString(32);

  // Store parameters securely
  this.storePKCEParams(codeVerifier, state, nonce);

  // Store PKCE params in secure session storage
  // Build authorization URL and redirect
  const authUrl = `${SERVER_CUSTOMER_CONFIG.authUrls.authorize}?${authParams}`;
  return { authUrl };
}
```

#### 2. **Handle Callback (Server-Side)**

```typescript
// /api/auth/callback route
async function handleCallback(code: string, state: string): Promise<void> {
  // Verify state parameter (CSRF protection)
  const storedState = getStoredState();
  if (state !== storedState) {
    throw new Error("Invalid state parameter");
  }

  // Exchange authorization code for access token
  const tokenResponse = await exchangeCodeForToken(code, storedCodeVerifier);

  // Store token in secure HTTP-only cookie
  cookies().set("shopify_customer_token", tokenResponse.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokenResponse.expires_in,
  });

  // Redirect to application
  redirect("/");
}
```

#### 3. **Token Exchange (Server-Side)**

```typescript
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const response = await fetch(SERVER_CUSTOMER_CONFIG.authUrls.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: SERVER_CUSTOMER_CONFIG.clientId,
      client_secret: SERVER_CUSTOMER_CONFIG.clientSecret, // Secret only on server
      code,
      redirect_uri: SERVER_CUSTOMER_CONFIG.redirectUri,
      code_verifier: codeVerifier, // PKCE verification
    }),
  });

  return response.json();
}
```

## API Routes

The authentication system is built around secure Next.js API routes that handle all server-side authentication logic:

### 1. **Login Route** (`/api/auth/login`)

Initiates the OAuth 2.0 PKCE flow by generating secure parameters and redirecting to Shopify.

```typescript
export async function POST() {
  try {
    // Generate PKCE challenge on server
    const { codeVerifier, codeChallenge } = await generatePKCEChallenge();
    const state = generateRandomString(32);

    // Store PKCE parameters securely in session
    // Build and return authorization URL
    const authUrl = `${SERVER_CUSTOMER_CONFIG.authUrls.authorize}?${params}`;

    return Response.json({ authUrl });
  } catch (error) {
    return Response.json(
      { error: "Failed to initiate login" },
      { status: 500 }
    );
  }
}
```

### 2. **Callback Route** (`/api/auth/callback`)

Handles the OAuth callback, exchanges the authorization code for an access token, and sets secure cookies.

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  try {
    // Verify state (CSRF protection)
    // Exchange code for token using PKCE
    const tokenData = await exchangeCodeForToken(code, storedCodeVerifier);

    // Set secure HTTP-only cookie
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("shopify_customer_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
    });

    return response;
  } catch (error) {
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
```

### 3. **Customer Info Route** (`/api/auth/me`)

Returns the current authenticated customer's information by validating the token server-side.

```typescript
export async function GET() {
  try {
    const customer = await getCustomerFromSession();

    if (!customer) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    return Response.json({ customer });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}
```

### 4. **Logout Route** (`/api/auth/logout`)

Clears the authentication cookie and terminates the session.

```typescript
export async function POST() {
  try {
    const response = Response.json({ success: true });
    response.cookies.delete("shopify_customer_token");
    return response;
  } catch (error) {
    return Response.json({ error: "Failed to logout" }, { status: 500 });
  }
}
```

## Core Components

### 1. **Server Customer API** (`/src/lib/server-customer-api.ts`)

The core server-side service that handles all Shopify Customer Account API interactions.

**Responsibilities:**

- OAuth 2.0 PKCE flow implementation
- Token exchange and validation
- Customer data fetching with authenticated requests
- Security parameter generation
- Secure session management

**Key Functions:**

- `generatePKCEChallenge()` - Creates PKCE parameters
- `exchangeCodeForToken()` - Exchanges authorization code for access token
- `getCustomerFromSession()` - Fetches customer data using stored token

### 2. **Server Auth Context** (`/src/contexts/ServerAuthContext.tsx`)

React Context that provides authentication state and communicates only with server API routes.

**Features:**

- Client-side state management
- Server communication via fetch
- No direct Shopify API calls
- Automatic session validation

### 3. **Updated Auth Modal** (`/src/components/auth/AuthModal.tsx`)

User interface that redirects to Shopify for OAuth authentication.

**Features:**

- Simple OAuth redirect flow
- Loading states during redirect
- No email input required (handled by Shopify)
- Accessibility compliance

### 4. **Header Integration** (`/src/components/layout/Header.tsx`)

Authentication status display and user menu integration.

**Features:**

- Authentication status indicator
- User dropdown menu
- Login/logout actions
- Server-side state synchronization

## Security Implementation

### 1. **Server-Side PKCE (Proof Key for Code Exchange)**

PKCE is implemented entirely on the server to prevent authorization code interception attacks.

```typescript
export async function generatePKCEChallenge() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await base64URLEncode(await sha256(codeVerifier));

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}
```

### 2. **State Parameter Protection**

Server-side state validation prevents CSRF attacks.

```typescript
// Generate and store state in server session
const state = generateRandomString(32);
session.set("oauth_state", state);

// Verify on callback
const storedState = session.get("oauth_state");
if (state !== storedState) {
  throw new Error("Invalid state parameter");
}
```

### 3. **Secure HTTP-Only Cookie Storage**

Tokens are stored in HTTP-only cookies that cannot be accessed by client-side JavaScript.

```typescript
response.cookies.set("shopify_customer_token", accessToken, {
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  maxAge: expiresIn, // Automatic expiration
});
```

### 4. **Zero Client-Side Secrets**

No sensitive authentication credentials are ever exposed to the client.

```typescript
// ❌ OLD: Client had access to secret (dangerous)
const clientSecret = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_SECRET;

// ✅ NEW: Secret only exists on server (secure)
const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET;
```

### 5. **Automatic Token Validation**

Server-side token validation for every authenticated request.

```typescript
export async function getCustomerFromSession(): Promise<Customer | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("shopify_customer_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    // Validate token by making authenticated request
    const response = await authenticatedClient.request<{ customer: Customer }>(
      query
    );
    return response.customer;
  } catch (error) {
    // Token is invalid, return null to trigger re-authentication
    return null;
  }
}
```

## State Management

### Client-Side Authentication State

The client maintains minimal authentication state and communicates only with server API routes:

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  customer: Customer | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}
```

### Server Communication Pattern

All authentication operations go through server API routes:

```typescript
// Client-side context implementation
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    customer: null,
    isLoading: true,
  });

  const login = async () => {
    const response = await fetch("/api/auth/login", { method: "POST" });
    const { authUrl } = await response.json();
    window.location.href = authUrl; // Redirect to Shopify
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ isAuthenticated: false, customer: null, isLoading: false });
  };

  const refreshCustomer = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const { customer } = await response.json();
        setState({ isAuthenticated: true, customer, isLoading: false });
      } else {
        setState({ isAuthenticated: false, customer: null, isLoading: false });
      }
    } catch (error) {
      setState({ isAuthenticated: false, customer: null, isLoading: false });
    }
  };
}
```

### State Flow Diagram

```
App Load
    ↓
Client: isLoading = true
    ↓
Client: fetch('/api/auth/me')
    ↓
Server: Check HTTP-only cookie
    ↓
Valid Token? ─── No ──→ isAuthenticated: false
    ↓                    isLoading: false
   Yes
    ↓
Server: Validate with Shopify
    ↓
Valid? ─── No ──→ Clear Cookie & Return 401
    ↓              Client: isAuthenticated = false
   Yes
    ↓
Server: Return Customer Data
    ↓
Client: isAuthenticated = true
        customer = Customer
        isLoading = false
```

### Reactive Updates

Components automatically re-render when authentication state changes through the React Context:

```typescript
// In components
const { isAuthenticated, customer, isLoading } = useAuth();

// State updates propagate immediately
useEffect(() => {
  if (isAuthenticated && customer) {
    // User is logged in with customer data
  }
}, [isAuthenticated, customer]);
```

## Configuration

### Environment Variables

#### Server-Only Variables (Secure)

These variables contain sensitive information and are only accessible on the server:

```env
# Shopify Store Configuration (Server)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN=your_private_storefront_token

# Customer Account API (Server-Only)
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_xxxxx
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=your_secret_key
SHOPIFY_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/xxxxx/account/customer/api/unstable/graphql

# Security
NEXT_AUTH_SECRET=your_secure_random_string_for_jwt_signing
```

#### Client-Exposed Variables (Public Identifiers)

These variables are safe to expose to the client as they contain only public identifiers:

```env
# Application Configuration (Client-Safe)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: All Shopify credentials are now server-side only for enhanced security.

### Shopify Partner Dashboard Configuration

To enable the Customer Account API, configure these settings in your Shopify Partners Dashboard:

1. **App Setup**

   - Enable "Customer Account API" in app capabilities
   - Set API version to "unstable" or latest stable version

2. **OAuth Configuration**

   - Add redirect URI: `${NEXT_PUBLIC_APP_URL}/api/auth/callback`
   - Set scopes: `openid`, `email`, `profile`, `customer-account-api:read`, `customer-account-api:write`

3. **Security Settings**
   - Enable PKCE (automatically enabled for Customer Account API)
   - Set token expiration as desired (default: 24 hours)

## Best Practices

### 1. **Security First**

- ✅ All sensitive credentials are server-only
- ✅ Tokens stored in HTTP-only cookies
- ✅ PKCE implementation for OAuth security
- ✅ State parameter validation for CSRF protection
- ✅ Server-side token validation on every request

### 2. **Error Handling**

```typescript
// Graceful error handling in API routes
export async function GET() {
  try {
    const customer = await getCustomerFromSession();
    return Response.json({ customer });
  } catch (error) {
    console.error("Auth error:", error);
    return Response.json({ error: "Authentication failed" }, { status: 401 });
  }
}
```

### 3. **Performance Optimization**

- ✅ Minimal client-side state
- ✅ Server-side session validation
- ✅ Automatic token cleanup
- ✅ Efficient React Context usage

### 4. **Development vs Production**

```typescript
// Environment-aware security settings
const isProduction = process.env.NODE_ENV === "production";

response.cookies.set("shopify_customer_token", token, {
  httpOnly: true,
  secure: isProduction, // HTTPS only in production
  sameSite: "lax",
  domain: isProduction ? ".yourdomain.com" : undefined,
});
```

### 5. **Testing Strategy**

- **Unit Tests**: Test authentication utility functions
- **Integration Tests**: Test API routes with mock tokens
- **E2E Tests**: Test full OAuth flow with test credentials
- **Security Tests**: Validate CSRF and token security

### 6. **Monitoring and Logging**

```typescript
// Comprehensive logging for debugging
console.log("Auth attempt:", {
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get("user-agent"),
  ip: request.ip,
});
```

---

## Migration from Client-Side Authentication

If migrating from a client-side authentication system:

1. **Move secrets to server environment variables**
2. **Create Next.js API routes for all auth operations**
3. **Update client context to use server API routes**
4. **Remove all client-side Shopify Customer API calls**
5. **Test the full OAuth flow with real credentials**

This server-side architecture provides enhanced security while maintaining a seamless user experience.
}

````

### 3. **Customer Data Query**

```graphql
query GetCustomer {
  customer {
    id
    firstName
    lastName
    email
    phone
    emailMarketingConsent {
      marketingState
      marketingOptInLevel
    }
    smsMarketingConsent {
      marketingState
      marketingOptInLevel
    }
    addresses(first: 10) {
      edges {
        node {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          country
          province
          zip
          phone
        }
      }
    }
  }
}
````

## Error Handling

### 1. **Error Types and Handling**

```typescript
// Network errors
catch (error) {
  if (error instanceof TypeError) {
    throw new Error('Network error - please check your connection');
  }
}

// Shopify API errors
function handleShopifyError(error: any): string {
  if (error?.response?.errors) {
    return error.response.errors.map(e => e.message).join(', ');
  }
  return error.message || 'An unexpected error occurred';
}

// Authentication errors
if (response.status === 401) {
  await this.logout(); // Clear invalid session
  throw new Error('Authentication expired');
}
```

### 2. **Error Recovery Strategies**

- **Token Expiration:** Automatic logout and state cleanup
- **Network Failures:** User-friendly error messages with retry options
- **Invalid State:** CSRF attack prevention with error logging
- **API Errors:** Graceful degradation with fallback behaviors

### 3. **Error State Management**

```typescript
this.updateAuthState({
  error: errorMessage,
  isLoading: false,
  isAuthenticated: false,
});
```

## Configuration

---

**Note:** This completes the server-side authentication documentation. The environment variables and configuration are already documented in the [Configuration](#configuration) section above.

## Best Practices

### 1. **Security Best Practices**

- ✅ Use PKCE for all OAuth flows
- ✅ Validate state parameters to prevent CSRF
- ✅ Store tokens in secure cookies with proper flags
- ✅ Implement automatic token expiration handling
- ✅ Use HTTPS in production
- ✅ Sanitize and validate all user inputs

### 2. **Performance Optimizations**

- ✅ Server-side authentication processing
- ✅ HTTP-only cookie management
- ✅ Efficient React Context usage
- ✅ Minimal client-side state
- ✅ Automatic session validation

### 3. **User Experience**

- ✅ Clear loading states during authentication
- ✅ Informative error messages
- ✅ Automatic redirects after authentication
- ✅ Persistent login sessions
- ✅ Graceful handling of expired sessions

### 4. **Development Practices**

- ✅ Comprehensive TypeScript typing
- ✅ Proper error boundaries
- ✅ Extensive error logging
- ✅ Unit tests for critical flows
- ✅ Integration tests for OAuth flow

### 5. **Monitoring and Debugging**

- ✅ Console logging for development
- ✅ Error tracking for production
- ✅ Performance monitoring
- ✅ Authentication flow analytics
- ✅ Security event logging

## Testing Strategy

### Unit Tests

- PKCE parameter generation
- Token storage and retrieval
- State management functions
- Error handling logic

### Integration Tests

- Complete OAuth flow
- Token refresh scenarios
- Error recovery flows
- Cross-browser compatibility

### E2E Tests

- Full authentication journey
- Session persistence
- Mobile responsiveness
- Accessibility compliance

## Deployment Considerations

### Production Checklist

- [ ] Configure HTTPS redirect
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Set up error monitoring
- [ ] Configure rate limiting
- [ ] Implement session monitoring
- [ ] Set up backup authentication methods
- [ ] Configure security headers

### Shopify Store Configuration

1. **Enable Customer Account API**
2. **Configure OAuth Application**
3. **Set Redirect URLs**
4. **Configure Scopes**
5. **Test Authentication Flow**

This authentication system provides a robust, secure, and user-friendly foundation for customer authentication in your Shopify application, following industry best practices and modern security standards.
