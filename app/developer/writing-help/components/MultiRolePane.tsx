'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Role } from "@/types/role";
import { CoverLetterCreator } from "./cover-letter-creator";
import { CVOptimizer } from "./cv-optimizer";
import { OutreachMessageGenerator } from "./outreach-message-generator";
import { AnimatePresence, motion } from "framer-motion";

interface MultiRolePaneProps {
    role: Role;
    activeTab: "cv" | "cover-letter" | "outreach";
    generationTrigger?: number;
    onGenerationComplete?: (roleId: string, success: boolean) => void;
}

export function MultiRolePane({ 
    role, 
    activeTab, 
    generationTrigger, 
    onGenerationComplete 
}: MultiRolePaneProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const paneId = `pane-${role.id}`;

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                <CardTitle className="text-lg line-clamp-2 flex-1 mr-2" title={role.title}>
                    {role.title} at {role.company?.name || 'Unknown Company'}
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex-shrink-0 h-8 w-8" 
                    onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                    aria-expanded={!isCollapsed}
                    aria-controls={paneId}
                >
                     {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    <span className="sr-only">{isCollapsed ? 'Expand' : 'Collapse'} section</span>
                 </Button>
            </CardHeader>
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        key="content"
                        id={paneId}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <CardContent className="flex-1 flex flex-col pt-2">
                             <div className="flex-1 mt-2 overflow-y-auto">
                                {activeTab === 'cover-letter' && 
                                    <CoverLetterCreator 
                                        role={role} 
                                        generationTrigger={generationTrigger} 
                                        onGenerationComplete={onGenerationComplete} 
                                    />}
                                {activeTab === 'cv' && <CVOptimizer />}
                                {activeTab === 'outreach' && 
                                    <OutreachMessageGenerator 
                                        role={role} 
                                    />}
                             </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
} 