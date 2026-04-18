import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate webhook handling (e.g., Stripe payment_intent.succeeded)
    console.log("🔔 Webhook received:", body);
    
    // In a real app, verify signature and update DB, then trigger email
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid webhook payload" }, { status: 400 });
  }
}
