'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import { Save, Loader2, Download, Wand2, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import _ from 'lodash';
// Import motion and AnimatePresence
import { motion, AnimatePresence } from 'framer-motion';
// Import shared animation config
import {
  defaultTransition,
  hoverTransition,
  entranceTransition,
  contentTransition,
  fadeInUp, // Using the example shared variant
  scaleOnHover // Using the example shared variant
} from '@/lib/animation-config';
// Import section components individually
import { ContactInfoDisplay } from './display/ContactInfoDisplay';
import { AboutDisplay } from './display/AboutDisplay';
import { SkillsDisplay } from './display/SkillsDisplay';
import { ExperienceDisplay } from './display/ExperienceDisplay';
import { EducationDisplay } from './display/EducationDisplay';
import { AnalysisSummaryDashboard } from './display/AnalysisSummaryDashboard';
import { SectionNavigation } from './display/SectionNavigation';
import { Accordion, AccordionItem as ShadcnAccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CvViewer } from './display/CvViewer';
import { SuggestionList } from './display/SuggestionList';
// Import shared types
import { 
    CvAnalysisData, 
    ContactInfoData, 
    Skill, 
    ExperienceItem, 
    EducationItem, 
    CvImprovementSuggestion 
} from '@/types/cv';
// Import Redux hooks, selectors, actions, and thunks
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import {
    selectCurrentAnalysisData,
    selectSuggestions,
    selectAnalysisStatus,
    selectAnalysisError,
    selectCurrentAnalysisId,
    selectOriginalAnalysisData, // Need selector for original data
    updateAnalysisData, // Action to update data
    applySuggestion,    // Action to apply suggestion
    dismissSuggestion,  // Action to dismiss suggestion
    fetchSuggestions,    // Thunk to get suggestions
    saveAnalysisVersion, // New thunk for versioned saving
    type AnalysisStatus  // Import the status type
} from '@/lib/features/analysisSlice';

interface AnalysisResultProps {
  // analysisData and analysisId props removed - data comes from Redux store
  originalMimeType: string; // Keep this for export
}

// Removed analysisData, analysisId props
export function AnalysisResultDisplay({ originalMimeType }: AnalysisResultProps) {
  console.log('[AnalysisResultDisplay] Component Mount/Render'); // Log render start
  console.log('[AnalysisResultDisplay] Props received:', { originalMimeType }); // Log props
  // Get dispatch function
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useToast();

  // Select data from Redux store
  const analysisData = useSelector(selectCurrentAnalysisData);
  const analysisId = useSelector(selectCurrentAnalysisId);
  const suggestions = useSelector(selectSuggestions);
  const status = useSelector(selectAnalysisStatus);
  const error = useSelector(selectAnalysisError);
  const originalData = useSelector(selectOriginalAnalysisData);

  // Log the received state
  console.log('[AnalysisResultDisplay] State from Redux:', {
      status,
      analysisId,
      hasAnalysisData: !!analysisData,
      error,
      suggestionCount: suggestions?.length ?? 0,
      hasOriginalData: !!originalData
  });

  // Local state for UI interactions (saving/exporting)
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // State for controlled Accordion
  const availableSections = useMemo(() => {
    const sections = [];
    if (analysisData?.contactInfo) sections.push({ id: 'contact-info', title: 'Contact Info' });
    if (analysisData?.about) sections.push({ id: 'about', title: 'About / Summary' });
    if (analysisData?.skills && analysisData.skills.length > 0) sections.push({ id: 'skills', title: 'Skills' });
    if (analysisData?.experience && analysisData.experience.length > 0) sections.push({ id: 'experience', title: 'Experience' });
    if (analysisData?.education && analysisData.education.length > 0) sections.push({ id: 'education', title: 'Education' });
    console.log('[AnalysisResultDisplay] Calculated availableSections:', sections); // Log calculated sections
    return sections;
  }, [analysisData]);
  const accordionSectionKeys = useMemo(() =>
    availableSections.filter(s => s.id !== 'contact-info').map(s => s.id)
  , [availableSections]);
  const [openSections, setOpenSections] = useState<string[]>(accordionSectionKeys);

  // Calculate unsaved changes by comparing current data with original data from store
  const hasUnsavedChanges = useMemo(() => {
    if (!analysisData || !originalData) return false;
    const changed = !_.isEqual(analysisData, originalData);
    console.log('[AnalysisResultDisplay] Calculated hasUnsavedChanges:', changed); // Log calculated changes
    return changed;
  }, [analysisData, originalData]);

  // Handle errors from Redux state
  useEffect(() => {
    if (status === 'failed' && error) {
        console.error('[AnalysisResultDisplay] Error toast triggered:', error);
      toast({ title: "Error", description: error, variant: "destructive" });
    }
  }, [status, error, toast]);

  // Update handler: dispatch Redux action
  const handleSectionChange = <T extends any>(
      path: string, // Use string path for lodash compatibility 
      updatedSectionData: T
  ) => {
    dispatch(updateAnalysisData({ path, value: updatedSectionData }));
  };

  // Suggestion Handler: dispatch fetchSuggestions thunk
  const handleGetSuggestions = () => {
    if (!analysisData) return;
    // Status update (suggesting) is handled by the thunk/slice
    console.log("Dispatching fetchSuggestions...");
    dispatch(fetchSuggestions(analysisData));
  };

  // Accept suggestion: dispatch Redux action
  const handleAcceptSuggestion = (suggestion: CvImprovementSuggestion) => {
    console.log('Dispatching applySuggestion:', suggestion);
    if (!analysisData) {
       toast({ title: "Error", description: "No data to apply suggestion to.", variant: "destructive"});
       return;
    }
    dispatch(applySuggestion(suggestion));
    toast({ title: "Suggestion Applied", description: `Change applied to ${suggestion.section}.` });
  };

  // Reject suggestion: dispatch Redux action
  const handleRejectSuggestion = (suggestion: CvImprovementSuggestion) => {
    console.log('Dispatching dismissSuggestion:', suggestion);
    dispatch(dismissSuggestion(suggestion));
    toast({ title: "Suggestion Rejected", description: `Suggestion for ${suggestion.section} dismissed.` });
  };

  // Save Handler: Use Redux versioned saving
  const handleSaveAll = async () => {
    if (analysisId && analysisId.startsWith('temp-')) {
      toast({ title: "Action Required", description: "Please upload the CV first to save changes permanently.", variant: "default" });
      return;
    }
    if (!analysisId || !hasUnsavedChanges || !analysisData) return; 
    
    setIsSaving(true);
    try {
      console.log('[AnalysisResultDisplay] Dispatching saveAnalysisVersion...');
      const result = await dispatch(saveAnalysisVersion()).unwrap();
      console.log('[AnalysisResultDisplay] Save successful:', result);
      
      // Update URL to reflect the new analysis ID to prevent infinite loop
      if (result.analysisId && typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('analysisId', result.analysisId);
        window.history.replaceState({}, '', currentUrl.toString());
      }
      
      toast({ 
        title: "Success", 
        description: `New version saved with ID: ${result.analysisId}. You're now viewing the latest version.` 
      });
    } catch (error: any) { 
      console.error("Error saving changes:", error); 
      toast({ title: "Save Error", description: error, variant: "destructive" }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  // Export Handler: Use Redux state
  const handleExport = async () => {
    if (!analysisData) return; // Check if data exists
    setIsExporting(true);
    console.log("Exporting analysis data from store as:", originalMimeType);
    try {
      const response = await fetch('/api/cv-analysis/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            analysisData: analysisData, // Send data from store
            originalFormat: originalMimeType
        })
      });
       if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Export failed (${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `exported_cv.${originalMimeType.split('/')[1] || 'bin'}`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: `Downloaded ${filename}` });
    } catch (error: any) {
      console.error("Error exporting CV:", error);
      toast({ title: "Export Error", description: error.message || 'Could not export CV.', variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Handlers for Expand/Collapse All
  const handleExpandAll = () => {
    setOpenSections(accordionSectionKeys);
  };
  const handleCollapseAll = () => {
    setOpenSections([]);
  };

  // Handler for printing the current view
  const handlePrintOrExport = () => {
    // Basic print functionality for now
    // TODO: Implement a more sophisticated export/print format if needed
    window.print();
  };

  // Animation Variants - Use shared transitions
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: defaultTransition }, // Use defaultTransition (or entranceTransition if preferred)
  };

  // Use the shared fadeInUp variant directly
  // const sectionVariants = {
  //   hidden: { opacity: 0, y: 15 },
  //   visible: { opacity: 1, y: 0, transition: entranceTransition },
  // };
  const sectionVariants = fadeInUp;

  // Add variants for accordion content - Use shared contentTransition
  const contentVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', transition: contentTransition },
    exit: { opacity: 0, y: -10, height: 0, transition: contentTransition } // Use contentTransition for exit too
  };

  // Use motion version of AccordionItem if available, otherwise forwardRef
  const AccordionItem = motion(ShadcnAccordionItem);

  // Handle loading state based on Redux status
  console.log(`[AnalysisResultDisplay] Checking render conditions: status='${status}', hasAnalysisData=${!!analysisData}`);
  if (status === 'loading') {
    console.log('[AnalysisResultDisplay] Rendering LOADING state.');
    return <div className="p-6 text-center text-gray-500"><Loader2 className="inline mr-2 h-5 w-5 animate-spin" /> Loading analysis data...</div>;
  }
  
  // Handle case where loading finished but data is still null
  if (!analysisData) {
    if (status === 'failed') {
      console.error('[AnalysisResultDisplay] Rendering FAILED state.');
      return <p className="p-6 text-center text-destructive">Failed to load analysis data. {error || 'Unknown error'}</p>;
    } 
    console.log('[AnalysisResultDisplay] Rendering NO DATA state.');
    return <p className="p-6 text-center text-muted-foreground">No analysis data available.</p>;
  }

  // Determine button disabled states based on Redux status
  const isSuggesting = status === 'suggesting';
  const isProcessing = ['loading', 'suggesting', 'analyzing'].includes(status);
  
  // Consolidated log before rendering
  console.log('[AnalysisResultDisplay] PRE-RENDER LOG:', {
    status,
    analysisId,
    contactInfo: analysisData?.contactInfo,
    about: analysisData?.about,
    skills: analysisData?.skills,
    experience: analysisData?.experience,
    education: analysisData?.education,
    extractedText: analysisData?.cv?.extractedText,
  });

  return (
    <motion.div
      className="analysis-display-container p-4 md:p-6 lg:p-8 bg-background dark:bg-black/20 min-h-screen font-sans rounded-2xl"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
       <header className="mb-8 flex justify-between items-start flex-wrap gap-4 print:hidden"> {/* Hide header buttons when printing */}
          <div>
              {/* Use theme foreground colors */}
              <h1 className="text-3xl font-bold text-foreground">CV Analysis Results</h1>
              {analysisId && !analysisId.startsWith('temp-') && (
                  <p className="text-sm text-muted-foreground mt-1">Analysis ID: {analysisId}</p> /* text-muted-foreground should adapt */
              )}
          </div>
          {/* Action Buttons moved to header - shadcn Buttons should adapt */}
          <div className="flex gap-2 flex-wrap justify-end">
             <Button onClick={handleExpandAll} variant="outline" size="sm" disabled={openSections.length === accordionSectionKeys.length || isProcessing}> <ChevronsDownUp className="mr-2 h-4 w-4" /> Expand All </Button>
             <Button onClick={handleCollapseAll} variant="outline" size="sm" disabled={openSections.length === 0 || isProcessing}> <ChevronsUpDown className="mr-2 h-4 w-4" /> Collapse All </Button>
             <Button onClick={handleGetSuggestions} disabled={isSuggesting || isSaving || isExporting || isProcessing} size="sm" variant="outline"> {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" /> } {isSuggesting ? 'Getting Suggestions...' : 'Get Suggestions'} </Button>
             <Button onClick={handleExport} disabled={isExporting || isSaving || isSuggesting || isProcessing || analysisData == null} size="sm" variant="outline"> {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} {isExporting ? 'Exporting...' : 'Export Edited CV'} </Button>
             {/* Primary action button styling? Default should work */}
             <Button 
               onClick={handleSaveAll} 
               disabled={!hasUnsavedChanges || isSaving || isSuggesting || isExporting || isProcessing || !!(analysisId && analysisId.startsWith('temp-'))} 
               size="sm"
             >
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                 {isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save Changes' : 'All Changes Saved')} 
             </Button>
          </div>
       </header>

       <motion.div
         variants={sectionVariants}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.2 }}
       >
         <AnalysisSummaryDashboard
           analysisData={analysisData}
           suggestions={suggestions}
           onGetSuggestions={handleGetSuggestions}
           isSuggesting={isSuggesting}
         />
       </motion.div>

       <div className="flex flex-col md:flex-row gap-8 mt-8">
          <aside className="w-full md:w-1/4 lg:w-1/5 order-2 md:order-1 hidden md:block">
             <SectionNavigation sections={availableSections} offset={80} /> 
          </aside>

          <main className="w-full md:w-3/4 lg:w-4/5 order-1 md:order-2 space-y-4">
              {analysisData.contactInfo && (
                  <motion.section
                    id="contact-info" 
                    className="p-6 bg-card text-card-foreground rounded-xl bg-white/20 dark:bg-black/20 scroll-mt-20"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                      <h3 className="text-2xl font-semibold text-foreground mb-3 pb-1">Contact Info</h3>
                      {/* Log before rendering ContactInfoDisplay */} 
                      <ContactInfoDisplay 
                          data={analysisData.contactInfo}
                          onChange={(newData) => dispatch(updateAnalysisData({ path: 'contactInfo', value: newData }))} 
                          suggestions={suggestions} 
                          onAcceptSuggestion={handleAcceptSuggestion}
                          onRejectSuggestion={handleRejectSuggestion}
                      />
                  </motion.section>
              )}
              
              <Accordion 
                type="multiple" 
                value={openSections} 
                onValueChange={setOpenSections}
                className="w-full space-y-4"
              >
                {analysisData.about !== undefined && (
                  <AccordionItem 
                    value="about" 
                    id="about" 
                    className="p-6 bg-card text-card-foreground rounded-xl bg-white/20 dark:bg-black/20 scroll-mt-20 overflow-hidden"
                  >
                    <AccordionTrigger className="text-2xl font-semibold text-foreground hover:no-underline pt-0 pb-3">About / Summary</AccordionTrigger>
                    <AccordionContent className="pt-3">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key="about-content"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <AboutDisplay 
                            data={analysisData.about}
                            onChange={(newData) => dispatch(updateAnalysisData({ path: 'about', value: newData }))} 
                            suggestions={suggestions} 
                            onAcceptSuggestion={handleAcceptSuggestion}
                            onRejectSuggestion={handleRejectSuggestion}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {analysisData.skills && analysisData.skills.length > 0 && (
                  <AccordionItem 
                    value="skills" 
                    id="skills" 
                    className="p-6 bg-card text-card-foreground rounded-xl bg-white/20 dark:bg-black/20 scroll-mt-20 overflow-hidden"
                  >
                    <AccordionTrigger className="text-2xl font-semibold text-foreground hover:no-underline pt-0 pb-3">Skills</AccordionTrigger>
                    <AccordionContent className="pt-3">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key="skills-content"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <SkillsDisplay 
                            data={analysisData.skills}
                            onChange={(newData) => dispatch(updateAnalysisData({ path: 'skills', value: newData }))} 
                            suggestions={suggestions} 
                            onAcceptSuggestion={handleAcceptSuggestion}
                            onRejectSuggestion={handleRejectSuggestion}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {analysisData.experience && analysisData.experience.length > 0 && (
                  <AccordionItem 
                    value="experience" 
                    id="experience" 
                    className="p-6 bg-card text-card-foreground rounded-xl bg-white/20 dark:bg-black/20 scroll-mt-20 overflow-hidden"
                  >
                    <AccordionTrigger className="text-2xl font-semibold text-foreground hover:no-underline pt-0 pb-3">Work Experience</AccordionTrigger>
                    <AccordionContent className="pt-3">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key="experience-content"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <ExperienceDisplay 
                            data={analysisData.experience}
                            onChange={(newData) => dispatch(updateAnalysisData({ path: 'experience', value: newData }))} 
                            suggestions={suggestions} 
                            onAcceptSuggestion={handleAcceptSuggestion}
                            onRejectSuggestion={handleRejectSuggestion}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {analysisData.education && analysisData.education.length > 0 && (
                  <AccordionItem 
                    value="education" 
                    id="education" 
                    className="p-6 bg-card text-card-foreground rounded-xl bg-white/20 dark:bg-black/20 scroll-mt-20 overflow-hidden"
                  >
                    <AccordionTrigger className="text-2xl font-semibold text-foreground hover:no-underline pt-0 pb-3">Education</AccordionTrigger>
                    <AccordionContent className="pt-3">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key="education-content"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <EducationDisplay 
                            data={analysisData.education}
                            onChange={(newData) => dispatch(updateAnalysisData({ path: 'education', value: newData }))} 
                            suggestions={suggestions} 
                            onAcceptSuggestion={handleAcceptSuggestion}
                            onRejectSuggestion={handleRejectSuggestion}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              
              <CvViewer 
                  pdfUrl={undefined /* TODO: Pass actual PDF URL if available */} 
                  extractedText={analysisData?.cv?.extractedText} // Pass extracted text
              />
          </main>
       </div>

       {/* Action Buttons - corrected footer */}
       {/* Use theme border color */}
       <footer className="mt-10 pt-6 flex justify-end gap-4 print:hidden"> 
         {/* Use theme primary button colors */}
         <Button 
           onClick={handlePrintOrExport} 
           disabled={isProcessing} 
           size="sm" 
           variant="default" 
           className="bg-primary hover:bg-primary/90 text-primary-foreground"
         >
           Export/Print Results
         </Button>
       </footer>

    </motion.div>
  );
}
 