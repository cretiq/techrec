import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET a specific custom role
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    const customRole = await prisma.customRole.findUnique({
      where: { id: params.id },
    });

    if (!customRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Ensure the developer owns this custom role
    if (customRole.developerId !== developer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    const existingRole = await prisma.customRole.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Ensure the developer owns this custom role
    if (existingRole.developerId !== developer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, requirements, location, salary, type } = body;

    // Validate required fields
    if (!title || !description || !location || !salary || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedRole = await prisma.customRole.update({
      where: { id: params.id },
      data: {
        title,
        description,
        requirements: requirements || [],
        location,
        salary,
        type,
      },
    });

    return NextResponse.json(updatedRole);
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    const existingRole = await prisma.customRole.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Ensure the developer owns this custom role
    if (existingRole.developerId !== developer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.customRole.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom role:", error);
    return NextResponse.json(
      { error: "Failed to delete custom role" },
      { status: 500 }
    );
  }
} 