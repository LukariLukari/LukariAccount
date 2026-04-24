import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("REGISTRATION_ERROR_DETAIL:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    // Return a more user friendly error if it's a known prisma error
    if (error.code === 'P2002') {
      return new NextResponse("Email này đã được sử dụng!", { status: 400 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
