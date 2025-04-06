import { connectToDatabase } from '../lib/db'
import Developer from '../lib/models/Developer'

const developers = [
  {
    name: 'Alex Johnson',
    title: 'Senior Frontend Developer',
    email: 'alex@example.com',
    location: 'San Francisco, CA',
    about: 'Experienced frontend developer with 8+ years of experience building responsive and accessible web applications. Passionate about user experience and performance optimization.',
    skills: [
      { name: 'React', level: 'expert' },
      { name: 'TypeScript', level: 'advanced' },
      { name: 'JavaScript', level: 'expert' },
      { name: 'HTML/CSS', level: 'expert' },
      { name: 'Next.js', level: 'advanced' },
      { name: 'Redux', level: 'intermediate' },
      { name: 'GraphQL', level: 'intermediate' },
      { name: 'Node.js', level: 'intermediate' },
    ],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        description: 'Lead frontend development for multiple projects, mentored junior developers, and implemented performance optimizations that improved load times by 40%.',
        startDate: '2021-01-01',
        current: true,
      },
      {
        title: 'Frontend Developer',
        company: 'WebSolutions LLC',
        description: 'Developed responsive web applications using React and TypeScript, collaborated with UX designers to implement user-friendly interfaces.',
        startDate: '2018-03-01',
        endDate: '2020-12-31',
      },
    ],
    education: [
      {
        degree: 'M.S. Computer Science',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        year: '2018',
      },
      {
        degree: 'B.S. Computer Science',
        institution: 'University of Washington',
        location: 'Seattle, WA',
        year: '2016',
      },
    ],
    achievements: [
      'Reduced application load time by 40% through code splitting and lazy loading',
      'Implemented accessibility improvements that increased WCAG compliance score from 65% to 98%',
      'Led migration from JavaScript to TypeScript for a codebase with 100,000+ lines of code',
    ],
    applications: [
      {
        role: 'Senior Frontend Engineer',
        status: 'pending',
        appliedAt: '2023-03-15',
        coverLetter: 'https://example.com/cover-letter-1',
      },
      {
        role: 'Full Stack Developer',
        status: 'reviewed',
        appliedAt: '2023-03-10',
        coverLetter: 'https://example.com/cover-letter-2',
      },
    ],
  },
  {
    name: 'Sarah Chen',
    title: 'Full Stack Developer',
    email: 'sarah@example.com',
    location: 'New York, NY',
    about: 'Full stack developer with 5 years of experience in building scalable web applications. Strong focus on clean code and best practices.',
    skills: [
      { name: 'Python', level: 'expert' },
      { name: 'Django', level: 'advanced' },
      { name: 'React', level: 'advanced' },
      { name: 'PostgreSQL', level: 'advanced' },
      { name: 'AWS', level: 'intermediate' },
      { name: 'Docker', level: 'intermediate' },
    ],
    experience: [
      {
        title: 'Full Stack Developer',
        company: 'InnovateTech',
        description: 'Developed and maintained multiple web applications using Django and React. Implemented CI/CD pipelines and automated testing.',
        startDate: '2020-01-01',
        current: true,
      },
      {
        title: 'Backend Developer',
        company: 'DataFlow Systems',
        description: 'Built RESTful APIs and database schemas for enterprise applications. Optimized database queries and improved performance.',
        startDate: '2018-06-01',
        endDate: '2019-12-31',
      },
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        institution: 'New York University',
        location: 'New York, NY',
        year: '2018',
      },
    ],
    achievements: [
      'Implemented automated testing that reduced bug reports by 60%',
      'Designed and implemented a microservices architecture that improved scalability',
      'Mentored junior developers and conducted code reviews',
    ],
    applications: [
      {
        role: 'Senior Full Stack Developer',
        status: 'accepted',
        appliedAt: '2023-02-20',
        coverLetter: 'https://example.com/cover-letter-3',
      },
    ],
  },
]

async function populateDatabase() {
  try {
    await connectToDatabase()
    console.log('Connected to database')

    // Clear existing developers
    await Developer.deleteMany({})
    console.log('Cleared existing developers')

    // Insert new developers
    const result = await Developer.insertMany(developers)
    console.log(`Inserted ${result.length} developers`)

    process.exit(0)
  } catch (error) {
    console.error('Error populating database:', error)
    process.exit(1)
  }
}

populateDatabase() 