import pdf from 'pdf-creator-node'
import { writeFileSync } from 'fs'
import { join } from 'path'

async function generateTestPDF() {
  // Create HTML template
  const html = `
    <h1 style="text-align: center;">Test CV Content</h1>
    
    <h2>Skills:</h2>
    <ul>
      <li>JavaScript</li>
      <li>React</li>
      <li>Node.js</li>
      <li>TypeScript</li>
      <li>Python</li>
    </ul>

    <h2>Experience:</h2>
    <p>Software Engineer at Test Company<br>
    2020 - Present</p>
    <ul>
      <li>Developed web applications using React and Node.js</li>
      <li>Implemented RESTful APIs</li>
      <li>Worked with cloud services</li>
    </ul>

    <h2>Education:</h2>
    <p>Bachelor's in Computer Science<br>
    Test University<br>
    2016 - 2020</p>

    <h2>Achievements:</h2>
    <ul>
      <li>Won Best Project Award 2021</li>
      <li>Published research paper on AI</li>
      <li>Open source contributor</li>
    </ul>
  `

  // Write HTML template to file
  const templatePath = join(process.cwd(), 'test-template.html')
  writeFileSync(templatePath, html)

  const document = {
    html: html,
    data: {},
    path: join(process.cwd(), 'test.pdf'),
    type: 'buffer',
  }

  const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
  }

  try {
    await pdf.create(document, options)
    console.log('Test PDF generated successfully!')
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

generateTestPDF() 