// types/rapidapi.ts

interface PostalAddress {
  "@type": "PostalAddress";
  addressCountry: string;
  addressLocality: string | null;
  addressRegion: string | null;
  streetAddress: string | null;
}

interface Place {
  "@type": "Place";
  address: PostalAddress;
  latitude: number;
  longitude: number;
}

interface QuantitativeValue {
  "@type": "QuantitativeValue";
  minValue: number;
  maxValue: number;
  unitText: string;
}

interface MonetaryAmount {
  "@type": "MonetaryAmount";
  currency: string;
  value: QuantitativeValue;
}

interface LocationRequirement {
  "@type": "Country";
  name: string;
}

// Represents the structure of a single job object expected from the RapidAPI LinkedIn endpoint
export interface RapidApiJob {
  id: string;
  date_posted: string;
  date_created: string;
  title: string;
  organization: string;
  organization_url: string;
  date_validthrough: string;
  locations_raw: Place[];
  location_type: string | null;
  location_requirements_raw: LocationRequirement[] | null;
  salary_raw: MonetaryAmount | null;
  employment_type: string[];
  url: string;
  source_type: string;
  source: string;
  source_domain: string;
  organization_logo: string;
  cities_derived: string[] | null;
  regions_derived: string[] | null;
  countries_derived: string[];
  locations_derived: string[];
  timezones_derived: string[];
  lats_derived: number[];
  lngs_derived: number[];
  remote_derived: boolean;
  recruiter_name: string | null;
  recruiter_title: string | null;
  recruiter_url: string | null;
  linkedin_org_employees: number | null;
  linkedin_org_url: string;
  linkedin_org_size: string;
  linkedin_org_slogan: string | null;
  linkedin_org_industry: string;
  linkedin_org_followers: number | null;
  linkedin_org_headquarters: string;
  linkedin_org_type: string;
  linkedin_org_foundeddate: string;
  linkedin_org_specialties: string[];
  linkedin_org_locations: string[];
  linkedin_org_description: string;
  linkedin_org_recruitment_agency_derived: boolean;
}
