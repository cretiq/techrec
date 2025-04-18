export type RapidApiJob = {
  id: string;
  title: string;
  organization: string;
  locations_derived: string[];
  salary_raw: any;
  description: string;
  url: string;
  employment_type: string[];
  date_posted: string;
  organization_logo: string;
  remote_derived: boolean;
}

export type RapidApiResponse = RapidApiJob[]; 