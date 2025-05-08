import { NextResponse } from 'next/server';
import { processCoverLetterQueue } from '@/lib/workers/coverLetterWorker';

// This is a placeholder route to manually trigger the worker.
// In a production environment, this should be replaced with a secure mechanism 
// like a Cron Job, a webhook from a queue service, or an admin interface.

export async function GET(request: Request) {
// export async function POST(request: Request) { // Or POST if preferred
    console.log("Received request to trigger cover letter worker...");

    // Optional: Add authentication/authorization checks here 
    // to ensure only authorized users/systems can trigger the worker.
    // const session = await getServerSession(authOptions); // Example using NextAuth
    // if (!session || !isAdmin(session.user)) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    try {
        // Process a limited number of jobs per trigger to avoid timeouts
        const jobsProcessed = await processCoverLetterQueue(5); 
        
        console.log(`Worker processed ${jobsProcessed} jobs.`);
        return NextResponse.json({ 
            message: `Cover letter worker triggered successfully. Processed ${jobsProcessed} potential jobs.`, 
            jobsProcessed 
        });
    } catch (error) {
        console.error("Error triggering cover letter worker:", error);
        return NextResponse.json(
            { error: "Failed to trigger cover letter worker." },
            { status: 500 }
        );
    }
} 