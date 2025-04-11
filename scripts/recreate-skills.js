const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const skillsToCreate = [
  {
    id: '67f9125d0989df00a19d2904',
    name: 'Selenium',
    categoryId: '67f9125d0989df00a19d2900',
    description: 'Web browser automation'
  },
  {
    id: '67f9125d0989df00a19d2902',
    name: 'Mocha',
    categoryId: '67f9125d0989df00a19d2900',
    description: 'JavaScript test framework'
  },
  {
    id: '67f9125d0989df00a19d28ee',
    name: 'Azure',
    categoryId: '67f9125d0989df00a19d28ea',
    description: 'Microsoft cloud platform'
  },
  {
    id: '67f9125d0989df00a19d28ff',
    name: 'Jetpack Compose',
    categoryId: '67f9125d0989df00a19d28f5',
    description: 'Modern toolkit for building native Android UI'
  },
  {
    id: '67f9125d0989df00a19d290c',
    name: 'TensorFlow',
    categoryId: '67f9125d0989df00a19d290b',
    description: 'Machine learning framework'
  },
  {
    id: '67f9125d0989df00a19d28f8',
    name: 'iOS Development',
    categoryId: '67f9125d0989df00a19d28f5',
    description: 'Development for Apple iOS platform'
  },
  {
    id: '67f9125d0989df00a19d2909',
    name: 'Vitest',
    categoryId: '67f9125d0989df00a19d2900',
    description: 'Modern testing framework'
  },
  {
    id: '67f9125d0989df00a19d290d',
    name: 'PyTorch',
    categoryId: '67f9125d0989df00a19d290b',
    description: 'Machine learning framework'
  },
  {
    id: '67f9125d0989df00a19d28c4',
    name: 'Go',
    categoryId: '67f9125d0989df00a19d28be',
    description: 'Statically typed, compiled programming language'
  },
  {
    id: '67f9125d0989df00a19d28cf',
    name: 'CSS3',
    categoryId: '67f9125d0989df00a19d28c9',
    description: 'Style sheet language'
  },
  {
    id: '67f9125d0989df00a19d28d7',
    name: 'Django',
    categoryId: '67f9125d0989df00a19d28d4',
    description: 'High-level Python web framework'
  },
  {
    id: '67f9125d0989df00a19d290a',
    name: 'Testing Library',
    categoryId: '67f9125d0989df00a19d2900',
    description: 'Testing utilities for React'
  },
  {
    id: '67f9125d0989df00a19d28c1',
    name: 'Python',
    categoryId: '67f9125d0989df00a19d28be',
    description: 'High-level, interpreted programming language'
  },
  {
    id: '67f9125d0989df00a19d28f6',
    name: 'React Native',
    categoryId: '67f9125d0989df00a19d28f5',
    description: 'Framework for building native apps'
  },
  {
    id: '67f9125d0989df00a19d28db',
    name: 'Ruby on Rails',
    categoryId: '67f9125d0989df00a19d28d4',
    description: 'Web application framework'
  },
  {
    id: '67f9125d0989df00a19d28e6',
    name: 'Firebase',
    categoryId: '67f9125d0989df00a19d28df',
    description: 'Backend-as-a-Service platform'
  },
  {
    id: '67f9125d0989df00a19d28e8',
    name: 'TypeORM',
    categoryId: '67f9125d0989df00a19d28df',
    description: 'TypeScript ORM'
  },
  {
    id: '67f9125d0989df00a19d28f7',
    name: 'Flutter',
    categoryId: '67f9125d0989df00a19d28f5',
    description: 'UI toolkit for building natively compiled applications'
  },
  {
    id: '67f9125d0989df00a19d28d5',
    name: 'Node.js',
    categoryId: '67f9125d0989df00a19d28d4',
    description: 'JavaScript runtime environment'
  },
  {
    id: '67f9125d0989df00a19d28e3',
    name: 'MongoDB',
    categoryId: '67f9125d0989df00a19d28df',
    description: 'NoSQL document database'
  },
  {
    id: '67f9125d0989df00a19d28fd',
    name: 'NativeScript',
    categoryId: '67f9125d0989df00a19d28f5',
    description: 'Framework for building native mobile apps'
  },
  {
    id: '67f9125d0989df00a19d28cc',
    name: 'Angular',
    categoryId: '67f9125d0989df00a19d28c9',
    description: 'Platform for building web applications'
  },
  {
    id: '67f9125d0989df00a19d28eb',
    name: 'Docker',
    categoryId: '67f9125d0989df00a19d28ea',
    description: 'Containerization platform'
  },
  {
    id: '67f9125d0989df00a19d28d0',
    name: 'SASS/SCSS',
    categoryId: '67f9125d0989df00a19d28c9',
    description: 'CSS preprocessor'
  },
  {
    id: '67f9125d0989df00a19d2913',
    name: 'Reinforcement Learning',
    categoryId: '67f9125d0989df00a19d290b',
    description: 'Machine learning paradigm'
  }
]

async function main() {
  console.log('=== Creating Skills ===')
  
  for (const skill of skillsToCreate) {
    try {
      await prisma.skill.create({
        data: {
          id: skill.id,
          name: skill.name,
          categoryId: skill.categoryId,
          description: skill.description
        }
      })
      console.log(`Created skill: ${skill.name}`)
    } catch (error) {
      console.error(`Failed to create skill ${skill.name}:`, error)
    }
  }

  console.log('\nDone!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 