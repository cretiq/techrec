"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {  Button  } from '@/components/ui-daisy/button'
import {  Tabs, TabsContent  } from '@/components/ui-daisy/tabs'
import { FileText, Mail, PenTool, ArrowRight, Loader2, Rocket } from "lucide-react"
import { AnimatedTabs } from '@/components/ui/animated-tabs'
import { useToast } from "@/components/ui-daisy/use-toast"
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
  // Don't allow CV tab to be selected initially
  const initialTab = (initialTabParam === 'cover-letter' || initialTabParam === 'outreach') ? initialTabParam : 'cover-letter';
  
  const [activeTab, setActiveTab] = useState<"cv" | "cover-letter" | "outreach">(initialTab)
  
  // Update URL on initial load if tab param is not present or is the default
  useEffect(() => {
    if (!initialTabParam || initialTabParam === 'cover-letter') {
      // Remove the tab parameter from URL for cleaner URLs when on default tab
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('tab')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [generatingRoleId, setGeneratingRoleId] = useState<string | null>(null);
  // Separate states for cover letters and outreach messages
  const [coverLetterTriggers, setCoverLetterTriggers] = useState<Record<string, number>>({});
  const [coverLetterStatus, setCoverLetterStatus] = useState<Record<string, { status: 'idle' | 'generating' | 'success' | 'error' }>>({});
  const [outreachTriggers, setOutreachTriggers] = useState<Record<string, number>>({});
  const [outreachStatus, setOutreachStatus] = useState<Record<string, { status: 'idle' | 'generating' | 'success' | 'error' }>>({});
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
    setCoverLetterTriggers(initialTriggers);
    setCoverLetterStatus(initialStatus);
    setOutreachTriggers(initialTriggers);
    setOutreachStatus(initialStatus);
  }, [selectedRoles]);

  useEffect(() => {
    // Redirect if unauthenticated
    if (sessionStatus === 'unauthenticated') {
        toast({ title: "Authentication Required", description: "Please log in to use Writing Help.", variant: "destructive" });
        router.push('/auth/signin?callbackUrl=/developer/writing-help');
        return;
    }

    // Simplified redirect logic - no need to check isRehydrated since PersistGate handles this
    if (sessionStatus === 'authenticated' && selectedRoles.length === 0) {
        toast({ title: "No Roles Selected", description: "Please select roles from the search page first." });
        router.push('/developer/roles/search');
    }
  }, [selectedRoles.length, sessionStatus, router, toast]);

  const handleGenerationStart = (roleId: string) => {
    setGeneratingRoleId(roleId);
  };

  // Tab-specific generation completion handlers
  const handleCoverLetterComplete = (roleId: string, success: boolean) => {
    setCoverLetterStatus(prev => ({
      ...prev,
      [roleId]: { status: success ? 'success' : 'error' }
    }));
    setGeneratingRoleId(null); // Release lock
  };

  const handleOutreachComplete = (roleId: string, success: boolean) => {
    setOutreachStatus(prev => ({
      ...prev,
      [roleId]: { status: success ? 'success' : 'error' }
    }));
    setGeneratingRoleId(null); // Release lock
  };

  // useEffect to check for overall completion when generation status changes
  useEffect(() => {
    // Only run the check if the "Generate All" process is active
    if (!isGeneratingAll) {
      return;
    }

    // Choose the appropriate status based on active tab
    const currentStatus = activeTab === 'cover-letter' ? coverLetterStatus : outreachStatus;
    
    // Check if all selected roles have reached a final state
    const allDone = selectedRoles.every(role => {
        const statusEntry = currentStatus[role.id];
        // A role is considered "done" if its status is success or error
        return statusEntry && (statusEntry.status === 'success' || statusEntry.status === 'error');
    });

    if (allDone) {
        console.log(`[WritingHelpPage useEffect] All ${activeTab} generations complete, setting isGeneratingAll to false.`);
        setIsGeneratingAll(false);
        toast({ 
          title: "Batch Generation Finished", 
          description: `All selected ${activeTab === 'cover-letter' ? 'cover letters' : 'outreach messages'} have been processed.` 
        });
    }

  }, [coverLetterStatus, outreachStatus, selectedRoles, isGeneratingAll, activeTab, toast]); // Dependencies

  // --- Handler for Generate All button (tab-aware) ---
  const handleGenerateAll = async () => {
    if (selectedRoles.length === 0 || isGeneratingAll || generatingRoleId) {
        return;
    }
    setIsGeneratingAll(true);
    const newTriggers: Record<string, number> = {};
    const newStatus: Record<string, { status: 'idle' | 'generating' | 'success' | 'error' }> = {};

    if (activeTab === 'cover-letter') {
      selectedRoles.forEach(role => {
          newTriggers[role.id] = (coverLetterTriggers[role.id] || 0) + 1;
          newStatus[role.id] = { status: 'generating' };
      });
      setCoverLetterStatus(newStatus);
      setCoverLetterTriggers(newTriggers);
      toast({ title: "Batch Generation Started", description: `Generating ${selectedRoles.length} cover letter(s)...` });
    } else if (activeTab === 'outreach') {
      selectedRoles.forEach(role => {
          newTriggers[role.id] = (outreachTriggers[role.id] || 0) + 1;
          newStatus[role.id] = { status: 'generating' };
      });
      setOutreachStatus(newStatus);
      setOutreachTriggers(newTriggers);
      toast({ title: "Batch Generation Started", description: `Generating ${selectedRoles.length} outreach message(s)...` });
    }
  };

  // Determine if any individual pane is still generating for the master "Generate All" button state
  const isAnyPaneGenerating = useMemo(() => {
    const currentStatus = activeTab === 'cover-letter' ? coverLetterStatus : outreachStatus;
    return Object.values(currentStatus).some(s => s.status === 'generating');
  }, [coverLetterStatus, outreachStatus, activeTab]);

  const isAnyGenerationActive = isGeneratingAll || isAnyPaneGenerating || generatingRoleId !== null;

  // PersistGate now handles loading state - no manual check needed

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
      <AnimatedTabs
        tabs={[
          {
            value: "cv",
            icon: FileText,
            label: "CV Optimization",
            shortLabel: "CV",
            testId: "write-nav-tab-cv-trigger",
            disabled: true
          },
          {
            value: "cover-letter",
            icon: PenTool,
            label: "Cover Letter",
            shortLabel: "Letter",
            testId: "write-nav-tab-cover-letter-trigger"
          },
          {
            value: "outreach",
            icon: Mail,
            label: "Outreach Message",
            shortLabel: "Outreach",
            testId: "write-nav-tab-outreach-trigger"
          }
        ]}
        value={activeTab}
        onValueChange={(value) => {
          // Don't allow switching to CV tab
          if (value === "cv") return;
          
          setActiveTab(value as "cv" | "cover-letter" | "outreach")
          // Update URL without navigation
          const newUrl = new URL(window.location.href)
          if (value === 'cover-letter') {
            // Remove tab param for default tab
            newUrl.searchParams.delete('tab')
          } else {
            newUrl.searchParams.set('tab', value)
          }
          window.history.pushState({}, '', newUrl.toString())
        }}
        layoutId="writeHelpTabBackground"
        testId="write-nav-tabs-main"
      />
      
      <Tabs
        value={activeTab}
        onValueChange={() => {}} // Controlled by AnimatedTabs
        className="w-full"
      >
        
        {/* Action Buttons Row - Show in cover-letter and outreach tabs */}
        {(activeTab === 'cover-letter' || activeTab === 'outreach') && selectedRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid grid-cols-2 gap-4 mt-6 w-full"
          >
            {/* Back to Roles Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                onClick={() => router.push("/developer/roles/search")}
                variant="glass"
                size="lg"
                elevation="lg"
                leftIcon={<ArrowRight className="h-5 w-5 rotate-180" />}
                data-testid="write-button-back-to-roles-trigger"
              >
                Back to Roles
              </Button>
            </motion.div>

            {/* Generate All Button - Aligned to right column */}
            <div className="flex justify-end">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="relative"
              >
                <Button
                  onClick={handleGenerateAll}
                  disabled={isAnyGenerationActive}
                  size="xl"
                  variant="gradient"
                  elevation="lg"
                  loading={isAnyGenerationActive}
                  leftIcon={!isAnyGenerationActive ? (
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
                  ) : undefined}
                  rightIcon={!isAnyGenerationActive ? (
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
                  ) : undefined}
                  data-testid="write-button-generate-all-trigger"
                >
                  {(isAnyGenerationActive) 
                    ? `Generating...`
                    : `Generate All ${activeTab === 'cover-letter' ? 'Letters' : 'Messages'} (${selectedRoles.length})`
                  }
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </Tabs>

        {/* Grid Layout Container - Render MultiRolePane for each role */} 
        <div className="grid grid-cols-1 gap-4 w-full mt-6">
            {selectedRoles.map((role: Role) => {
                // Choose the appropriate trigger and handler based on active tab
                const generationTrigger = activeTab === 'cover-letter' 
                  ? (coverLetterTriggers[role.id] || 0)
                  : (outreachTriggers[role.id] || 0);
                const onGenerationComplete = activeTab === 'cover-letter'
                  ? handleCoverLetterComplete
                  : handleOutreachComplete;
                
                return (
                  <MultiRolePane 
                      key={role.id} 
                      role={role} 
                      activeTab={activeTab}
                      generationTrigger={generationTrigger}
                      onGenerationStart={handleGenerationStart}
                      onGenerationComplete={onGenerationComplete}
                      isExternallyLocked={generatingRoleId !== null && generatingRoleId !== role.id}
                  />
                );
            })}
      </div>

    </div>
  )
} 