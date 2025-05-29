'use client';

import React, { useState } from 'react';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import {  Button  } from '@/components/ui-daisy/button';
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
                        <CardContent className="flex-1 flex flex-col pt-2 bg-gradient-to-br from-purple-900/50 to-pink-500/50 dark:from-gray-900/50 dark:to-gray-900/30 backdrop-blur-sm">
                             <div className="flex-1 mt-2 overflow-y-auto">
                                {activeTab === 'cover-letter' && 
                                    <CoverLetterCreator 
                                        role={role} 
                                        generationTrigger={generationTrigger} 
                                        onGenerationComplete={onGenerationComplete}
                                        isMultiRoleMode={true}
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