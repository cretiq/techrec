'use client';

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, X, Code, BarChart, Bookmark, BookmarkCheck, Send, Plus, PenTool } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MultipleCombobox, ComboboxOption } from "@/components/ui/combobox";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { Slider } from "@/components/ui/slider";

// Centralized Imports
import { Role, Country, Technology, Company as CompanyType } from "@/types"; // Import central types
import { formatJobType } from "@/utils/mappers"; // Import central mapper

// Data for Filters (Keep these imports for options)
import { countries } from "@/utils/countries";
import { technologies } from "@/utils/technologies";
import { companies } from "@/utils/companies";

// RoleCard component
const RoleCard = ({ role, onSave, isSaved }: { role: Role, onSave: (role: Role) => void, isSaved: boolean }) => { // Added onSave and isSaved props
  const router = useRouter();
  const { data: session } = useSession();

  const handleWriteTo = () => {
    const roleData = encodeURIComponent(JSON.stringify(role));
    router.push(`/developer/writing-help?roleData=${roleData}`);
  };

  const hasSkillsOrRequirements = (role.requirements && role.requirements.length > 0) || (role.skills && role.skills.length > 0);

  return (
    <Card
      key={role.id}
      className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up flex flex-col h-full relative" // Added relative positioning
      style={{ animationDelay: `100ms` }}
    >
      {/* Save Button - Positioned Top Right */} 
      {session && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSave(role)} // Call onSave prop
            className="absolute top-2 right-2 text-muted-foreground hover:text-primary shrink-0 z-10" // Positioned
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" /> // Indicate saved
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
      )}

      <CardHeader className="pb-4 pr-10"> {/* Added padding-right to avoid overlap */} 
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl line-clamp-2">{role.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span className="line-clamp-1">{role.company.name}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <MapPin className="mr-1 h-3 w-3" />
            <span className="line-clamp-1">{role.location}</span>
          </Badge>
          <Badge variant="secondary">
            <Briefcase className="mr-1 h-3 w-3" />
            {formatJobType(role.type)} {/* Use central mapper */}
          </Badge>
          {role.remote && (
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Remote
            </Badge>
          )}
          {role.visaSponsorship && ( // Added Visa Sponsorship badge
              <Badge variant="secondary">
                  <Code className="mr-1 h-3 w-3" />
                  Visa Sponsorship
              </Badge>
          )}
        </div>
        {/* Use prose for markdown description */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-3">
            <ReactMarkdown>{role.description}</ReactMarkdown>
        </div>
        {hasSkillsOrRequirements && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Skills/Technologies:</h4>
            <div className="flex flex-wrap gap-2">
              {/* Display requirements if they exist */}
              {role.requirements?.map((req, index) => (
                <Badge key={`${role.id}-req-${index}`} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
              {/* Display structured skills if they exist */}
              {role.skills?.map((skill) => (
                <Badge key={skill.id} variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/50">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 mt-auto">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <div className="flex flex-col gap-2 w-full">
              <div className="text-md font-semibold">{role.salary || 'Salary Unspecified'}</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWriteTo} // Use handler to navigate with data
                  className="gap-1"
                  disabled={!session} // Disable if not logged in
                  title={!session ? "Login to use Writing Help" : "Get writing assistance"}
                >
                  <PenTool className="h-4 w-4" /> Write to
                </Button>
                <Button size="sm" variant="outline" onClick={() => role.url && window.open(role.url, '_blank')} disabled={!role.url}>
                  View Job <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// --- Prepare options for Comboboxes --- 
// Explicitly type the source arrays
const typedCountries: Country[] = countries;
const typedTechnologies: Technology[] = technologies;
const typedCompanies: CompanyType[] = companies; // Use CompanyType alias to avoid conflict

const countryOptions: ComboboxOption[] = typedCountries.map(c => ({
  value: c.code, // Use code as value
  label: c.name,
  icon: <span className="mr-2">{c.flag}</span>
}));

const technologyOptions: ComboboxOption[] = typedTechnologies.map(t => ({
  value: t.slug, // Use slug as value
  label: t.name,
  icon: t.icon ? React.createElement(t.icon, { className: "mr-2 h-4 w-4 opacity-50" }) : null
}));

const companyOptions: ComboboxOption[] = typedCompanies.map(c => ({
  value: c.name, // Use name as value (assuming name is unique enough for filtering)
  label: c.name
}));

export default function RolesSearchPage() {
  // --- State ---
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [customTechnologies, setCustomTechnologies] = useState<string>("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [customCompanies, setCustomCompanies] = useState<string>("");
  const [isRemote, setIsRemote] = useState<boolean | undefined>(undefined);
  const [results, setResults] = useState<Role[]>([]); // Use central Role type
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCustomRoleIds, setSavedCustomRoleIds] = useState<Set<string>>(new Set()); // Track saved custom role IDs
  const [savingStates, setSavingStates] = useState<{[key: string]: boolean}>({}); // Track saving state per card
  const [postedAtMaxAgeDays, setPostedAtMaxAgeDays] = useState<number>(90);

  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session status

  // --- localStorage Keys ---
  const LS_PREFIX = 'roleSearch_';
  const LS_INPUT = LS_PREFIX + 'input';
  const LS_COUNTRIES = LS_PREFIX + 'countries';
  const LS_TECHNOLOGIES = LS_PREFIX + 'technologies';
  const LS_CUSTOM_TECHNOLOGIES = LS_PREFIX + 'customTechnologies';
  const LS_COMPANIES = LS_PREFIX + 'companies';
  const LS_CUSTOM_COMPANIES = LS_PREFIX + 'customCompanies';
  const LS_REMOTE = LS_PREFIX + 'remote';
  const LS_RESULTS = LS_PREFIX + 'results';
  const LS_POSTED_AT_MAX_AGE_DAYS = LS_PREFIX + 'postedAtMaxAgeDays';

  // --- Load state from localStorage and fetch saved custom roles ---
  useEffect(() => {
    // Load search state
    try {
        setSearchInput(localStorage.getItem(LS_INPUT) || "");
        setSelectedCountries(JSON.parse(localStorage.getItem(LS_COUNTRIES) || '[]'));
        setSelectedTechnologies(JSON.parse(localStorage.getItem(LS_TECHNOLOGIES) || '[]'));
        setCustomTechnologies(localStorage.getItem(LS_CUSTOM_TECHNOLOGIES) || "");
        setSelectedCompanies(JSON.parse(localStorage.getItem(LS_COMPANIES) || '[]'));
        setCustomCompanies(localStorage.getItem(LS_CUSTOM_COMPANIES) || "");
        const remoteValue = localStorage.getItem(LS_REMOTE);
        setIsRemote(remoteValue === null ? undefined : remoteValue === 'true');
        const storedResults = localStorage.getItem(LS_RESULTS);
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        }
        const storedMaxAgeDays = localStorage.getItem(LS_POSTED_AT_MAX_AGE_DAYS);
        if (storedMaxAgeDays) {
          setPostedAtMaxAgeDays(parseInt(storedMaxAgeDays, 10));
        }
    } catch (e) {
        console.error("Failed to load search state from localStorage", e);
        // Clear potentially corrupted storage
        localStorage.removeItem(LS_INPUT);
        localStorage.removeItem(LS_COUNTRIES);
        localStorage.removeItem(LS_TECHNOLOGIES);
        localStorage.removeItem(LS_CUSTOM_TECHNOLOGIES);
        localStorage.removeItem(LS_COMPANIES);
        localStorage.removeItem(LS_CUSTOM_COMPANIES);
        localStorage.removeItem(LS_REMOTE);
        localStorage.removeItem(LS_RESULTS);
    }

    // Fetch saved custom roles if logged in
    const fetchSavedCustomRoles = async () => {
      if (session?.user?.email) { // Check for user email as indicator of valid session
        try {
          const response = await fetch('/api/custom-roles'); // Assuming GET returns user's custom roles
          if (response.ok) {
            const customRoles = await response.json();
            // Assuming API returns roles with an 'externalId' or similar field matching the search result ID
            // Or we store the original search ID when saving. Let's assume we store the database IDs. A better approach is needed to match search results to saved custom roles.
            // **Temporary:** Store the database IDs for now. A more robust matching mechanism is needed.
            setSavedCustomRoleIds(new Set(customRoles.map((r: any) => r.id))); 
          } else {
            console.error("Failed to fetch saved custom roles");
          }
        } catch (error) {
          console.error("Error fetching saved custom roles:", error);
        }
      }
    };

    if (status === 'authenticated') {
        fetchSavedCustomRoles();
    }

  }, [status, session]); // Depend on session status

  // --- Save state to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(LS_INPUT, searchInput);
      localStorage.setItem(LS_COUNTRIES, JSON.stringify(selectedCountries));
      localStorage.setItem(LS_TECHNOLOGIES, JSON.stringify(selectedTechnologies));
      localStorage.setItem(LS_CUSTOM_TECHNOLOGIES, customTechnologies);
      localStorage.setItem(LS_COMPANIES, JSON.stringify(selectedCompanies));
      localStorage.setItem(LS_CUSTOM_COMPANIES, customCompanies);
      if (isRemote === undefined) {
        localStorage.removeItem(LS_REMOTE);
      } else {
        localStorage.setItem(LS_REMOTE, String(isRemote));
      }
      // Avoid storing huge result sets if they become very large
      if (results.length < 50) { // Limit stored results
          localStorage.setItem(LS_RESULTS, JSON.stringify(results));
      } else {
          localStorage.removeItem(LS_RESULTS); // Avoid storing large results
      }
      localStorage.setItem(LS_POSTED_AT_MAX_AGE_DAYS, postedAtMaxAgeDays.toString());
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
      // Don't toast excessively here
    }
  }, [searchInput, selectedCountries, selectedTechnologies, customTechnologies, selectedCompanies, customCompanies, isRemote, results, postedAtMaxAgeDays]);

  // --- Search Handler ---
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (searchInput.trim()) params.append('query', searchInput.trim());
    if (selectedCountries.length > 0) params.append('countries', selectedCountries.join(','));

    const allTechnologies = [
      ...selectedTechnologies,
      ...customTechnologies.split(',').map(t => t.trim()).filter(Boolean)
    ];
    if (allTechnologies.length > 0) params.append('technologies', allTechnologies.join(','));

    const allCompanies = [
      ...selectedCompanies,
      ...customCompanies.split(',').map(c => c.trim()).filter(Boolean)
    ];
    if (allCompanies.length > 0) params.append('companies', allCompanies.join(','));

    if (isRemote !== undefined) params.append('remote', String(isRemote));
    params.append('posted_at_max_age_days', postedAtMaxAgeDays.toString());

    if (!params.toString()) {
        toast({ title: "Please enter search criteria" });
        setLoading(false);
        setResults([]);
        localStorage.removeItem(LS_RESULTS); // Clear stored results on empty search
        return;
    }

    try {
      const response = await fetch(`/api/roles/search?${params.toString()}`);
      if (!response.ok) {
        let errorMsg = `Error: ${response.status}`;
        let errorDetails: any = null;
        try {
          const errData = await response.json();
          errorMsg = errData.error || `API Error: ${response.status}`;
          errorDetails = errData.details; 
        } catch (e) { /* Ignore */ }

        if (response.status === 422 && errorDetails && Array.isArray(errorDetails)) {
            const validationSummary = errorDetails
                .map(d => `${d.field}: ${d.message}`)
                .join(', ');
            errorMsg = `Invalid Parameters: ${validationSummary}`;
            toast({ title: "Invalid Search", description: validationSummary, variant: "destructive" });
        } else {
            toast({ title: "Search Failed", description: errorMsg, variant: "destructive" });
        }
        throw new Error(errorMsg);
      }

      const data: Role[] = await response.json();
      setResults(data);
      if (data.length === 0) {
        toast({ title: "No roles found matching your criteria." });
      }

    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "Failed to fetch search results.");
      setResults([]);
      localStorage.removeItem(LS_RESULTS); // Clear stored results on error
    } finally {
      setLoading(false);
    }
  }, [
       searchInput, selectedCountries, selectedTechnologies, customTechnologies,
       selectedCompanies, customCompanies, isRemote, postedAtMaxAgeDays, toast
    ]);

  // --- Save Custom Role Handler ---
  const handleSaveRole = useCallback(async (role: Role) => {
    if (!session?.user?.email) {
        toast({ title: "Authentication Required", description: "Please log in to save roles.", variant: "destructive" });
        router.push('/auth/signin?callbackUrl=/developer/roles/search');
        return;
    }
    
    // Prevent duplicate saves while one is in progress
    if (savingStates[role.id]) return;

    setSavingStates(prev => ({ ...prev, [role.id]: true }));

    // **TODO: Map the Role object to the CustomRole schema expected by the API**
    // This mapping depends heavily on the final CustomRole schema definition.
    // Assuming CustomRole schema will be similar to Role but linked to developerId
    const customRolePayload = {
        title: role.title,
        description: role.description,
        requirements: role.requirements || [],
        location: role.location,
        salary: role.salary || '',
        type: role.type, // Ensure this matches RoleType enum expected by backend if applicable
        remote: role.remote || false,
        visaSponsorship: role.visaSponsorship || false, // Assuming this field exists in CustomRole
        companyName: role.company?.name || 'Unknown Company', // Assuming CustomRole stores company name
        skills: role.skills?.map(s => s.name) || [], // Example: Saving skill names as string array
        url: role.url,
        originalRoleId: role.id, // Store the original ID for potential de-duplication or reference
        // developerId is added by the backend based on the session
    };

    try {
        const response = await fetch('/api/custom-roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customRolePayload),
        });

        if (!response.ok) {
            let errorMsg = 'Failed to save role.';
            try {
                const errData = await response.json();
                errorMsg = errData.error || errorMsg;
            } catch (e) { /* Ignore */ }
             if (response.status === 409) { // Handle conflict (already saved)
                 errorMsg = "This role seems to be already saved.";
                 // Optionally update the state to reflect it's saved
                 setSavedCustomRoleIds(prev => new Set(prev).add(role.id));
             } else {
                console.error("Save failed:", response.status, errorMsg);
             }
            throw new Error(errorMsg);
        }

        const savedRole = await response.json();
        setSavedCustomRoleIds(prev => new Set(prev).add(savedRole.id)); // Add new DB ID, or originalRoleId if returned
        toast({ title: "Success", description: `Role "${role.title}" saved.` });

    } catch (err: any) {
        toast({ title: "Error Saving Role", description: err.message, variant: "destructive" });
    } finally {
        setSavingStates(prev => ({ ...prev, [role.id]: false }));
    }
  }, [session, router, toast, savingStates]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Search Filters Section (Left) */}
        <div className="w-full lg:w-1/3 space-y-6 animate-fade-in-up">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg shadow p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
            <div className="space-y-4">
              {/* Keyword Search */}
              <div>
                <Label htmlFor="keyword-search">Keyword / Title</Label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="keyword-search"
                      placeholder="Search job titles, keywords..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                      className="pl-10 bg-white/50 dark:bg-gray-800/50"
                      disabled={loading}
                    />
                </div>
              </div>

              {/* Country Filter */}
              <div>
                <Label>Country (OR)</Label>
                <MultipleCombobox
                  options={countryOptions}
                  selected={selectedCountries}
                  onChange={setSelectedCountries}
                  placeholder="Select countries..."
                  searchPlaceholder="Search country..."
                  emptyPlaceholder="No countries found."
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              {/* Technology Filter */}
              <div>
                 <Label>Technologies (OR)</Label>
                 <MultipleCombobox
                   options={technologyOptions}
                   selected={selectedTechnologies}
                   onChange={setSelectedTechnologies}
                   placeholder="Select technologies..."
                   searchPlaceholder="Search technology..."
                   emptyPlaceholder="No technologies found."
                   disabled={loading}
                   className="mt-1"
                 />
                 <Input
                   id="custom-technology-search"
                   placeholder="Add custom technologies (comma-sep)..."
                   value={customTechnologies}
                   onChange={(e) => setCustomTechnologies(e.target.value)}
                   onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                   className="mt-2 bg-white/50 dark:bg-gray-800/50"
                   disabled={loading}
                 />
               </div>

               {/* Company Filter */}
               <div>
                  <Label>Company (OR)</Label>
                  <MultipleCombobox
                    options={companyOptions}
                    selected={selectedCompanies}
                    onChange={setSelectedCompanies}
                    placeholder="Select companies..."
                    searchPlaceholder="Search company..."
                    emptyPlaceholder="No companies found."
                    disabled={loading}
                    className="mt-1"
                  />
                  <Input
                    id="custom-company-search"
                    placeholder="Add custom companies (comma-sep)..."
                    value={customCompanies}
                    onChange={(e) => setCustomCompanies(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="mt-2 bg-white/50 dark:bg-gray-800/50"
                    disabled={loading}
                  />
                </div>

              {/* Remote Toggle */}
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="remote-switch" className="text-sm font-medium">Remote Only</Label>
                <Switch
                  id="remote-switch"
                  checked={isRemote === true}
                  onCheckedChange={(checked) => setIsRemote(checked ? true : undefined)}
                  disabled={loading}
                />
              </div>

              {/* Posted At Max Age Days Slider */}
              <div className="space-y-2">
                <Label htmlFor="posted-at-max-age-days">Posted Within (Days)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="posted-at-max-age-days"
                    min={1}
                    max={365}
                    step={1}
                    value={[postedAtMaxAgeDays]}
                    onValueChange={(value) => setPostedAtMaxAgeDays(value[0])}
                    className="flex-1"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium min-w-[3rem] text-right">
                    {postedAtMaxAgeDays}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only show jobs posted within the last {postedAtMaxAgeDays} days
                </p>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={loading || status === 'loading'} className="w-full mt-4">
                {(loading || status === 'loading') ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Roles
              </Button>
            </div>
          </Card>
        </div>

        {/* Roles Grid Section (Right) */}
        <div className="w-full lg:w-2/3">
          {loading && (
             <div className="flex items-center justify-center min-h-[300px]">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {error && (
            <div className="text-center py-10 text-red-600">
              <p>Error loading results:</p>
              <p className="font-mono text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded mt-2">{error}</p>
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>Enter search criteria and click Search, or previous results will be shown.</p>
            </div>
          )}
          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((role, index) => {
                // **Note:** This check assumes savedCustomRoleIds contains the *original* role ID from the search results.
                // This needs alignment with how IDs are handled during the save process.
                const isSaved = savedCustomRoleIds.has(role.id);
                return (
                    <RoleCard
                        key={role.id || index}
                        role={role}
                        onSave={handleSaveRole}
                        isSaved={isSaved || !!savingStates[role.id]} // Show saved if it is saved or currently being saved
                    />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Copied styles from app/developer/roles/page.tsx
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.25s ease-out forwards;
    opacity: 0;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 