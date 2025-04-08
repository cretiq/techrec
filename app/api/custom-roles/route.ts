import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all custom roles for the authenticated developer
export async function GET() {
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

    const customRoles = await prisma.customRole.findMany({
      where: { developerId: developer.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customRoles);
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom roles" },
      { status: 500 }
    );
  }
}

// POST create a new custom role
export async function POST(request: Request) {
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

    const body = await request.json();
    const { title, description, requirements, location, salary, type } = body;

    // Validate required fields
    if (!title || !description || !location || !salary || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const customRole = await prisma.customRole.create({
      data: {
        title,
        description,
        requirements: requirements || [],
        location,
        salary,
        type,
        developerId: developer.id,
      },
    });

    return NextResponse.json(customRole, { status: 201 });
  } catch (error) {
    console.error("Error creating custom role:", error);
    return NextResponse.json(
      { error: "Failed to create custom role" },
      { status: 500 }
    );
  }
} 