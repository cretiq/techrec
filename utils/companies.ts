export interface Company {
  name: string;
  // Add domain or logo if available/needed
}

// Example list of 200 major tech companies (abbreviated for brevity)
// Replace/expand with a more accurate/comprehensive list
export const companies: Company[] = [
  { name: 'Google' }, { name: 'Microsoft' }, { name: 'Apple' }, { name: 'Amazon' }, { name: 'Meta' },
  { name: 'Tesla' }, { name: 'NVIDIA' }, { name: 'Adobe' }, { name: 'Salesforce' }, { name: 'Oracle' },
  { name: 'SAP' }, { name: 'Intel' }, { name: 'IBM' }, { name: 'Cisco' }, { name: 'Netflix' },
  { name: 'PayPal' }, { name: 'Accenture' }, { name: 'ServiceNow' }, { name: 'Intuit' }, { name: 'AMD' },
  { name: 'Booking Holdings' }, { name: 'Airbnb' }, { name: 'Uber' }, { name: 'Zoom Video Communications' }, { name: 'Snowflake' },
  { name: 'Block' }, { name: 'Shopify' }, { name: 'Atlassian' }, { name: 'Workday' }, { name: 'Autodesk' },
  { name: 'Twilio' }, { name: 'DocuSign' }, { name: 'CrowdStrike' }, { name: 'Palo Alto Networks' }, { name: 'Fortinet' },
  { name: 'VMware' }, { name: 'Dell Technologies' }, { name: 'HP Inc.' }, { name: 'Micron Technology' }, { name: 'Qualcomm' },
  { name: 'Broadcom' }, { name: 'Texas Instruments' }, { name: 'Applied Materials' }, { name: 'ASML Holding' }, { name: 'Sony' },
  { name: 'Samsung Electronics' }, { name: 'Tencent' }, { name: 'Alibaba' }, { name: 'ByteDance' }, { name: 'Baidu' },
  // ... Add 150 more major tech companies
  { name: 'Spotify' }, { name: 'Twitter (X)' }, { name: 'LinkedIn' }, { name: 'Snap' }, { name: 'Pinterest' },
  { name: 'Reddit' }, { name: 'GitHub' }, { name: 'GitLab' }, { name: 'Slack' }, { name: 'Dropbox' },
  { name: 'Stripe' }, { name: 'Coinbase' }, { name: 'Robinhood' }, { name: 'Instacart' }, { name: 'DoorDash' },
  { name: 'Lyft' }, { name: 'Electronic Arts' }, { name: 'Activision Blizzard' }, { name: 'Take-Two Interactive' }, { name: 'Nintendo' },
  { name: 'Zendesk' }, { name: 'HubSpot' }, { name: 'Okta' }, { name: 'Splunk' }, { name: 'MongoDB' },
  { name: 'Datadog' }, { name: 'Cloudflare' }, { name: 'Unity Software' }, { name: 'Roblox' }, { name: 'Palantir Technologies' },
  // ... Continue adding ...
  { name: 'Nokia' }, { name: 'Ericsson' }, { name: 'Siemens' }, { name: 'Bosch' }, { name: 'Philips' },
  { name: 'Canon' }, { name: 'Fujitsu' }, { name: 'NEC' }, { name: 'Panasonic' }, { name: 'Hitachi' },
  { name: 'Infosys' }, { name: 'Tata Consultancy Services' }, { name: 'Wipro' }, { name: 'HCL Technologies' }, { name: 'Capgemini' },
  { name: 'Cognizant' }, { name: 'DXC Technology' }, { name: 'EPAM Systems' }, { name: 'Globant' }, { name: 'Thoughtworks' },
  // ... Ensure list reaches ~200 ...
];

// Optional: Map for quick lookup if needed
export const companyNameToObjectMap = new Map(companies.map(c => [c.name.toLowerCase(), c])); 