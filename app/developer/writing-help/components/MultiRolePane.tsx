'use client';

import React, { useState } from 'react';
import {  Card, CardContent  } from '@/components/ui-daisy/card';
import { motion } from "framer-motion";
import { Role } from "@/types/role";
import { CoverLetterCreator } from "./cover-letter-creator";
import { OutreachMessageGenerator } from "./outreach-message-generator";
import { CVOptimizer } from "./cv-optimizer";

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
    const paneId = `pane-${role.id}`;

    return (
        <Card className="" data-testid={`write-multirole-card-${role.id}`}>
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
                className="flex-1 flex flex-col"
                data-testid={`write-multirole-content-${role.id}`}
            >
                <CardContent className="p-0" data-testid={`write-multirole-card-content-${role.id}`}>
                    <div className="flex-1" data-testid={`write-multirole-tab-content-${role.id}`}>
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
                            generationTrigger={generationTrigger} 
                            onGenerationComplete={onGenerationComplete}
                            isMultiRoleMode={true}
                        />}
                    </div>
                </CardContent>
            </motion.div>
        </Card>
    );
} 