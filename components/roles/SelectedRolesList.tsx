"use client"

import React from "react"
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-daisy/card'
import { Button } from '@/components/ui-daisy/button'
import { X, Building } from "lucide-react"
import { selectSelectedRoles, toggleRoleSelection, deduplicateSelectedRoles } from '@/lib/features/selectedRolesSlice'
import { AppDispatch } from '@/lib/store'

export default function SelectedRolesList() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedRoles = useSelector(selectSelectedRoles)

  // Auto-fix duplicates on component mount
  React.useEffect(() => {
    const roleIds = selectedRoles.map(r => r.id);
    const uniqueIds = new Set(roleIds);
    
    if (roleIds.length !== uniqueIds.size) {
      console.warn('[SelectedRolesList] Duplicate role IDs detected, auto-fixing...', {
        totalRoles: roleIds.length,
        uniqueRoles: uniqueIds.size,
        duplicateIds: roleIds.filter((id, index) => roleIds.indexOf(id) !== index)
      });
      
      // Automatically fix duplicates
      dispatch(deduplicateSelectedRoles());
    }
  }, [selectedRoles, dispatch]);

  // Debug logging for duplicate detection
  if (process.env.NODE_ENV === 'development') {
    const roleIds = selectedRoles.map(r => r.id);
    const uniqueIds = new Set(roleIds);
    if (roleIds.length !== uniqueIds.size) {
      console.warn('[SelectedRolesList] Duplicate role IDs still present:', {
        totalRoles: roleIds.length,
        uniqueRoles: uniqueIds.size,
        duplicateIds: roleIds.filter((id, index) => roleIds.indexOf(id) !== index)
      });
    }
  }

  // Deduplicate roles as a safety measure to prevent React key errors
  const uniqueSelectedRoles = React.useMemo(() => {
    const uniqueRolesMap = new Map<string, typeof selectedRoles[0]>();
    selectedRoles.forEach(role => {
      if (role && role.id) {
        // Keep the first occurrence of each role ID
        if (!uniqueRolesMap.has(role.id)) {
          uniqueRolesMap.set(role.id, role);
        }
      }
    });
    return Array.from(uniqueRolesMap.values());
  }, [selectedRoles]);

  // Only render if there are selected roles
  if (uniqueSelectedRoles.length === 0) {
    return null
  }

  const handleRemoveRole = (roleId: string) => {
    const roleToRemove = selectedRoles.find(role => role.id === roleId)
    if (roleToRemove) {
      dispatch(toggleRoleSelection(roleToRemove))
    }
  }

  return (
    <Card 
      variant="transparent" 
      className="bg-base-100/60 backdrop-blur-sm rounded-lg shadow-lg border border-base-200"
      data-testid="selected-roles-list-card"
    >
      <CardHeader data-testid="selected-roles-list-header">
        <CardTitle className="text-lg font-semibold" data-testid="selected-roles-list-title">
          Selected Roles ({uniqueSelectedRoles.length})
        </CardTitle>
        {process.env.NODE_ENV === 'development' && selectedRoles.length !== uniqueSelectedRoles.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(deduplicateSelectedRoles())}
            className="mt-2 text-xs bg-warning/10 border-warning text-warning-content hover:bg-warning/20"
            data-testid="selected-roles-list-deduplicate-button"
          >
            Fix Duplicates ({selectedRoles.length - uniqueSelectedRoles.length})
          </Button>
        )}
      </CardHeader>
      <CardContent data-testid="selected-roles-list-content">
        <div className="space-y-2 max-h-[40rem] overflow-y-auto" data-testid="selected-roles-list-container">
          {uniqueSelectedRoles.map((role) => (
            <Card
              key={role.id}
              variant="transparent"
              compact
              className="p-2 border border-base-300/50 bg-base-100/40 hover:bg-base-100/60"
              data-testid={`selected-roles-list-item-${role.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-1" data-testid={`selected-roles-list-title-${role.id}`}>
                    {role.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-base-content/70" data-testid={`selected-roles-list-company-${role.id}`}>
                    <Building className="h-3 w-3" />
                    <span className="line-clamp-1">{role.company?.name || 'Unknown Company'}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRole(role.id)}
                  className="flex-shrink-0 h-6 w-6 text-base-content/50 hover:text-error hover:bg-error/10"
                  title="Remove from selection"
                  data-testid={`selected-roles-list-remove-button-${role.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}