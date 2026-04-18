import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, productId, licenseKey } = body;
    
    // Simulate sending an email via Resend / SendGrid
    console.log(`📧 Sending email to ${email} for product ${productId}`);
    console.log(`🔑 License Key: ${licenseKey}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      deliveredAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
