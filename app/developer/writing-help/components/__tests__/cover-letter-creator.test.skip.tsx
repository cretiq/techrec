/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { SessionProvider } from 'next-auth/react'
import CoverLetterCreator from '../cover-letter-creator'
import { Role, ApplicationInfo } from '@/types/role'
import selectedRolesSlice from '@/lib/features/selectedRolesSlice'
import coverLettersSlice from '@/lib/features/coverLettersSlice'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { id: 'test-user' },
    },
    status: 'authenticated'
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      selectedRoles: selectedRolesSlice,
      coverLetters: coverLettersSlice,
    },
    preloadedState: {
      selectedRoles: {
        selectedRoles: [],
        isMultiRoleMode: false,
      },
      coverLetters: {
        coverLetters: {},
        isGenerating: false,
        lastGenerated: null,
      },
      ...initialState,
    },
  })
}

const mockRole: Role = {
  id: 'test-role-123',
  title: 'Senior Frontend Developer',
  description: 'Test role description',
  requirements: ['React', 'TypeScript'],
  skills: [
    { name: 'React', category: 'Frontend', level: 'Expert' },
    { name: 'TypeScript', category: 'Languages', level: 'Advanced' }
  ],
  company: {
    id: 'test-company-123',
    name: 'TechCorp Inc',
    industry: 'Technology',
    size: '100-500',
    headquarters: 'San Francisco, CA',
    description: 'Leading tech company',
    specialties: ['Software Development', 'AI'],
    employeeCount: 250,
    logoUrl: 'https://example.com/logo.png',
    linkedinUrl: 'https://linkedin.com/company/techcorp'
  },
  location: 'San Francisco, CA',
  salary: '$120,000 - $150,000',
  type: 'FULL_TIME',
  remote: false,
  visaSponsorship: false,
  url: 'https://example.com/job/123',
  applicationInfo: {
    directApply: true,
    applicationUrl: 'https://linkedin.com/jobs/123',
    recruiter: {
      name: 'Jane Smith',
      title: 'Senior Recruiter',
      url: 'https://linkedin.com/in/janesmith'
    },
    hiringManager: {
      name: 'John Doe',
      email: 'john.doe@techcorp.com'
    }
  }
}

const mockRoleWithoutApplicationInfo: Role = {
  ...mockRole,
  id: 'test-role-456',
  applicationInfo: undefined
}

const mockRoleWithExternalApplication: Role = {
  ...mockRole,
  id: 'test-role-789',
  applicationInfo: {
    directApply: false,
    applicationUrl: 'https://techcorp.com/careers/frontend-dev',
    recruiter: undefined,
    hiringManager: undefined
  }
}

describe('CoverLetterCreator - Application Routing', () => {
  it('renders application button when role has applicationInfo', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <SessionProvider session={null}>
          <CoverLetterCreator 
            role={mockRole}
            isMultiRoleMode={false}
            onOpenPersonalization={jest.fn()}
            onOpenTextCustomization={jest.fn()}
          />
        </SessionProvider>
      </Provider>
    )

    // Check if application button is rendered
    const applicationButton = screen.getByTestId('write-coverletter-application-button-test-role-123')
    expect(applicationButton).toBeInTheDocument()
  })

  it('renders recruiter card when recruiter info is available', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <SessionProvider session={null}>
          <CoverLetterCreator 
            role={mockRole}
            isMultiRoleMode={false}
            onOpenPersonalization={jest.fn()}
            onOpenTextCustomization={jest.fn()}
          />
        </SessionProvider>
      </Provider>
    )

    // Check if recruiter card is rendered
    const recruiterCard = screen.getByTestId('write-coverletter-recruiter-info-test-role-123')
    expect(recruiterCard).toBeInTheDocument()
  })

  it('does not render application section when role has no applicationInfo', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <SessionProvider session={null}>
          <CoverLetterCreator 
            role={mockRoleWithoutApplicationInfo}
            isMultiRoleMode={false}
            onOpenPersonalization={jest.fn()}
            onOpenTextCustomization={jest.fn()}
          />
        </SessionProvider>
      </Provider>
    )

    // Check that application button is not rendered
    const applicationButton = screen.queryByTestId('write-coverletter-application-button-test-role-456')
    expect(applicationButton).not.toBeInTheDocument()
  })

  it('renders application button without recruiter card when no recruiter info', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <SessionProvider session={null}>
          <CoverLetterCreator 
            role={mockRoleWithExternalApplication}
            isMultiRoleMode={false}
            onOpenPersonalization={jest.fn()}
            onOpenTextCustomization={jest.fn()}
          />
        </SessionProvider>
      </Provider>
    )

    // Check if application button is rendered
    const applicationButton = screen.getByTestId('write-coverletter-application-button-test-role-789')
    expect(applicationButton).toBeInTheDocument()

    // Check that recruiter card is not rendered
    const recruiterCard = screen.queryByTestId('write-coverletter-recruiter-info-test-role-789')
    expect(recruiterCard).not.toBeInTheDocument()
  })

  it('renders role and company information correctly', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <SessionProvider session={null}>
          <CoverLetterCreator 
            role={mockRole}
            isMultiRoleMode={false}
            onOpenPersonalization={jest.fn()}
            onOpenTextCustomization={jest.fn()}
          />
        </SessionProvider>
      </Provider>
    )

    // Check role title
    expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
    
    // Check company name
    expect(screen.getByText('TechCorp Inc')).toBeInTheDocument()
    
    // Check location
    expect(screen.getByText('• San Francisco, CA')).toBeInTheDocument()
  })

  it('works correctly in multi-role mode', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <SessionProvider session={null}>
          <CoverLetterCreator 
            role={mockRole}
            isMultiRoleMode={true}
            onOpenPersonalization={jest.fn()}
            onOpenTextCustomization={jest.fn()}
          />
        </SessionProvider>
      </Provider>
    )

    // Check if application button is still rendered in multi-role mode
    const applicationButton = screen.getByTestId('write-coverletter-application-button-test-role-123')
    expect(applicationButton).toBeInTheDocument()
    
    // Check if recruiter card is still rendered in multi-role mode
    const recruiterCard = screen.getByTestId('write-coverletter-recruiter-info-test-role-123')
    expect(recruiterCard).toBeInTheDocument()
  })
})