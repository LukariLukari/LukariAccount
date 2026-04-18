import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;
    
    // Simulate Stripe checkout session creation
    return NextResponse.json({ 
      success: true, 
      url: `/checkout/success?session_id=mock_session_${Date.now()}&product_id=${productId}`,
      message: "Checkout session created successfully"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
