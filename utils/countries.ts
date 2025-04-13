export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 code
  flag: string; // Emoji flag
}

export const countries: Country[] = [
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱' },
  // Add more countries as needed
];

// Optional: Map for quick lookup if needed elsewhere, though API needs codes directly
export const countryCodeToNameMap = new Map(countries.map(c => [c.code, c.name]));
export const countryNameToCodeMap = new Map(countries.map(c => [c.name.toLowerCase(), c.code])); 