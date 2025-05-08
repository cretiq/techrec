import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchRolesByIds } from '@/lib/roles'; // Assuming a function to fetch roles by IDs exists
import { Role } from '@/types'; // Assuming central Role type

// Define Zod schema for input validation
const batchRoleRequestSchema = z.object({
    roleIds: z.array(z.string().min(1)).min(1, { message: "At least one role ID is required." }),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validationResult = batchRoleRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const { roleIds } = validationResult.data;

        // --- Fetch role data --- 
        // Replace with your actual data fetching logic
        // This might involve querying your database (e.g., Prisma) 
        // or calling an external API based on the roleIds
        const roles: Role[] = await fetchRolesByIds(roleIds);

        if (!roles || roles.length === 0) {
            return NextResponse.json(
                { error: "No roles found for the provided IDs." },
                { status: 404 }
            );
        }

        // Ensure fetched roles match requested IDs (optional strict check)
        const fetchedIds = roles.map(r => r.id);
        const missingIds = roleIds.filter(id => !fetchedIds.includes(id));
        if (missingIds.length > 0) {
            console.warn(`Could not find role data for IDs: ${missingIds.join(', ')}`);
            // Decide if this should be an error or just return the found roles
        }

        return NextResponse.json(roles);

    } catch (error) {
        console.error("Error fetching batch role data:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching role data." },
            { status: 500 }
        );
    }
} 