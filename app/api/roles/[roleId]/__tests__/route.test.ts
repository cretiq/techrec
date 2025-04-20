import { GET } from '../route'
import { prisma } from '@/prisma/prisma'
import { getServerSession } from 'next-auth'

// Mock the dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    role: {
      findUnique: jest.fn(),
    },
  },
}))

describe('GET /api/roles/[roleId]', () => {
  const mockRoleId = '123'

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const response = await GET(new Request(`http://localhost:3000/api/roles/${mockRoleId}`), { params: { roleId: mockRoleId } })
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 404 if role is not found', async () => {
    // Mock authenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } })
    // Mock role not found
    ;(prisma.role.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await GET(new Request(`http://localhost:3000/api/roles/${mockRoleId}`), { params: { roleId: mockRoleId } })
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: 'Role not found' })
  })

  it('should return role data if found', async () => {
    // Mock authenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } })
    
    // Mock role data
    const mockRole = {
      id: mockRoleId,
      title: 'Software Engineer',
      description: 'A great role',
      requirements: ['JavaScript', 'TypeScript'],
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
    ;(prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole)

    const response = await GET(new Request(`http://localhost:3000/api/roles/${mockRoleId}`), { params: { roleId: mockRoleId } })
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual({
      id: mockRoleId,
      title: 'Software Engineer',
      description: 'A great role',
      requirements: ['JavaScript', 'TypeScript'],
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
  })

  it('should handle database errors gracefully', async () => {
    // Mock authenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } })
    // Mock database error
    ;(prisma.role.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await GET(new Request(`http://localhost:3000/api/roles/${mockRoleId}`), { params: { roleId: mockRoleId } })
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Internal error' })
  })
}) 