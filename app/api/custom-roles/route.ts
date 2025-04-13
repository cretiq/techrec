import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleType } from '@prisma/client';

// GET all custom roles for the authenticated developer
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    const customRoles = await prisma.customRole.findMany({
      where: { developerId: developer.id },
      orderBy: { createdAt: 'desc' }
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
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title || !body.description || !body.location || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const roleTypeValues = Object.values(RoleType);
    if (typeof body.type !== 'string' || !roleTypeValues.includes(body.type as RoleType)) {
      return NextResponse.json({ error: `Invalid role type. Must be one of: ${roleTypeValues.join(', ')}` }, { status: 400 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    if (body.originalRoleId) {
      const existing = await prisma.customRole.findUnique({
        where: {
          developerId_originalRoleId: {
            developerId: developer.id,
            originalRoleId: body.originalRoleId
          }
        },
        select: { id: true }
      });
      if (existing) {
        return NextResponse.json({ error: 'This role has already been saved.', id: existing.id }, { status: 409 });
      }
    }

    const customRole = await prisma.customRole.create({
      data: {
        developerId: developer.id,
        title: body.title,
        description: body.description,
        requirements: body.requirements || [],
        skills: body.skills || [],
        location: body.location,
        salary: body.salary,
        type: body.type as RoleType,
        remote: body.remote || false,
        visaSponsorship: body.visaSponsorship || false,
        companyName: body.companyName,
        url: body.url,
        originalRoleId: body.originalRoleId
      },
    });

    return NextResponse.json(customRole, { status: 201 });
  } catch (error) {
    console.error("Error creating custom role:", error);
    if (error instanceof Error && (error as any).code === 'P2002') {
      return NextResponse.json({ error: 'This role appears to be already saved.' }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to create custom role" },
      { status: 500 }
    );
  }
} 