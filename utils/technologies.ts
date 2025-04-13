import { Code, Database, Cloud, Bot, GitBranch, Cpu } from 'lucide-react'; // Example icons

export interface Technology {
  name: string; // Display name
  slug: string; // Slug expected by TheirStack API (job_technology_slug_or)
  icon?: React.ElementType; // Optional icon component
}

// Example hardcoded list - Expand this significantly based on common tech
export const technologies: Technology[] = [
  { name: 'JavaScript', slug: 'javascript', icon: Code },
  { name: 'TypeScript', slug: 'typescript', icon: Code },
  { name: 'React', slug: 'react', icon: Code },
  { name: 'Node.js', slug: 'nodejs', icon: Code },
  { name: 'Python', slug: 'python', icon: Code },
  { name: 'Java', slug: 'java', icon: Code },
  { name: 'Go', slug: 'golang', icon: Code }, // Note slug difference
  { name: 'SQL', slug: 'sql', icon: Database },
  { name: 'PostgreSQL', slug: 'postgresql', icon: Database },
  { name: 'MongoDB', slug: 'mongodb', icon: Database },
  { name: 'AWS', slug: 'aws', icon: Cloud },
  { name: 'Google Cloud', slug: 'google-cloud', icon: Cloud },
  { name: 'Azure', slug: 'azure', icon: Cloud },
  { name: 'Docker', slug: 'docker', icon: Cpu },
  { name: 'Kubernetes', slug: 'kubernetes', icon: Cpu },
  { name: 'Git', slug: 'git', icon: GitBranch },
  { name: 'Terraform', slug: 'terraform', icon: Cloud },
  { name: 'Machine Learning', slug: 'machine-learning', icon: Bot },
  { name: 'C++', slug: 'c-plus-plus', icon: Code },
  { name: 'Ruby', slug: 'ruby', icon: Code },
  { name: 'PHP', slug: 'php', icon: Code },
  { name: 'Swift', slug: 'swift', icon: Code },
  { name: 'Kotlin', slug: 'kotlin', icon: Code },
  { name: 'Angular', slug: 'angular', icon: Code },
  { name: 'Vue.js', slug: 'vuejs', icon: Code },
  // Add many more...
];

// Optional: Map for quick lookup
export const technologySlugToNameMap = new Map(technologies.map(t => [t.slug, t.name]));
export const technologyNameToSlugMap = new Map(technologies.map(t => [t.name.toLowerCase(), t.slug])); 