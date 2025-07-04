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
    const [isRemoveHovered, setIsRemoveHovered] = useState(false);

    const handleRemoveRole = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(toggleRoleSelection(role));
    };

    const handleRemoveHover = (isHovered: boolean) => {
        setIsRemoveHovered(isHovered);
    };

    return (
        <motion.div
            animate={isRemoveHovered ? {
                boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 20px 4px rgba(239, 68, 68, 0.4)",
                    "0 0 30px 6px rgba(239, 68, 68, 0.2)",
                    "0 0 40px 8px rgba(239, 68, 68, 0.1)"
                ],
            } : {
                boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)",
                scale: 1
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
        >
            <Card 
                className={`relative transition-all duration-300 ${
                    isRemoveHovered ? 'bg-error/5 border-error/30' : ''
                }`} 
                data-testid={`write-multirole-card-${role.id}`}
            >
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
                            onRemoveRole={handleRemoveRole}
                            onRemoveHover={handleRemoveHover}
                        />}
                    {activeTab === 'cv' && <CVOptimizer />}
                    {activeTab === 'outreach' && 
                        <OutreachMessageGenerator 
                            role={role}
                            generationTrigger={generationTrigger} 
                            onGenerationComplete={onGenerationComplete}
                            isMultiRoleMode={true}
                            onRemoveRole={handleRemoveRole}
                            onRemoveHover={handleRemoveHover}
                        />}
                    </div>
                </CardContent>
            </motion.div>
            </Card>
        </motion.div>
    );
} 