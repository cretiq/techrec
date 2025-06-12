"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {  Button  } from '@/components/ui-daisy/button'
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui-daisy/tabs'
import { FileText, Mail, PenTool, ArrowRight, Loader2, Rocket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedRoles } from '@/lib/features/selectedRolesSlice';
import { AppDispatch } from '@/lib/store';
import { Role } from "@/types/role"
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

      {/* Enhanced Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "cv" | "cover-letter" | "outreach")}
          className="w-full"
        >
          <TabsList 
            className="relative grid grid-cols-3 w-full max-w-2xl mx-auto h-12 bg-base-100/60 backdrop-blur-md border border-base-300/50 rounded-xl p-1.5 shadow-xl"
            data-testid="write-nav-tabs-main"
          >
            <TabsTrigger 
              value="cv" 
              className="relative flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:text-white data-[state=inactive]:text-base-content/70 hover:text-base-content z-20"
              data-testid="write-nav-tab-cv-trigger"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">CV Optimization</span>
              <span className="sm:hidden font-semibold">CV</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="cover-letter" 
              className="relative flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:text-white data-[state=inactive]:text-base-content/70 hover:text-base-content z-20"
              data-testid="write-nav-tab-cover-letter-trigger"
            >
              <PenTool className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Cover Letter</span>
              <span className="sm:hidden font-semibold">Letter</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="outreach" 
              className="relative flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:text-white data-[state=inactive]:text-base-content/70 hover:text-base-content z-20"
              data-testid="write-nav-tab-outreach-trigger"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Outreach Message</span>
              <span className="sm:hidden font-semibold">Outreach</span>
            </TabsTrigger>
            
            {/* Active Tab Background */}
            <motion.div
              layoutId="activeTabBackground"
              className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg z-10"
              style={{
                width: `calc(33.333% - 4px)`,
                left: activeTab === "cv" ? "6px" : 
                      activeTab === "cover-letter" ? `calc(33.333% + 2px)` : 
                      `calc(66.666% - 2px)`
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 35,
                duration: 0.25
              }}
            />
          </TabsList>
        </Tabs>
        
        {/* Action Buttons Row - Only show in cover-letter tab */}
        {activeTab === 'cover-letter' && selectedRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex justify-between items-center mt-6"
          >
            {/* Back to Roles Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                onClick={() => router.push("/developer/roles/search")}
                variant="outline"
                size="lg"
                className="bg-base-100/70 backdrop-blur-md border-base-300/50 hover:bg-base-200 px-6 py-3 font-semibold shadow-lg transition-all duration-150"
                data-testid="write-button-back-to-roles-trigger"
              >
                <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                Back to Roles
              </Button>
            </motion.div>

            {/* Generate All Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className="relative"
            >
              <Button
                onClick={handleGenerateAll}
                disabled={isGeneratingAll || isAnyPaneGenerating}
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-xl px-8 py-3 font-semibold text-lg transition-all duration-150 rounded-lg"
                data-testid="write-button-generate-all-trigger"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                
                {/* Button Content */}
                <div className="relative z-10 flex items-center gap-3">
                  {(isGeneratingAll || isAnyPaneGenerating) ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5" />
                      </motion.div>
                      <span>Generating All Letters...</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ 
                          y: [0, -1, 0],
                          rotate: [0, 3, -3, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Rocket className="h-5 w-5" />
                      </motion.div>
                      <span>Generate All ({selectedRoles.length})</span>
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ 
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </>
                  )}
                </div>
                
                {/* Pulse Effect when generating */}
                {(isGeneratingAll || isAnyPaneGenerating) && (
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

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

    </div>
  )
} 