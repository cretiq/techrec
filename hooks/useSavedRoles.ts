import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import { 
  selectSavedRoles, 
  selectSavedRolesStatus, 
  selectSavedRolesError,
  selectSavedRoleByRoleId,
  selectIsMarkingAsApplied,
  selectIsUnApplying,
  selectApplicationActivity
} from '@/lib/features/savedRolesSlice'
import type { RootState } from '@/lib/store'

export function useSavedRoles() {
  const savedRoles = useSelector(selectSavedRoles)
  const status = useSelector(selectSavedRolesStatus)
  const error = useSelector(selectSavedRolesError)
  
  return {
    savedRoles,
    status,
    error,
    isLoading: status === 'loading'
  }
}

export function useSavedRoleStatus(roleId: string) {
  const savedRole = useSelector((state: RootState) => selectSavedRoleByRoleId(roleId)(state))
  const isMarkingAsApplied = useSelector((state: RootState) => selectIsMarkingAsApplied(roleId)(state))
  const isUnApplying = useSelector((state: RootState) => selectIsUnApplying(roleId)(state))
  
  return {
    savedRole,
    isSaved: Boolean(savedRole),
    isApplied: Boolean(savedRole?.appliedFor),
    isMarkingAsApplied,
    isUnApplying,
    appliedAt: savedRole?.appliedAt
  }
}

export function useApplicationActivity() {
  const activity = useSelector(selectApplicationActivity)
  
  return {
    activityData: activity.activityData,
    summary: activity.summary,
    totalApplications: activity.summary?.totalApplications || 0,
    daysWithActivity: activity.summary?.daysWithActivity || 0
  }
}