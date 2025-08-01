import crypto from "crypto";

// Multipass authentication for password-protected stores
// This allows you to authenticate customers without needing OAuth
export class ShopifyMultipass {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  // Generate a multipass token for a customer
  generateToken(customerData: {
    email: string;
    first_name?: string;
    last_name?: string;
    return_to?: string;
  }): string {
    // Create the customer data JSON
    const customerJson = JSON.stringify({
      ...customerData,
      created_at: new Date().toISOString(),
    });

    // Encrypt the data
    const hash = crypto.createHash("sha256").update(this.secret).digest();
    const encryptionKey = hash.slice(0, 16);
    const signingKey = hash.slice(16, 32);

    // Initialize the IV with random bytes
    const iv = crypto.randomBytes(16);

    // Encrypt the customer data using AES-128-CBC
    const cipher = crypto.createCipheriv("aes-128-cbc", encryptionKey, iv);
    let encrypted = cipher.update(customerJson, "utf8", "binary");
    encrypted += cipher.final("binary");

    // Create the token by concatenating IV and encrypted data
    const token = iv.toString("binary") + encrypted;

    // Sign the token
    const signature = crypto
      .createHmac("sha256", signingKey)
      .update(token, "binary")
      .digest("binary");

    // Base64 encode the final token
    const multipassToken = Buffer.from(token + signature, "binary").toString(
      "base64"
    );

    return multipassToken;
  }

  // Generate the login URL for Shopify
  getLoginUrl(customerData: {
    email: string;
    first_name?: string;
    last_name?: string;
    return_to?: string;
  }): string {
    const token = this.generateToken(customerData);
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;

    return `https://${storeDomain}/account/login/multipass/${encodeURIComponent(
      token
    )}`;
  }
}

// Initialize the multipass instance
export const multipass = new ShopifyMultipass(
  process.env.SHOPIFY_MULTIPASS_SECRET!
);
