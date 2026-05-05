import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const codes = await prisma.resourceCode.findMany({
      include: {
        resource: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Fetch resource codes error:", error);
    return NextResponse.json({ error: "Failed to fetch codes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, resourceId, maxUses, expiresAt } = await req.json();

    if (!code || !resourceId) {
      return NextResponse.json({ error: "Code and Resource ID are required" }, { status: 400 });
    }

    const newCode = await prisma.resourceCode.create({
      data: {
        code: code.trim().toUpperCase(),
        resourceId,
        maxUses: parseInt(maxUses as string) || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(newCode);
  } catch (error: any) {
    console.error("Create resource code error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Mã này đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.resourceCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resource code error:", error);
    return NextResponse.json({ error: "Failed to delete code" }, { status: 500 });
  }
}
