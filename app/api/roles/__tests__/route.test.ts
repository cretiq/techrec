import { GET, POST } from '../route'
import { prisma } from '@/lib/prisma'

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    role: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock @prisma/client
jest.mock('@prisma/client', () => ({
  RoleType: {
    FULL_TIME: 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    CONTRACT: 'CONTRACT',
    INTERNSHIP: 'INTERNSHIP',
    FREELANCE: 'FREELANCE',
  },
}))

describe('GET /api/roles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return formatted roles', async () => {
    const mockRoles = [
      {
        id: '1',
        title: 'Software Engineer',
        description: 'A great role',
        location: 'Remote',
        salary: '$100k',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: false,
        company: {
          id: 'company1',
          name: 'Tech Corp',
        },
        skills: [
          {
            skill: {
              id: 'skill1',
              name: 'JavaScript',
              description: 'Programming language',
            },
          },
        ],
      },
    ]

    ;(prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles)

    const response = await GET()
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual([
      {
        id: '1',
        title: 'Software Engineer',
        description: 'A great role',
        requirements: ['JavaScript'],
        skills: [
          {
            id: 'skill1',
            name: 'JavaScript',
            description: 'Programming language',
          },
        ],
        company: {
          id: 'company1',
          name: 'Tech Corp',
        },
        location: 'Remote',
        salary: '$100k',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: false,
      },
    ])
  })

  it('should handle database errors gracefully', async () => {
    ;(prisma.role.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await GET()
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to fetch roles' })
  })
})

describe('POST /api/roles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new role with valid data', async () => {
    const mockCreatedRole = {
      id: '1',
      title: 'Software Engineer',
      description: 'A great role',
      location: 'Remote',
      salary: '$100k',
      type: 'FULL_TIME',
      remote: true,
      visaSponsorship: false,
      company: {
        id: 'company1',
        name: 'Tech Corp',
      },
      skills: [
        {
          skill: {
            id: 'skill1',
            name: 'JavaScript',
            description: 'Programming language',
          },
        },
      ],
    }

    ;(prisma.role.create as jest.Mock).mockResolvedValue(mockCreatedRole)

    const requestBody = {
      title: 'Software Engineer',
      description: 'A great role',
      companyId: 'company1',
      location: 'Remote',
      salary: '$100k',
      type: 'Full-time',
      remote: true,
      visaSponsorship: false,
      skills: ['skill1'],
    }

    const response = await POST(
      new Request('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data).toEqual({
      id: '1',
      title: 'Software Engineer',
      description: 'A great role',
      requirements: ['JavaScript'],
      skills: [
        {
          id: 'skill1',
          name: 'JavaScript',
          description: 'Programming language',
        },
      ],
      company: {
        id: 'company1',
        name: 'Tech Corp',
      },
      location: 'Remote',
      salary: '$100k',
      type: 'FULL_TIME',
      remote: true,
      visaSponsorship: false,
    })

    // Verify Prisma was called with correct data
    expect(prisma.role.create).toHaveBeenCalledWith({
      data: {
        title: 'Software Engineer',
        description: 'A great role',
        companyId: 'company1',
        location: 'Remote',
        salary: '$100k',
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: false,
        skills: {
          create: [
            {
              skill: {
                connect: {
                  id: 'skill1',
                },
              },
            },
          ],
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })
  })

  it('should return 400 for missing required fields', async () => {
    const requestBody = {
      // Missing title and description
      companyId: 'company1',
      location: 'Remote',
    }

    const response = await POST(
      new Request('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Title, description, and company ID are required',
    })
  })

  it('should handle database errors during creation', async () => {
    const requestBody = {
      title: 'Software Engineer',
      description: 'A great role',
      companyId: 'company1',
    }

    ;(prisma.role.create as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await POST(
      new Request('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to create role' })
  })

  it('should handle different role type formats', async () => {
    const mockCreatedRole = {
      id: '1',
      title: 'Part-time Developer',
      description: 'A part-time role',
      type: 'PART_TIME',
      company: null,
      skills: [],
    }

    ;(prisma.role.create as jest.Mock).mockResolvedValue(mockCreatedRole)

    // Test with different type formats
    const typeFormats = ['Part-time', 'PART_TIME']

    for (const typeFormat of typeFormats) {
      const requestBody = {
        title: 'Part-time Developer',
        description: 'A part-time role',
        companyId: 'company1',
        type: typeFormat,
      }

      const response = await POST(
        new Request('http://localhost:3000/api/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      )

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.type).toBe('PART_TIME')
    }
  })

  it('should handle empty skills array', async () => {
    const mockCreatedRole = {
      id: '1',
      title: 'Software Engineer',
      description: 'A great role',
      location: 'Remote',
      salary: '$100k',
      type: 'FULL_TIME',
      remote: true,
      visaSponsorship: false,
      company: {
        id: 'company1',
        name: 'Tech Corp',
      },
      skills: [],
    }

    ;(prisma.role.create as jest.Mock).mockResolvedValue(mockCreatedRole)

    const requestBody = {
      title: 'Software Engineer',
      description: 'A great role',
      companyId: 'company1',
      location: 'Remote',
      salary: '$100k',
      type: 'Full-time',
      remote: true,
      visaSponsorship: false,
      skills: [],
    }

    const response = await POST(
      new Request('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.skills).toEqual([])
    expect(data.requirements).toEqual([])
  })

  it('should handle invalid role type', async () => {
    const requestBody = {
      title: 'Software Engineer',
      description: 'A great role',
      companyId: 'company1',
      type: 'INVALID_TYPE',
    }

    const response = await POST(
      new Request('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({
      error: 'Invalid role type',
    })
  })

  it('should handle missing company', async () => {
    const mockCreatedRole = {
      id: '1',
      title: 'Software Engineer',
      description: 'A great role',
      location: 'Remote',
      salary: '$100k',
      type: 'FULL_TIME',
      remote: true,
      visaSponsorship: false,
      company: null,
      skills: [],
    }

    ;(prisma.role.create as jest.Mock).mockResolvedValue(mockCreatedRole)

    const requestBody = {
      title: 'Software Engineer',
      description: 'A great role',
      companyId: 'non_existent_company',
      location: 'Remote',
      salary: '$100k',
      type: 'Full-time',
      remote: true,
      visaSponsorship: false,
    }

    const response = await POST(
      new Request('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.company).toBeNull()
  })

  it('should handle GET with empty results', async () => {
    ;(prisma.role.findMany as jest.Mock).mockResolvedValue([])

    const response = await GET()
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual([])
  })

  it('should handle GET with partial data', async () => {
    const mockRoles = [
      {
        id: '1',
        title: 'Software Engineer',
        description: 'A great role',
        location: 'Remote',
        salary: null,
        type: 'FULL_TIME',
        remote: true,
        visaSponsorship: false,
        company: null,
        skills: [],
      },
    ]

    ;(prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles)

    const response = await GET()
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data[0].salary).toBeNull()
    expect(data[0].company).toBeNull()
    expect(data[0].skills).toEqual([])
  })
}) 