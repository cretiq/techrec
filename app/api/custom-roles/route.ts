import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all custom roles for the authenticated developer
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      include: {
        customRoles: true,
      },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    return NextResponse.json(developer.customRoles);
  } catch (error) {
    console.error("Error fetching custom roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom roles" },
      { status: 500 }
    );
  }
}

// POST create a new custom role
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, requirements, location, salary, type, remote, visaSponsorship } = body;

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    const customRole = await prisma.customRole.create({
      data: {
        title,
        description,
        requirements,
        location,
        salary,
        type,
        remote,
        developerId: developer.id,
      },
    });

    return NextResponse.json(customRole);
  } catch (error) {
    console.error("Error creating custom role:", error);
    return NextResponse.json(
      { error: "Failed to create custom role" },
      { status: 500 }
    );
  }
} 