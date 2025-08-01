import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Webhook handler for Shopify order events
export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    const body = await request.text();
    const hmac = request.headers.get("x-shopify-hmac-sha256");

    if (!verifyWebhook(body, hmac)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderData = JSON.parse(body);

    // Process the order and sync with external user
    await processOrderWebhook(orderData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function verifyWebhook(body: string, hmac: string | null): boolean {
  if (!hmac) return false;

  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET!;
  const calculated = crypto
    .createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmac));
}

async function processOrderWebhook(order: any) {
  // Extract customer email
  const customerEmail = order.email || order.customer?.email;

  if (!customerEmail) {
    console.log("No customer email in order:", order.id);
    return;
  }

  // Find your external user by email
  const externalUser = await findExternalUserByEmail(customerEmail);

  if (externalUser) {
    // Update user's order history
    await updateUserOrderHistory(externalUser.id, {
      shopifyOrderId: order.id,
      orderNumber: order.name,
      totalPrice: order.total_price,
      currency: order.currency,
      processedAt: order.processed_at,
      items: order.line_items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    console.log("Order synced for user:", externalUser.id, order.id);
  }
}

async function findExternalUserByEmail(email: string) {
  // Query your user database/auth provider
  // This depends on your auth system (Auth0, Firebase, etc.)

  // Example with Auth0 Management API
  /*
  const users = await auth0Management.getUsersByEmail(email);
  return users[0] || null;
  */

  // Mock for example
  return { id: "ext_user_123", email };
}

async function updateUserOrderHistory(userId: string, orderData: any) {
  // Store order in your database linked to external user
  /*
  await prisma.userOrder.create({
    data: {
      externalUserId: userId,
      shopifyOrderId: orderData.shopifyOrderId,
      orderNumber: orderData.orderNumber,
      totalPrice: orderData.totalPrice,
      currency: orderData.currency,
      processedAt: new Date(orderData.processedAt),
      items: {
        create: orderData.items
      }
    }
  });
  */

  console.log("Would store order for user:", userId, orderData);
}
