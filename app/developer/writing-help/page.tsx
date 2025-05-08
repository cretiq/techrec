"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Mail, PenTool, ArrowRight, Loader2, AlertTriangle, Rocket } from "lucide-react"
import { CVOptimizer } from "./components/cv-optimizer"
import { CoverLetterCreator } from "./components/cover-letter-creator"
import { OutreachMessageGenerator } from "./components/outreach-message-generator"
import { RoleContextCard } from "./components/role-context-card"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedRoles, clearRoleSelection } from '@/lib/features/selectedRolesSlice';
import { RootState, AppDispatch } from '@/lib/store';
import { Role } from "@/types/role"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MultiRolePane } from "./components/MultiRolePane"

export default function WritingHelpPage() {
  // Read initial tab from URL query param, default to cover-letter if present
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const initialTab = (initialTabParam === 'cv' || initialTabParam === 'cover-letter' || initialTabParam === 'outreach') ? initialTabParam : 'cover-letter';
  
  const [activeTab, setActiveTab] = useState<"cv" | "cover-letter" | "outreach">(initialTab)
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [generationTriggers, setGenerationTriggers] = useState<Record<string, number>>({});
  const [generationStatus, setGenerationStatus] = useState<Record<string, { status: 'idle' | 'generating' | 'success' | 'error' }>>({});
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status: sessionStatus } = useSession()
  const dispatch = useDispatch<AppDispatch>();

  // Get selected role IDs from Redux
  const selectedRoles = useSelector(selectSelectedRoles); // Get full Role objects from Redux

  // Initialize generation triggers and status for selected roles
  useEffect(() => {
    const initialTriggers: Record<string, number> = {};
    const initialStatus: Record<string, { status: 'idle' | 'generating' | 'success' | 'error' }> = {};
    selectedRoles.forEach(role => {
      initialTriggers[role.id] = 0;
      initialStatus[role.id] = { status: 'idle' };
    });
    setGenerationTriggers(initialTriggers);
    setGenerationStatus(initialStatus);
  }, [selectedRoles]);

  useEffect(() => {
    // Redirect if unauthenticated
    if (sessionStatus === 'unauthenticated') {
        toast({ title: "Authentication Required", description: "Please log in to use Writing Help.", variant: "destructive" });
        router.push('/auth/signin?callbackUrl=/developer/writing-help');
        return;
    }

    // If authenticated but no roles selected, redirect to search
    // Check after session is confirmed authenticated
    if (sessionStatus === 'authenticated' && selectedRoles.length === 0) {
        toast({ title: "No Roles Selected", description: "Please select roles from the search page first." });
        router.push('/developer/roles/search');
    }

    // Cleanup function remains the same if needed for other purposes
    /* return () => {
         if (selectedRoles.length > 0) {
             // dispatch(clearRoleSelection());
             // console.log("Cleared role selection on unmount/dependency change");
         }
       }; */
  }, [selectedRoles.length, sessionStatus, router, toast]); // Only depend on length for redirect

  // Simplified: Just update the status for the specific role
  const handleGenerationComplete = (roleId: string, success: boolean) => {
    setGenerationStatus(prev => ({
      ...prev,
      [roleId]: { status: success ? 'success' : 'error' }
    }));
    // The check for overall completion is moved to useEffect below
  };

  // useEffect to check for overall completion when generationStatus changes
  useEffect(() => {
    // Only run the check if the "Generate All" process is active
    if (!isGeneratingAll) {
      return;
    }

    // Check if all selected roles have reached a final state
    const allDone = selectedRoles.every(role => {
        const statusEntry = generationStatus[role.id];
        // A role is considered "done" if its status is success or error
        return statusEntry && (statusEntry.status === 'success' || statusEntry.status === 'error');
    });

    if (allDone) {
        console.log("[WritingHelpPage useEffect] All generations complete, setting isGeneratingAll to false."); // Add log
        setIsGeneratingAll(false);
        toast({ title: "Batch Generation Finished", description: "All selected cover letters have been processed." });
    }

  }, [generationStatus, selectedRoles, isGeneratingAll, toast]); // Dependencies

  // --- Handler for Generate All button ---
  const handleGenerateAll = async () => {
    if (selectedRoles.length === 0 || isGeneratingAll) {
        return;
    }
    setIsGeneratingAll(true);
    const newTriggers: Record<string, number> = {};
    const newStatus: Record<string, { status: 'idle' | 'generating' | 'success' | 'error' }> = {};

    selectedRoles.forEach(role => {
        newTriggers[role.id] = (generationTriggers[role.id] || 0) + 1;
        newStatus[role.id] = { status: 'generating' }; // Set individual status to generating
    });
    setGenerationStatus(newStatus); // Set all relevant statuses to generating
    setGenerationTriggers(newTriggers); // This will trigger the useEffect in CoverLetterCreator for each pane
    toast({ title: "Batch Generation Started", description: `Generating ${selectedRoles.length} cover letter(s)...` });
  };

  // Determine if any individual pane is still generating for the master "Generate All" button state
  const isAnyPaneGenerating = useMemo(() => 
    Object.values(generationStatus).some(s => s.status === 'generating'), 
  [generationStatus]);

  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (sessionStatus === 'authenticated' && selectedRoles.length === 0) {
     // This case should ideally be handled by the redirect logic in useEffect
     // but serves as a fallback.
     return (
        <div className="container max-w-3xl mx-auto p-4 text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-4">No Roles to Display</h2>
          <p className="text-muted-foreground mb-4">Please select roles from the search page first.</p>
          <Button onClick={() => router.push('/developer/roles/search')}>Go to Search</Button>
        </div>
      );
  }

  // Render structure for multiple roles (Task 12 will refine this)
  // Simple vertical stack for now
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-1 md:space-y-0 mb-6"
      >
         <div>
        <h1 className="text-2xl font-bold tracking-tight">Writing Help</h1>
        <p className="text-sm text-muted-foreground">
            {isGeneratingAll ? 'Generating cover letters...' : `Review and generate cover letters for ${selectedRoles.length} selected role${selectedRoles.length !== 1 ? 's' : ''}`}
            </p>
         </div>
         {/* Generate All Button - Disable while polling or generating */}
         {activeTab === 'cover-letter' && selectedRoles.length > 0 && (
             <Button
                onClick={handleGenerateAll}
                disabled={isGeneratingAll || isAnyPaneGenerating}
                size="sm"
                className="mt-2 md:mt-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
             >
                {(isGeneratingAll || isAnyPaneGenerating) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Rocket className="mr-2 h-4 w-4" />
                )}
                 {(isGeneratingAll || isAnyPaneGenerating) ? 'Generating All...' : `Generate All (${selectedRoles.length})`}
             </Button>
         )}
      </motion.div>

      {/* Tabs - Remains at top level */} 
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "cv" | "cover-letter" | "outreach")}
            className="w-full mb-6"
              >
                <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto h-9">
                  <TabsTrigger value="cv" className="flex items-center gap-1.5 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    CV Optimization
                  </TabsTrigger>
                  <TabsTrigger value="cover-letter" className="flex items-center gap-1.5 text-xs">
                    <PenTool className="h-3.5 w-3.5" />
                    Cover Letter
                  </TabsTrigger>
                  <TabsTrigger value="outreach" className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5" />
                    Outreach Message
                  </TabsTrigger>
                </TabsList>
              </Tabs>

        {/* Grid Layout Container - Render MultiRolePane for each role */} 
        <div className="grid grid-cols-1 gap-4 w-full">
            {selectedRoles.map((role: Role) => (
                 <MultiRolePane 
                    key={role.id} 
                    role={role} 
                    activeTab={activeTab}
                    generationTrigger={generationTriggers[role.id] || 0}
                    onGenerationComplete={handleGenerationComplete}
                 />
            ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex justify-between items-center mt-4"
      >
        {/* Optional: Add button to clear selection */} 
         <Button
          variant="outline"
          size="sm"
          onClick={() => { 
            dispatch(clearRoleSelection());
            router.push("/developer/roles/search");
          }}
          className="text-xs"
        >
          Cancel & Clear Selection
        </Button>

        <Button
          size="sm"
          onClick={() => router.push("/developer/roles/search")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs"
        >
          Back to Roles <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </motion.div>
    </div>
  )
} 