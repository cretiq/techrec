import { PrismaClient } from '@prisma/client'
import { RoleType, SkillLevel, EmployeeRange, FundingStage } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting seed process...')

    // 1. Create Skill Categories
    console.log('Creating skill categories...')
    const skillCategories = await Promise.all([
      prisma.skillCategory.create({
        data: {
          name: 'Backend Development',
          description: 'Backend development skills and technologies'
        }
      }),
      prisma.skillCategory.create({
        data: {
          name: 'Frontend Development',
          description: 'Frontend development skills and technologies'
        }
      }),
      prisma.skillCategory.create({
        data: {
          name: 'DevOps & Cloud',
          description: 'DevOps, cloud computing, and infrastructure skills'
        }
      }),
      prisma.skillCategory.create({
        data: {
          name: 'Machine Learning & AI',
          description: 'Machine learning, artificial intelligence, and data science skills'
        }
      }),
      prisma.skillCategory.create({
        data: {
          name: 'Security',
          description: 'Cybersecurity and information security skills'
        }
      }),
      prisma.skillCategory.create({
        data: {
          name: 'Blockchain',
          description: 'Blockchain and cryptocurrency development skills'
        }
      })
    ])
    console.log('Skill categories created:', skillCategories.map(c => c.name))

    // 2. Create Skills with proper category relationships
    console.log('Creating skills...')
    const skills = await Promise.all([
      // Backend Development Skills
      prisma.skill.create({
        data: {
          name: 'Node.js',
          description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
          categoryId: skillCategories[0].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Python',
          description: 'High-level programming language',
          categoryId: skillCategories[0].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Java',
          description: 'Object-oriented programming language',
          categoryId: skillCategories[0].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Go',
          description: 'Statically typed, compiled programming language',
          categoryId: skillCategories[0].id
        }
      }),
      // Frontend Development Skills
      prisma.skill.create({
        data: {
          name: 'React',
          description: 'JavaScript library for building user interfaces',
          categoryId: skillCategories[1].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'TypeScript',
          description: 'Typed superset of JavaScript',
          categoryId: skillCategories[1].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Next.js',
          description: 'React framework for production',
          categoryId: skillCategories[1].id
        }
      }),
      // DevOps & Cloud Skills
      prisma.skill.create({
        data: {
          name: 'AWS',
          description: 'Amazon Web Services cloud platform',
          categoryId: skillCategories[2].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Docker',
          description: 'Containerization platform',
          categoryId: skillCategories[2].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Kubernetes',
          description: 'Container orchestration platform',
          categoryId: skillCategories[2].id
        }
      }),
      // Machine Learning & AI Skills
      prisma.skill.create({
        data: {
          name: 'PyTorch',
          description: 'Machine learning framework',
          categoryId: skillCategories[3].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'TensorFlow',
          description: 'Machine learning framework',
          categoryId: skillCategories[3].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Computer Vision',
          description: 'Field of AI that trains computers to interpret visual data',
          categoryId: skillCategories[3].id
        }
      }),
      // Security Skills
      prisma.skill.create({
        data: {
          name: 'Penetration Testing',
          description: 'Authorized simulated cyberattack on a computer system',
          categoryId: skillCategories[4].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Security Auditing',
          description: 'Systematic evaluation of security',
          categoryId: skillCategories[4].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Threat Analysis',
          description: 'Process of identifying and evaluating potential threats',
          categoryId: skillCategories[4].id
        }
      }),
      // Blockchain Skills
      prisma.skill.create({
        data: {
          name: 'Solidity',
          description: 'Programming language for writing smart contracts',
          categoryId: skillCategories[5].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Smart Contracts',
          description: 'Self-executing contracts with the terms directly written into code',
          categoryId: skillCategories[5].id
        }
      }),
      prisma.skill.create({
        data: {
          name: 'Web3.js',
          description: 'JavaScript library for interacting with Ethereum blockchain',
          categoryId: skillCategories[5].id
        }
      })
    ])
    console.log('Skills created:', skills.map(s => s.name))

    // 3. Create Companies
    console.log('Creating companies...')
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: 'NeuraTech AI',
          description: 'Leading AI and machine learning company',
          website: 'https://neuratech.ai',
          location: 'San Francisco, CA',
          size: EmployeeRange.FROM_50_TO_250,
          industry: ['Artificial Intelligence', 'Machine Learning'],
          logo: 'https://neuratech.ai/logo.png',
          founded: 2019,
          employees: EmployeeRange.FROM_50_TO_250,
          funding: FundingStage.SERIES_B,
          verified: true
        }
      }),
      prisma.company.create({
        data: {
          name: 'CyberShield Security',
          description: 'Enterprise cybersecurity solutions provider',
          website: 'https://cybershield.sec',
          location: 'New York, NY',
          size: EmployeeRange.MORE_THAN_250,
          industry: ['Cybersecurity', 'Enterprise Security'],
          logo: 'https://cybershield.sec/logo.png',
          founded: 2017,
          employees: EmployeeRange.MORE_THAN_250,
          funding: FundingStage.SERIES_C,
          verified: true
        }
      }),
      prisma.company.create({
        data: {
          name: 'FinFlow Technologies',
          description: 'Blockchain and fintech solutions provider',
          website: 'https://finflow.tech',
          location: 'London, UK',
          size: EmployeeRange.FROM_50_TO_250,
          industry: ['Blockchain', 'FinTech'],
          logo: 'https://finflow.tech/logo.png',
          founded: 2018,
          employees: EmployeeRange.FROM_50_TO_250,
          funding: FundingStage.SERIES_B,
          verified: true
        }
      }),
      prisma.company.create({
        data: {
          name: 'HealthOS Systems',
          description: 'Healthcare technology and AI solutions',
          website: 'https://healthos.systems',
          location: 'Boston, MA',
          size: EmployeeRange.FROM_50_TO_250,
          industry: ['Healthcare', 'AI'],
          logo: 'https://healthos.systems/logo.png',
          founded: 2020,
          employees: EmployeeRange.FROM_50_TO_250,
          funding: FundingStage.SERIES_A,
          verified: true
        }
      })
    ])
    console.log('Companies created:', companies.map(c => c.name))

    // 4. Create Roles with proper company relationships
    console.log('Creating roles with skills...')
    const roles = await Promise.all([
      // NeuraTech AI Roles
      prisma.role.create({
        data: {
          title: 'Senior ML Engineer',
          companyId: companies[0].id,
          description: 'Lead ML engineer position at NeuraTech AI',
          requirements: [
            '5+ years of ML experience',
            'Strong Python and PyTorch skills',
            'Experience with computer vision'
          ],
          location: 'San Francisco, CA',
          salary: '$180,000 - $250,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      prisma.role.create({
        data: {
          title: 'MLOps Engineer',
          companyId: companies[0].id,
          description: 'MLOps specialist at NeuraTech AI',
          requirements: [
            '3+ years of DevOps experience',
            'AWS and Kubernetes expertise',
            'Experience with ML pipelines'
          ],
          location: 'San Francisco, CA',
          salary: '$150,000 - $200,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      // CyberShield Security Roles
      prisma.role.create({
        data: {
          title: 'Security Architect',
          companyId: companies[1].id,
          description: 'Lead security architect at CyberShield',
          requirements: [
            '8+ years of security experience',
            'Expert in penetration testing',
            'Security auditing experience'
          ],
          location: 'New York, NY',
          salary: '$170,000 - $230,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      prisma.role.create({
        data: {
          title: 'Threat Intelligence Analyst',
          companyId: companies[1].id,
          description: 'Threat analysis specialist at CyberShield',
          requirements: [
            '5+ years of threat analysis',
            'Strong security background',
            'Experience with threat modeling'
          ],
          location: 'New York, NY',
          salary: '$140,000 - $190,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      // FinFlow Technologies Roles
      prisma.role.create({
        data: {
          title: 'Blockchain Developer',
          companyId: companies[2].id,
          description: 'Senior blockchain developer at FinFlow',
          requirements: [
            '4+ years of blockchain development',
            'Expert in Solidity and Web3.js',
            'Smart contract experience'
          ],
          location: 'London, UK',
          salary: '$160,000 - $220,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      prisma.role.create({
        data: {
          title: 'Quantitative Developer',
          companyId: companies[2].id,
          description: 'Quant developer at FinFlow',
          requirements: [
            '5+ years of quantitative development',
            'Strong Python and Java skills',
            'Financial markets experience'
          ],
          location: 'London, UK',
          salary: '$150,000 - $210,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      // HealthOS Systems Roles
      prisma.role.create({
        data: {
          title: 'Healthcare AI Engineer',
          companyId: companies[3].id,
          description: 'AI engineer specializing in healthcare',
          requirements: [
            '4+ years of ML experience',
            'Healthcare domain knowledge',
            'Python and TensorFlow expertise'
          ],
          location: 'Boston, MA',
          salary: '$160,000 - $220,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      prisma.role.create({
        data: {
          title: 'Senior Backend Engineer',
          companyId: companies[3].id,
          description: 'Senior backend developer at HealthOS',
          requirements: [
            '6+ years of backend development',
            'Node.js and Python expertise',
            'Healthcare API experience'
          ],
          location: 'Boston, MA',
          salary: '$150,000 - $200,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      prisma.role.create({
        data: {
          title: 'Data Integration Engineer',
          companyId: companies[3].id,
          description: 'Data integration specialist at HealthOS',
          requirements: [
            '4+ years of data integration',
            'ETL pipeline experience',
            'Healthcare data standards'
          ],
          location: 'Boston, MA',
          salary: '$140,000 - $190,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      }),
      prisma.role.create({
        data: {
          title: 'DevOps Engineer',
          companyId: companies[3].id,
          description: 'DevOps specialist at HealthOS',
          requirements: [
            '4+ years of DevOps experience',
            'AWS and Docker expertise',
            'CI/CD pipeline experience'
          ],
          location: 'Boston, MA',
          salary: '$140,000 - $190,000',
          type: RoleType.FULL_TIME,
          remote: true,
          visaSponsorship: true
        }
      })
    ])
    console.log('Roles created:', roles.map(r => r.title))

    // 5. Create RoleSkills to connect Roles and Skills
    console.log('Creating role-skill connections...')
    const roleSkills = await Promise.all([
      // Senior ML Engineer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[0].id,
          skillId: skills[10].id, // PyTorch
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[0].id,
          skillId: skills[11].id, // TensorFlow
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[0].id,
          skillId: skills[12].id, // Computer Vision
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // MLOps Engineer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[1].id,
          skillId: skills[7].id, // AWS
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[1].id,
          skillId: skills[8].id, // Docker
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[1].id,
          skillId: skills[9].id, // Kubernetes
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // Security Architect skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[2].id,
          skillId: skills[13].id, // Penetration Testing
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[2].id,
          skillId: skills[14].id, // Security Auditing
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // Threat Intelligence Analyst skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[3].id,
          skillId: skills[15].id, // Threat Analysis
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // Blockchain Developer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[4].id,
          skillId: skills[16].id, // Solidity
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[4].id,
          skillId: skills[17].id, // Smart Contracts
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[4].id,
          skillId: skills[18].id, // Web3.js
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // Healthcare AI Engineer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[6].id,
          skillId: skills[10].id, // PyTorch
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[6].id,
          skillId: skills[11].id, // TensorFlow
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // Senior Backend Engineer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[7].id,
          skillId: skills[0].id, // Node.js
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[7].id,
          skillId: skills[1].id, // Python
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // Data Integration Engineer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[8].id,
          skillId: skills[1].id, // Python
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      // DevOps Engineer skills
      prisma.roleSkill.create({
        data: {
          roleId: roles[9].id,
          skillId: skills[7].id, // AWS
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[9].id,
          skillId: skills[8].id, // Docker
          requiredLevel: SkillLevel.EXPERT
        }
      }),
      prisma.roleSkill.create({
        data: {
          roleId: roles[9].id,
          skillId: skills[9].id, // Kubernetes
          requiredLevel: SkillLevel.EXPERT
        }
      })
    ])
    console.log('Role-skill connections created successfully')

  } catch (error) {
    console.error('Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 