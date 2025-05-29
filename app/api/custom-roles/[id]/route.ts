import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";

// GET a specific custom role
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customRole = await prisma.customRole.findUnique({
      where: { id: params.id },
    });

    if (!customRole) {
      return NextResponse.json({ error: "Custom role not found" }, { status: 404 });
    }

    return NextResponse.json(customRole);
  } catch (error) {
    console.error("Error fetching custom role:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom role" },
      { status: 500 }
    );
  }
}

// PUT update a custom role
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, requirements, location, salary, type, remote, visaSponsorship } = body;

    const customRole = await prisma.customRole.update({
      where: { id: params.id },
      data: {
        title,
        description,
        requirements,
        location,
        salary,
        type,
        remote,
      },
    });

    return NextResponse.json(customRole);
  } catch (error) {
    console.error("Error updating custom role:", error);
    return NextResponse.json(
      { error: "Failed to update custom role" },
      { status: 500 }
    );
  }
}

// DELETE a custom role
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.customRole.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Custom role deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom role:", error);
    return NextResponse.json(
      { error: "Failed to delete custom role" },
      { status: 500 }
    );
  }
} 