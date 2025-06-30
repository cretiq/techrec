"use client"

import React from "react"
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui-daisy/card'
import { Button } from '@/components/ui-daisy/button'
import { X, Building } from "lucide-react"
import { selectSelectedRoles, toggleRoleSelection } from '@/lib/features/selectedRolesSlice'
import { AppDispatch } from '@/lib/store'

export default function SelectedRolesList() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedRoles = useSelector(selectSelectedRoles)

  // Only render if there are selected roles
  if (selectedRoles.length === 0) {
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
          Selected Roles ({selectedRoles.length})
        </CardTitle>
      </CardHeader>
      <CardContent data-testid="selected-roles-list-content">
        <div className="space-y-2 max-h-[40rem] overflow-y-auto" data-testid="selected-roles-list-container">
          {selectedRoles.map((role) => (
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