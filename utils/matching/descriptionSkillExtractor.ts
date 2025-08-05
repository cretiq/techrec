// utils/matching/descriptionSkillExtractor.ts
// Extract technical skills from job descriptions using pattern matching

import {
  normalizeSkillName,
  isValidSkillName,
  cleanSkillName,
  skillAliases
} from './skillTaxonomy';

// Common technical skill patterns for extraction
const SKILL_PATTERNS = [
  // Programming Languages
  /\b(?:JavaScript|TypeScript|Python|Java|C#|C\+\+|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|Clojure|Erlang|Elixir|Haskell|F#|VB\.NET|Perl|R|MATLAB|SAS|Julia)\b/gi,
  
  // Frontend Frameworks/Libraries
  /\b(?:React|Angular|Vue(?:\.js)?|Svelte|Ember(?:\.js)?|Backbone(?:\.js)?|jQuery|Bootstrap|Tailwind(?:CSS)?|Material-?UI|Ant Design|Chakra UI)\b/gi,
  
  // Backend Frameworks
  /\b(?:Express(?:\.js)?|Node(?:\.js)?|Django|Flask|FastAPI|Spring|Laravel|Rails|ASP\.NET|Phoenix|Koa|Fastify|NestJS)\b/gi,
  
  // Databases
  /\b(?:MySQL|PostgreSQL|Postgres|MongoDB|Redis|SQLite|Oracle|SQL Server|MariaDB|CouchDB|Cassandra|DynamoDB|Neo4j|InfluxDB|Elasticsearch)\b/gi,
  
  // Cloud Platforms
  /\b(?:AWS|Azure|Google Cloud|GCP|DigitalOcean|Heroku|Vercel|Netlify|Firebase|Supabase)\b/gi,
  
  // DevOps/Tools
  /\b(?:Docker|Kubernetes|Jenkins|GitLab CI|GitHub Actions|Travis CI|CircleCI|Ansible|Terraform|Vagrant|Nginx|Apache|K8s)\b/gi,
  
  // Version Control
  /\b(?:Git|SVN|Mercurial|Bazaar)\b/gi,
  
  // Testing
  /\b(?:Jest|Mocha|Cypress|Selenium|Puppeteer|Playwright|JUnit|PyTest|RSpec|PHPUnit)\b/gi,
  
  // Mobile
  /\b(?:React Native|Flutter|Xamarin|Ionic|Cordova|PhoneGap|Swift|Kotlin|Objective-C)\b/gi,
  
  // Data/ML
  /\b(?:TensorFlow|PyTorch|Pandas|NumPy|Scikit-learn|Keras|OpenCV|Matplotlib|Seaborn|Jupyter|Apache Spark|Hadoop)\b/gi,
  
  // Design/CSS
  /\b(?:CSS|SCSS|Sass|Less|Stylus|PostCSS|Figma|Sketch|Adobe XD|Photoshop|Illustrator)\b/gi,
  
  // Other Technologies
  /\b(?:GraphQL|REST|SOAP|gRPC|WebSocket|JSON|XML|YAML|Markdown|LaTeX)\b/gi,
  
  // Methodologies/Concepts
  /\b(?:Agile|Scrum|Kanban|DevOps|CI\/CD|TDD|BDD|MVC|MVP|MVVM|Microservices|Serverless|JAMstack)\b/gi,
];

// Additional patterns for skill variations
const SKILL_VARIATION_PATTERNS = [
  // React ecosystem
  /\b(?:ReactJS|React\.js|Redux|MobX|Recoil|Context API|React Router|Next\.js|NextJS|Gatsby)\b/gi,
  
  // Node.js ecosystem  
  /\b(?:NodeJS|Node\.js|npm|yarn|pnpm|Express|Koa|Fastify|NestJS)\b/gi,
  
  // JavaScript variations
  /\b(?:JS|ES6|ES2015|ES2017|ES2018|ES2019|ES2020|ES2021|ES2022|ECMAScript)\b/gi,
  
  // TypeScript variations
  /\b(?:TS|Type Script)\b/gi,
  
  // Database variations
  /\b(?:Postgres|Mongo|SQL|NoSQL|RDBMS)\b/gi,
  
  // Cloud variations
  /\b(?:Amazon Web Services|Microsoft Azure|Google Cloud Platform)\b/gi,
];

// Common requirement keywords that indicate skills
const REQUIREMENT_KEYWORDS = [
  'experience with',
  'knowledge of',
  'proficient in',
  'skilled in',
  'familiar with',
  'expertise in',
  'working knowledge of',
  'strong background in',
  'competency in',
  'understanding of',
  'hands-on experience with',
  'proven experience in',
  'solid understanding of',
  'deep knowledge of',
  'expert level',
  'advanced level',
  'intermediate level',
  'beginner level',
  'must know',
  'required:',
  'requirements:',
  'tech stack:',
  'technologies:',
  'tools:',
  'frameworks:',
  'languages:'
];

/**
 * Extract technical skills from a job description
 * @param description - The job description text
 * @returns Array of extracted skill names
 */
export function extractSkillsFromDescription(description: string): string[] {
  if (!description || typeof description !== 'string') {
    return [];
  }

  const extractedSkills = new Set<string>();
  const normalizedDescription = description.toLowerCase();

  // Apply all skill patterns
  const allPatterns = [...SKILL_PATTERNS, ...SKILL_VARIATION_PATTERNS];
  
  for (const pattern of allPatterns) {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanedSkill = cleanSkillName(match);
        if (isValidSkillName(cleanedSkill)) {
          // Normalize the skill to its canonical form
          const normalized = normalizeSkillName(cleanedSkill);
          extractedSkills.add(normalized);
        }
      });
    }
  }

  // Look for skills mentioned after requirement keywords
  for (const keyword of REQUIREMENT_KEYWORDS) {
    const keywordIndex = normalizedDescription.indexOf(keyword.toLowerCase());
    if (keywordIndex !== -1) {
      // Extract text after the keyword (next 100 characters)
      const textAfterKeyword = description.slice(keywordIndex + keyword.length, keywordIndex + keyword.length + 100);
      
      // Apply skill patterns to this specific section
      for (const pattern of allPatterns) {
        const matches = textAfterKeyword.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleanedSkill = cleanSkillName(match);
            if (isValidSkillName(cleanedSkill)) {
              const normalized = normalizeSkillName(cleanedSkill);
              extractedSkills.add(normalized);
            }
          });
        }
      }
    }
  }

  // Additional extraction for comma-separated lists
  extractCommaSeparatedSkills(description, extractedSkills);

  return Array.from(extractedSkills).filter(skill => skill.length > 1);
}

/**
 * Extract skills from comma-separated lists in descriptions
 * @param description - The job description text
 * @param extractedSkills - Set to add extracted skills to
 */
function extractCommaSeparatedSkills(description: string, extractedSkills: Set<string>): void {
  // Look for patterns like "Experience with: React, Node.js, TypeScript"
  const listPatterns = [
    /(?:experience with|knowledge of|proficient in|skilled in|familiar with|expertise in)[:\s]+([^\.]+)/gi,
    /(?:technologies|tools|frameworks|languages)[:\s]+([^\.]+)/gi,
    /(?:tech stack|technology stack)[:\s]+([^\.]+)/gi,
    /(?:requirements|required)[:\s]+([^\.]+)/gi
  ];

  for (const pattern of listPatterns) {
    const matches = [...description.matchAll(pattern)];
    for (const match of matches) {
      if (match[1]) {
        // Split by common separators
        const items = match[1].split(/[,;|&\n]/).map(item => item.trim());
        
        for (const item of items) {
          // Check if this item matches any known skills
          const cleanedItem = cleanSkillName(item);
          if (isValidSkillName(cleanedItem) && cleanedItem.length <= 30) {
            // Check against skill aliases
            for (const alias of skillAliases) {
              if (alias.aliases.some(a => a.toLowerCase() === cleanedItem.toLowerCase()) ||
                  alias.canonical.toLowerCase() === cleanedItem.toLowerCase()) {
                extractedSkills.add(alias.canonical);
                break;
              }
            }
            
            // Also add normalized version
            const normalized = normalizeSkillName(cleanedItem);
            if (normalized !== cleanedItem) {
              extractedSkills.add(normalized);
            }
          }
        }
      }
    }
  }
}

/**
 * Extract years of experience mentioned with skills
 * @param description - The job description text
 * @returns Array of skills with experience requirements
 */
export function extractSkillsWithExperience(description: string): Array<{
  skill: string;
  yearsRequired: number;
}> {
  const skillsWithExperience: Array<{ skill: string; yearsRequired: number }> = [];
  
  // Pattern to match "X+ years of Y" or "X years experience with Y"  
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience\s*)?(?:with\s*|in\s*|using\s*)([a-zA-Z\.\s\-]+)(?:\s*(?:and|,|\.|$))/gi,
    /(\d+)\+?\s*years?\s*([a-zA-Z\.\s\-]+)\s*(?:experience|development)(?:\s*(?:and|,|\.|$))/gi,
    /minimum\s*(\d+)\+?\s*years?\s*(?:with\s*|in\s*|of\s*)([a-zA-Z\.\s\-]+)(?:\s*(?:and|,|\.|$))/gi,
    /at\s*least\s*(\d+)\+?\s*years?\s*(?:with\s*|in\s*|of\s*)([a-zA-Z\.\s\-]+)(?:\s*(?:and|,|\.|$))/gi
  ];

  for (const pattern of experiencePatterns) {
    const matches = [...description.matchAll(pattern)];
    for (const match of matches) {
      const years = parseInt(match[1]);
      const skillText = match[2].trim();
      
      if (years > 0 && years <= 20 && skillText) {
        // Extract potential skills from the skill text
        const extractedSkills = extractSkillsFromDescription(skillText);
        for (const skill of extractedSkills) {
          skillsWithExperience.push({ skill, yearsRequired: years });
        }
      }
    }
  }

  return skillsWithExperience;
}

/**
 * Score how skill-rich a description is
 * @param description - The job description text
 * @returns Score from 0-100 indicating how many technical skills are mentioned
 */
export function scoreDescriptionSkillRichness(description: string): number {
  if (!description) return 0;
  
  const extractedSkills = extractSkillsFromDescription(description);
  const uniqueSkills = new Set(extractedSkills);
  
  // Score based on number of unique skills found
  // 0-2 skills: low score
  // 3-5 skills: medium score  
  // 6+ skills: high score
  const skillCount = uniqueSkills.size;
  
  if (skillCount === 0) return 0;
  if (skillCount <= 2) return Math.min(30, skillCount * 15);
  if (skillCount <= 5) return Math.min(60, 30 + (skillCount - 2) * 10);
  return Math.min(100, 60 + (skillCount - 5) * 8);
}

/**
 * Extract skill categories from description
 * @param description - The job description text
 * @returns Object with skills grouped by categories
 */
export function categorizeExtractedSkills(description: string): {
  programming: string[];
  frontend: string[];
  backend: string[];
  database: string[];
  cloud: string[];
  devops: string[];
  mobile: string[];
  design: string[];
  other: string[];
} {
  const extractedSkills = extractSkillsFromDescription(description);
  
  const categories = {
    programming: [] as string[],
    frontend: [] as string[],
    backend: [] as string[],
    database: [] as string[],
    cloud: [] as string[],
    devops: [] as string[],
    mobile: [] as string[],
    design: [] as string[],
    other: [] as string[]
  };

  // Define skill category mappings
  const categoryMappings = {
    programming: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'],
    frontend: ['React', 'Angular', 'Vue.js', 'Svelte', 'jQuery', 'Bootstrap', 'TailwindCSS', 'CSS', 'HTML'],
    backend: ['Node.js', 'Express.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'ASP.NET'],
    database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'SQL'],
    cloud: ['AWS', 'Azure', 'Google Cloud', 'Firebase', 'Heroku', 'Vercel', 'Netlify'],
    devops: ['Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD', 'Ansible', 'Terraform'],
    mobile: ['React Native', 'Flutter', 'Xamarin', 'Ionic', 'Swift', 'Kotlin'],
    design: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'CSS', 'SCSS']
  };

  for (const skill of extractedSkills) {
    let categorized = false;
    
    for (const [category, skillList] of Object.entries(categoryMappings)) {
      if (skillList.some(s => s.toLowerCase() === skill.toLowerCase())) {
        (categories[category as keyof typeof categories] as string[]).push(skill);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.other.push(skill);
    }
  }

  return categories;
}