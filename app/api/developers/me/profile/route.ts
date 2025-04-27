import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
// Import the Zod schema and related types
import { ProfileUpdateSchema } from '@/types/types' // Adjust path if necessary
import { z } from 'zod'

// Define a more complete interface reflecting the InternalProfile structure
// Or import InternalProfile from '@/types/types' if appropriate
interface DeveloperProfile {
  _id: ObjectId
  email: string
  profileEmail?: string | null
  name: string
  title?: string | null
  about?: string | null
  contactInfo?: any | null // Adjust type as needed, e.g., InternalContactInfo
  skills?: any[] // Adjust types as needed
  experience?: any[]
  education?: any[]
  achievements?: any[]
  projects?: any[] // Keep projects if needed here, or remove if handled elsewhere
  assessments?: any[] // Keep assessments if needed here, or remove if handled elsewhere
  applications?: any[] // Keep applications if needed here, or remove if handled elsewhere
  savedRoles?: any[] // Keep savedRoles if needed here, or remove if handled elsewhere
  customRoles?: any[]
  createdAt: Date
  updatedAt: Date
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    
    // Fetch using the more complete projection
    let developer: DeveloperProfile | null = await db.collection('developers').findOne(
      { email: session.user.email },
      {
        projection: {
          _id: 1,
          email: 1,
          profileEmail: 1,
          name: 1,
          title: 1,
          about: 1, // Include about
          contactInfo: 1, // Include contactInfo
          skills: 1,
          experience: 1,
          education: 1,
          achievements: 1, // Include achievements
          // Decide if projects, assessments, applications, savedRoles are needed here
          // projects: 1, 
          // assessments: 1, 
          // applications: 1, 
          // savedRoles: 1,
          customRoles: 1, // Include customRoles
          createdAt: 1,
          updatedAt: 1
        }
      }
    ) as DeveloperProfile | null
    
    if (!developer) {
      // Create a default profile for new users
      // Ensure the default object includes the new fields (or null/empty defaults)
      const defaultData = {
        email: session.user.email,
        profileEmail: session.user.email,
        name: session.user.name || 'New Developer',
        title: 'Software Developer', // Default title
        about: '',
        contactInfo: null, // Default null
        skills: [],
        experience: [],
        education: [],
        achievements: [], // Default empty array
        // projects: [],
        // assessments: [],
        // applications: [],
        // savedRoles: [],
        customRoles: [], // Default empty array
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('developers').insertOne(defaultData);
      
      // Fetch the newly created developer with the full projection
      const newDeveloper = await db.collection('developers').findOne(
        { _id: result.insertedId },
        {
          projection: { // Use the same full projection
            _id: 1,
            email: 1,
            profileEmail: 1,
            name: 1,
            title: 1,
            about: 1, 
            contactInfo: 1, 
            skills: 1,
            experience: 1,
            education: 1,
            achievements: 1,
            // projects: 1, 
            // assessments: 1, 
            // applications: 1, 
            // savedRoles: 1,
            customRoles: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ) as DeveloperProfile | null
      
      if (!newDeveloper) {
        throw new Error('Failed to create new developer profile')
      }
      
      developer = newDeveloper
    }
    
    // At this point, developer cannot be null
    const finalDeveloper = developer!
    
    // Convert ObjectId to string for the response
    return NextResponse.json({
      ...finalDeveloper,
      _id: finalDeveloper._id.toString()
    })
  } catch (error) {
    console.error('Error in GET /api/developers/me/profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawData = await request.json()

    // --- Zod Validation --- 
    const validationResult = ProfileUpdateSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error("Profile update validation failed:", validationResult.error.errors);
      // Consider returning more specific error details
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    const validatedData = validationResult.data;
    // --- End Zod Validation ---

    // Validate required fields (redundant if schema enforces, but kept for clarity/safety)
    // if (!validatedData.name || !validatedData.title) { 
    //   return NextResponse.json(
    //     { error: 'Name and title are required' }, // Adjust error based on schema
    //     { status: 400 }
    //   )
    // }

    const client = await clientPromise
    const db = client.db()
    
    const userEmail = session.user.email;
    
    // Define the full projection once
    const fullProjection = {
        _id: 1,
        email: 1,
        profileEmail: 1,
        name: 1,
        title: 1,
        about: 1, 
        contactInfo: 1, 
        skills: 1,
        experience: 1,
        education: 1,
        achievements: 1,
        // projects: 1, 
        // assessments: 1, 
        // applications: 1, 
        // savedRoles: 1,
        customRoles: 1,
        createdAt: 1,
        updatedAt: 1
    };
    
    // Check if developer exists
    let developerExists = await db.collection('developers').countDocuments({ email: userEmail });

    let updatedDeveloper: DeveloperProfile | null = null;

    if (!developerExists) {
      // Create new developer profile using validatedData
      console.log(`Creating new profile for ${userEmail}`);
      const createData = {
        email: userEmail, // Ensure primary email is set
        ...validatedData, // Spread the validated data
        // Ensure required arrays/objects have defaults if not in schema/payload
        contactInfo: validatedData.contactInfo || null,
        skills: validatedData.skills || [],
        experience: validatedData.experience || [],
        education: validatedData.education || [],
        achievements: validatedData.achievements || [],
        customRoles: validatedData.customRoles || [],
        // Set initial timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('developers').insertOne(createData);
      
      updatedDeveloper = await db.collection('developers').findOne(
        { _id: result.insertedId },
        { projection: fullProjection }
      ) as DeveloperProfile | null;
      
      if (!updatedDeveloper) {
        throw new Error('Failed to create and fetch new developer profile');
      }
    } else {
      // Update existing developer using validatedData
      console.log(`Updating existing profile for ${userEmail}`);
      
      // Prepare the update data, excluding potentially immutable fields like email, createdAt
      // const { email, createdAt, ...updateDataPayload } = validatedData; // This was incorrect
      
      // Use the validatedData directly, as it contains only the fields defined in the update schema
      const updateDataPayload = validatedData;

      await db.collection('developers').updateOne(
        { email: userEmail },
        {
          $set: {
            ...updateDataPayload, // Use the validated data directly
            updatedAt: new Date() // Always update the timestamp
          }
        }
      );
      
      // Fetch the updated developer with the full projection
      updatedDeveloper = await db.collection('developers').findOne(
        { email: userEmail },
        { projection: fullProjection }
      ) as DeveloperProfile | null;
      
      if (!updatedDeveloper) {
        throw new Error('Failed to update and fetch developer profile');
      }
    }
    
    // Return the fully populated and updated developer profile
    return NextResponse.json({
      ...updatedDeveloper,
      _id: updatedDeveloper._id.toString() // Convert ObjectId to string
    });

  } catch (error) {
    console.error('Error updating developer profile:', error)
    // Check if it's a Zod error for more specific feedback
    if (error instanceof z.ZodError) {
       return NextResponse.json(
            { error: 'Invalid data format', details: error.flatten() },
            { status: 400 }
        );
    }
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    )
  }
} 