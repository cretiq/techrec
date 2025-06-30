'use client';

import React, { useState } from 'react';
import {  Card, CardContent, CardHeader, CardTitle, CardDescription  } from '@/components/ui-daisy/card';
import {  Button  } from '@/components/ui-daisy/button';
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useDispatch } from 'react-redux';
import { Role } from "@/types/role";
import { toggleRoleSelection } from '@/lib/features/selectedRolesSlice';
import { AppDispatch } from '@/lib/store';
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
    const dispatch = useDispatch<AppDispatch>();
    const paneId = `pane-${role.id}`;

    const handleRemoveRole = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(toggleRoleSelection(role));
    };

    return (
        <Card className="relative" data-testid={`write-multirole-card-${role.id}`}>
            <CardHeader className="pb-2 relative">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="line-clamp-1" data-testid={`write-multirole-title-${role.id}`}>
                            {role.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-1" data-testid={`write-multirole-company-${role.id}`}>
                            {role.company?.name || 'Unknown Company'}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveRole}
                        className="flex-shrink-0 h-8 w-8 text-base-content/50 hover:text-error hover:bg-error/10"
                        aria-label="Remove role"
                        title="Remove role"
                        data-testid={`write-multirole-remove-button-${role.id}`}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
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