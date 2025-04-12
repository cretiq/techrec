import { PrismaClient, Skill, SkillCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Common categories and their associated keywords
const categoryKeywords: Record<string, string[]> = {
  'Programming Languages': [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'scala', 'haskell', 'erlang', 'elixir', 'clojure', 'groovy', 'perl', 'r', 'matlab', 'lua', 'dart', 'f#',
    'objective-c', 'assembly', 'bash', 'powershell', 'sql', 'pl/sql', 't-sql', 'node.js', 'nodejs'
  ],
  'Frontend Development': [
    'react', 'vue', 'angular', 'svelte', 'html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'next.js',
    'gatsby', 'nuxt', 'remix', 'astro', 'webpack', 'vite', 'rollup', 'parcel', 'babel', 'eslint', 'prettier',
    'styled-components', 'emotion', 'chakra', 'material-ui', 'ant design', 'headless ui', 'radix ui',
    'three.js', 'd3.js', 'chart.js', 'framer motion', 'gsap', 'jquery', 'ui', 'ux', 'design', 'frontend'
  ],
  'Backend Development': [
    'node', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails', 'fastapi', 'nest.js',
    'koa', 'hapi', 'phoenix', 'play', 'akka', 'ktor', 'micronaut', 'quarkus', 'vert.x', 'gin', 'echo',
    'fiber', 'actix', 'rocket', 'axum', 'warp', 'tide', 'actix-web', 'rocket', 'axum', 'warp', 'tide',
    'backend', 'api', 'rest', 'graphql', 'grpc', 'websocket', 'microservices'
  ],
  'Web Development': [
    'web', 'web development', 'fullstack', 'full stack', 'full-stack', 'web app', 'web application',
    'website', 'web service', 'web api', 'web server', 'web framework', 'web platform'
  ],
  'Database': [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite', 'mariadb', 'cassandra', 'couchdb',
    'neo4j', 'dynamodb', 'firebase', 'supabase', 'prisma', 'typeorm', 'sequelize', 'mongoose', 'hibernate',
    'jpa', 'mybatis', 'sqlalchemy', 'diesel', 'doctrine', 'eloquent', 'realm', 'rethinkdb', 'influxdb',
    'timescaledb', 'couchbase', 'arangodb', 'faunadb', 'dgraph', 'janusgraph', 'orientdb'
  ],
  'DevOps & Cloud': [
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'jenkins', 'gitlab', 'github actions',
    'circleci', 'travis', 'argo', 'helm', 'istio', 'linkerd', 'prometheus', 'grafana', 'elk', 'splunk',
    'new relic', 'datadog', 'sentry', 'pagerduty', 'vault', 'consul', 'nomad', 'packer', 'vagrant',
    'puppet', 'chef', 'saltstack', 'nagios', 'zabbix', 'graylog', 'fluentd', 'logstash', 'kibana',
    'jaeger', 'zipkin', 'opentelemetry', 'cloudwatch', 'stackdriver', 'azure monitor', 'devops', 'cloud',
    'lambda', 'serverless', 'ci/cd', 'continuous integration', 'continuous deployment', 'container',
    'orchestration', 'infrastructure', 'deployment', 'scaling', 'monitoring', 'logging', 'alerting'
  ],
  'Testing': [
    'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'react testing library', 'enzyme', 'storybook',
    'playwright', 'puppeteer', 'testcafe', 'karma', 'jasmine', 'tape', 'ava', 'tap', 'vitest', 'supertest',
    'postman', 'insomnia', 'jmeter', 'gatling', 'locust', 'k6', 'artillery', 'chaos monkey', 'gremlin',
    'litmus', 'chaos blade', 'chaos mesh', 'chaos toolkit', 'qa', 'quality assurance', 'testing'
  ],
  'Mobile Development': [
    'react native', 'flutter', 'ios', 'android', 'xamarin', 'swift', 'kotlin', 'objective-c', 'java',
    'ionic', 'capacitor', 'cordova', 'phonegap', 'native script', 'expo', 'fastlane', 'appium',
    'detox', 'maestro', 'waldo', 'firebase test lab', 'testflight', 'play console', 'app store connect',
    'mobile', 'app development'
  ],
  'AI/ML': [
    'tensorflow', 'pytorch', 'scikit-learn', 'machine learning', 'deep learning', 'nlp', 'computer vision',
    'opencv', 'nltk', 'spacy', 'gensim', 'transformers', 'huggingface', 'langchain', 'llama', 'gpt',
    'stable diffusion', 'midjourney', 'dall-e', 'chatgpt', 'claude', 'gemini', 'palm', 'bert', 'gpt-3',
    'gpt-4', 'llama 2', 'mistral', 'falcon', 'anthropic', 'cohere', 'replicate', 'runway', 'reka',
    'ai', 'artificial intelligence', 'ml', 'neural networks', 'data science'
  ],
  'Security': [
    'owasp', 'penetration testing', 'vulnerability assessment', 'security audit', 'cryptography', 'ssl',
    'tls', 'jwt', 'oauth', 'openid', 'saml', 'ldap', 'kerberos', 'pki', 'certificates', 'vpn',
    'firewall', 'ids', 'ips', 'siem', 'soc', 'threat intelligence', 'malware analysis', 'reverse engineering',
    'forensics', 'incident response', 'security operations', 'compliance', 'gdpr', 'hipaa', 'pci dss',
    'iso 27001', 'nist', 'cis', 'mitre att&ck', 'zero trust', 'devsecops', 'security', 'cybersecurity'
  ],
  'Blockchain': [
    'ethereum', 'bitcoin', 'solidity', 'web3', 'smart contracts', 'defi', 'nft', 'metaverse', 'crypto',
    'hyperledger', 'fabric', 'sawtooth', 'besu', 'iroha', 'indy', 'burrow', 'quorum', 'polkadot',
    'cosmos', 'avalanche', 'near', 'algorand', 'tezos', 'cardano', 'stellar', 'ripple', 'chainlink',
    'uniswap', 'aave', 'compound', 'makerdao', 'curve', 'yearn', 'sushiswap', 'pancakeswap',
    'blockchain', 'web3', 'cryptocurrency'
  ],
  'Game Development': [
    'unity', 'unreal', 'godot', 'phaser', 'pixi.js', 'three.js', 'babylon.js', 'playcanvas', 'construct',
    'game maker', 'rpg maker', 'cocos2d', 'libgdx', 'monogame', 'love2d', 'sfml', 'sdl', 'opengl',
    'vulkan', 'directx', 'metal', 'webgl', 'webgpu', 'shaders', 'glsl', 'hlsl', 'wgsl', 'ray tracing',
    'physics', 'box2d', 'bullet', 'havok', 'physx', 'ai', 'pathfinding', 'a*', 'navmesh', 'behavior trees',
    'game', 'gaming', 'game development'
  ],
  'Embedded/IoT': [
    'arduino', 'raspberry pi', 'esp32', 'esp8266', 'stm32', 'nrf52', 'pic', 'avr', 'msp430', 'fpga',
    'verilog', 'vhdl', 'rtos', 'freertos', 'zephyr', 'mbed', 'contiki', 'riot', 'tinyos', 'mqtt',
    'coap', 'lwm2m', 'opc ua', 'modbus', 'can', 'i2c', 'spi', 'uart', 'gpio', 'pwm', 'adc', 'dac',
    'sensors', 'actuators', 'bluetooth', 'ble', 'zigbee', 'z-wave', 'thread', 'matter', 'homekit',
    'embedded', 'iot', 'internet of things'
  ],
  'Project Management': [
    'agile', 'scrum', 'kanban', 'waterfall', 'project management', 'product management', 'jira',
    'trello', 'asana', 'monday', 'basecamp', 'slack', 'teams', 'zoom', 'confluence', 'notion',
    'clickup', 'wrike', 'smartsheet', 'ms project', 'prince2', 'pmp', 'six sigma', 'lean',
    'product owner', 'scrum master', 'project manager', 'product manager', 'methodology'
  ],
  'Other': [] // Default category for unmatched skills
};

async function main() {
  try {
    console.log('Starting skill migration...');

    // 1. Get all skills and filter those without categories
    const allSkills = await prisma.skill.findMany({
      include: {
        category: true
      }
    });

    const uncategorizedSkills = allSkills.filter((skill: Skill & { category: SkillCategory | null }) => !skill.category);
    console.log(`Found ${uncategorizedSkills.length} uncategorized skills`);

    // 2. Get all existing categories
    const existingCategories = await prisma.skillCategory.findMany();
    console.log(`Found ${existingCategories.length} existing categories`);

    // 3. Process each uncategorized skill
    for (const skill of uncategorizedSkills) {
      const skillName = skill.name.toLowerCase();
      let matchedCategory = null;
      let matchType = '';
      let bestMatchScore = 0;

      // First check if skill name contains any category name
      for (const category of existingCategories) {
        const categoryName = category.name.toLowerCase();
        const score = skillName.includes(categoryName) ? categoryName.length : 0;
        if (score > bestMatchScore) {
          matchedCategory = category;
          matchType = 'category name match';
          bestMatchScore = score;
        }
      }

      // If no match found, check against keyword categories
      if (!matchedCategory) {
        for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
          for (const keyword of keywords) {
            const normalizedKeyword = keyword.toLowerCase();
            const score = skillName.includes(normalizedKeyword) ? normalizedKeyword.length : 0;
            if (score > bestMatchScore) {
              // Find or create the category
              matchedCategory = await prisma.skillCategory.upsert({
                where: { name: categoryName },
                update: {},
                create: {
                  name: categoryName,
                  description: `Automatically created category for ${categoryName} skills`
                }
              });
              matchType = 'keyword match';
              bestMatchScore = score;
            }
          }
        }
      }

      // If still no match, use 'Other' category
      if (!matchedCategory) {
        matchedCategory = await prisma.skillCategory.upsert({
          where: { name: 'Other' },
          update: {},
          create: {
            name: 'Other',
            description: 'Skills without a specific category'
          }
        });
        matchType = 'default category';
      }

      // Update the skill with the matched category
      await prisma.skill.update({
        where: { id: skill.id },
        data: {
          categoryId: matchedCategory.id
        }
      });

      console.log(`Updated skill "${skill.name}" with category "${matchedCategory.name}" (${matchType})`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test function to verify categorization
async function testCategorization() {
  try {
    const testSkills = [
      'React.js',
      'Node.js',
      'Python',
      'AWS Lambda',
      'Docker',
      'Kubernetes',
      'Machine Learning',
      'Data Science',
      'Web Development',
      'Mobile App Development',
      'DevOps',
      'Cloud Computing',
      'Cybersecurity',
      'Blockchain',
      'Game Development',
      'IoT',
      'Embedded Systems',
      'UI/UX Design',
      'Product Management',
      'Agile Methodology'
    ];

    console.log('\nTesting skill categorization:');
    for (const skillName of testSkills) {
      const skillNameLower = skillName.toLowerCase();
      let matchedCategory = null;
      let matchType = '';
      let bestMatchScore = 0;

      // Check against existing categories
      const existingCategories = await prisma.skillCategory.findMany();
      for (const category of existingCategories) {
        const categoryName = category.name.toLowerCase();
        const score = skillNameLower.includes(categoryName) ? categoryName.length : 0;
        if (score > bestMatchScore) {
          matchedCategory = category;
          matchType = 'category name match';
          bestMatchScore = score;
        }
      }

      // Check against keyword categories
      if (!matchedCategory) {
        for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
          for (const keyword of keywords) {
            const normalizedKeyword = keyword.toLowerCase();
            const score = skillNameLower.includes(normalizedKeyword) ? normalizedKeyword.length : 0;
            if (score > bestMatchScore) {
              matchedCategory = { name: categoryName };
              matchType = 'keyword match';
              bestMatchScore = score;
            }
          }
        }
      }

      // Default to 'Other' if no match
      if (!matchedCategory) {
        matchedCategory = { name: 'Other' };
        matchType = 'default category';
      }

      console.log(`Skill: "${skillName}" -> Category: "${matchedCategory.name}" (${matchType})`);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run both the migration and test
main().then(() => testCategorization()); 