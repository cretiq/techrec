import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const commonSkills = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'React',
  'Angular',
  'Vue.js',
  'Next.js',
  'Node.js',
  'Express',
  'Django',
  'Flask',
  'Spring Boot',
  'Laravel',
  'Ruby on Rails',
  'GraphQL',
  'REST API',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'CI/CD',
  'Agile',
  'Scrum',
  'TDD',
  'DevOps',
  'Linux',
  'Shell Scripting',
  'HTML',
  'CSS',
  'SASS',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'Redux',
  'MobX',
  'Jest',
  'Cypress',
  'Webpack',
  'Babel',
  'ESLint',
  'Prettier',
  'Jira',
  'Confluence',
  'Slack',
  'Microsoft Teams',
  'Zoom',
  'Figma',
  'Adobe XD',
  'Sketch',
]

export function SkillsInput({ onAddSkill }: { onAddSkill: (skill: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 rounded-full px-3 gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search skills..."
            value={value}
            onValueChange={setValue}
          />
          <CommandEmpty>No skills found.</CommandEmpty>
          <CommandGroup>
            {commonSkills
              .filter((skill) =>
                skill.toLowerCase().includes(value.toLowerCase())
              )
              .map((skill) => (
                <CommandItem
                  key={skill}
                  value={skill}
                  onSelect={(currentValue) => {
                    onAddSkill(currentValue)
                    setValue('')
                    setOpen(false)
                  }}
                >
                  {skill}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 