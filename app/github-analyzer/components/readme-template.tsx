"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ReadmeTemplateProps {
  repositoryName: string
  onGenerate: (template: string) => void
}

const DEFAULT_TEMPLATE = `# {{name}}

{{description}}

## Overview

This repository contains a {{language}} project.

## Stats

- Stars: {{stars}}
- Forks: {{forks}}
{{#if license}}
- License: {{license}}
{{/if}}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

[Add usage instructions here]

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

{{#if license}}
This project is licensed under the {{license}} License - see the [LICENSE](LICENSE) file for details.
{{else}}
[Add license information here]
{{/if}}
`

const TEMPLATES = {
  default: DEFAULT_TEMPLATE,
  minimal: `# {{name}}

{{description}}

## Installation

\`\`\`bash
npm install
\`\`\`

## License

{{#if license}}
{{license}}
{{else}}
[Add license information here]
{{/if}}
`,
  detailed: `# {{name}}

{{description}}

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Testing](#testing)
- [License](#license)

## Overview

This is a {{language}} project with {{stars}} stars and {{forks}} forks.

## Features

[Add key features here]

## Installation

### Prerequisites

- Node.js (version X.X.X)
- npm or yarn

### Steps

\`\`\`bash
# Clone the repository
git clone [repository URL]

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
\`\`\`

## Usage

[Add detailed usage instructions here]

## API Documentation

[Add API documentation here]

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## Testing

\`\`\`bash
npm test
\`\`\`

## License

{{#if license}}
This project is licensed under the {{license}} License - see the [LICENSE](LICENSE) file for details.
{{else}}
[Add license information here]
{{/if}}
`,
}

export function ReadmeTemplate({ repositoryName, onGenerate }: ReadmeTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [customTemplate, setCustomTemplate] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  const handleGenerate = () => {
    onGenerate(isCustom ? customTemplate : TEMPLATES[selectedTemplate as keyof typeof TEMPLATES])
  }

  const templateVariables = [
    "name",
    "description",
    "language",
    "stars",
    "forks",
    "license",
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Generate README</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate README for {repositoryName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex gap-4">
            <Button
              variant={!isCustom ? "default" : "outline"}
              onClick={() => setIsCustom(false)}
            >
              Use Template
            </Button>
            <Button
              variant={isCustom ? "default" : "outline"}
              onClick={() => setIsCustom(true)}
            >
              Custom Template
            </Button>
          </div>

          {!isCustom ? (
            <div className="grid gap-4">
              <div className="flex gap-4">
                {Object.keys(TEMPLATES).map((template) => (
                  <Button
                    key={template}
                    variant={selectedTemplate === template ? "default" : "outline"}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </Button>
                ))}
              </div>
              <Card className="p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]}
                </pre>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4">
              <Textarea
                value={customTemplate}
                onChange={(e) => setCustomTemplate(e.target.value)}
                placeholder="Enter your custom README template..."
                className="h-[400px] font-mono"
              />
              <div className="text-sm text-gray-500">
                Available variables:{" "}
                {templateVariables.map((variable, index) => (
                  <span key={variable}>
                    {index > 0 && ", "}
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleGenerate}>Generate README</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 