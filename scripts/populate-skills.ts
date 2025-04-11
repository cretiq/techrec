const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const skillCategories = [
  {
    name: 'Programming Languages',
    description: 'Core programming languages and their frameworks',
    skills: [
      { name: 'JavaScript', description: 'High-level, interpreted programming language' },
      { name: 'TypeScript', description: 'Typed superset of JavaScript' },
      { name: 'Python', description: 'High-level, interpreted programming language' },
      { name: 'Java', description: 'Object-oriented programming language' },
      { name: 'C#', description: 'Modern, object-oriented programming language' },
      { name: 'Go', description: 'Statically typed, compiled programming language' },
      { name: 'Rust', description: 'Systems programming language' },
      { name: 'Swift', description: 'Programming language for iOS development' },
      { name: 'Kotlin', description: 'Modern programming language for Android development' },
      { name: 'PHP', description: 'Server-side scripting language' },
    ]
  },
  {
    name: 'Frontend Development',
    description: 'Technologies for building user interfaces',
    skills: [
      { name: 'React', description: 'JavaScript library for building user interfaces' },
      { name: 'Vue.js', description: 'Progressive JavaScript framework' },
      { name: 'Angular', description: 'Platform for building web applications' },
      { name: 'Svelte', description: 'Modern JavaScript framework' },
      { name: 'HTML5', description: 'Markup language for web pages' },
      { name: 'CSS3', description: 'Style sheet language' },
      { name: 'SASS/SCSS', description: 'CSS preprocessor' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
      { name: 'Next.js', description: 'React framework for production' },
      { name: 'Nuxt.js', description: 'Vue.js framework for production' },
    ]
  },
  {
    name: 'Backend Development',
    description: 'Server-side technologies and frameworks',
    skills: [
      { name: 'Node.js', description: 'JavaScript runtime environment' },
      { name: 'Express.js', description: 'Web application framework for Node.js' },
      { name: 'Django', description: 'High-level Python web framework' },
      { name: 'Flask', description: 'Lightweight Python web framework' },
      { name: 'Spring Boot', description: 'Java-based framework' },
      { name: 'ASP.NET Core', description: 'Cross-platform .NET framework' },
      { name: 'Ruby on Rails', description: 'Web application framework' },
      { name: 'FastAPI', description: 'Modern Python web framework' },
      { name: 'NestJS', description: 'Progressive Node.js framework' },
      { name: 'Laravel', description: 'PHP web application framework' },
    ]
  },
  {
    name: 'Database',
    description: 'Database technologies and management systems',
    skills: [
      { name: 'SQL', description: 'Structured Query Language' },
      { name: 'PostgreSQL', description: 'Object-relational database system' },
      { name: 'MySQL', description: 'Relational database management system' },
      { name: 'MongoDB', description: 'NoSQL document database' },
      { name: 'Redis', description: 'In-memory data structure store' },
      { name: 'DynamoDB', description: 'NoSQL database service' },
      { name: 'Firebase', description: 'Backend-as-a-Service platform' },
      { name: 'Prisma', description: 'Next-generation ORM' },
      { name: 'TypeORM', description: 'TypeScript ORM' },
      { name: 'Sequelize', description: 'Promise-based Node.js ORM' },
    ]
  },
  {
    name: 'DevOps & Cloud',
    description: 'Cloud platforms and DevOps tools',
    skills: [
      { name: 'Docker', description: 'Containerization platform' },
      { name: 'Kubernetes', description: 'Container orchestration platform' },
      { name: 'AWS', description: 'Amazon Web Services' },
      { name: 'Azure', description: 'Microsoft cloud platform' },
      { name: 'GCP', description: 'Google Cloud Platform' },
      { name: 'Terraform', description: 'Infrastructure as Code tool' },
      { name: 'CI/CD', description: 'Continuous Integration/Continuous Deployment' },
      { name: 'Git', description: 'Version control system' },
      { name: 'Jenkins', description: 'Automation server' },
      { name: 'Ansible', description: 'Configuration management tool' },
    ]
  },
  {
    name: 'Mobile Development',
    description: 'Mobile application development technologies',
    skills: [
      { name: 'React Native', description: 'Framework for building native apps' },
      { name: 'Flutter', description: 'UI toolkit for building natively compiled applications' },
      { name: 'iOS Development', description: 'Development for Apple iOS platform' },
      { name: 'Android Development', description: 'Development for Android platform' },
      { name: 'Xamarin', description: 'Cross-platform mobile development' },
      { name: 'Ionic', description: 'Cross-platform mobile development framework' },
      { name: 'Cordova', description: 'Mobile development framework' },
      { name: 'NativeScript', description: 'Framework for building native mobile apps' },
      { name: 'SwiftUI', description: 'Declarative UI framework for iOS' },
      { name: 'Jetpack Compose', description: 'Modern toolkit for building native Android UI' },
    ]
  },
  {
    name: 'Testing',
    description: 'Testing frameworks and methodologies',
    skills: [
      { name: 'Jest', description: 'JavaScript testing framework' },
      { name: 'Mocha', description: 'JavaScript test framework' },
      { name: 'Cypress', description: 'End-to-end testing framework' },
      { name: 'Selenium', description: 'Web browser automation' },
      { name: 'JUnit', description: 'Unit testing framework for Java' },
      { name: 'Pytest', description: 'Python testing framework' },
      { name: 'RSpec', description: 'Testing tool for Ruby' },
      { name: 'Playwright', description: 'End-to-end testing framework' },
      { name: 'Vitest', description: 'Modern testing framework' },
      { name: 'Testing Library', description: 'Testing utilities for React' },
    ]
  },
  {
    name: 'AI & Machine Learning',
    description: 'Artificial Intelligence and Machine Learning technologies',
    skills: [
      { name: 'TensorFlow', description: 'Machine learning framework' },
      { name: 'PyTorch', description: 'Machine learning framework' },
      { name: 'Scikit-learn', description: 'Machine learning library for Python' },
      { name: 'OpenCV', description: 'Computer vision library' },
      { name: 'NLP', description: 'Natural Language Processing' },
      { name: 'Deep Learning', description: 'Deep neural networks' },
      { name: 'Computer Vision', description: 'Image processing and analysis' },
      { name: 'Reinforcement Learning', description: 'Machine learning paradigm' },
      { name: 'Data Science', description: 'Extracting insights from data' },
      { name: 'Pandas', description: 'Data manipulation and analysis library' },
    ]
  }
];

async function populateSkills() {
  const client = new MongoClient(uri as string)
  
  try {
    await client.connect()
    const db = client.db('techrec')

    for (const category of skillCategories) {
      // Create category
      const categoryResult = await db.collection('SkillCategory').insertOne({
        name: category.name,
        description: category.description,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      console.log(`Created category: ${category.name}`)

      // Create skills for this category
      const skillsWithCategory = category.skills.map(skill => ({
        ...skill,
        categoryId: categoryResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      const skillsResult = await db.collection('Skill').insertMany(skillsWithCategory)
      console.log(`Created ${skillsResult.insertedCount} skills in category ${category.name}`)
    }

    console.log('Successfully populated skills database!')
  } catch (error) {
    console.error('Error populating skills database:', error)
  } finally {
    await client.close()
  }
}

populateSkills() 