import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Role } from '@/types'; // Import the Role type

interface SelectedRolesState {
    selectedRoles: Role[]; // Store full Role objects
    selectedRoleIds: Record<string, boolean>; // Fast O(1) lookup for selection state
}

const initialState: SelectedRolesState = {
    selectedRoles: [],
    selectedRoleIds: {},
};

export const selectedRolesSlice = createSlice({
    name: 'selectedRoles',
    initialState,
    reducers: {
        toggleRoleSelection: (state, action: PayloadAction<Role>) => {
            const role = action.payload;
            const isSelected = state.selectedRoleIds[role.id];

            if (!isSelected) {
                // Add role if not already selected
                state.selectedRoles.push(role);
                state.selectedRoleIds[role.id] = true;
            } else {
                // Remove role if already selected
                const index = state.selectedRoles.findIndex(r => r.id === role.id);
                if (index !== -1) {
                    state.selectedRoles.splice(index, 1);
                }
                delete state.selectedRoleIds[role.id];
            }
        },
        setSelectedRoles: (state, action: PayloadAction<Role[]>) => {
            // Set the entire array of selected roles
            // Ensure uniqueness just in case
            const uniqueRolesMap = new Map<string, Role>();
            action.payload.forEach(role => {
                if (role && role.id) { // Add checks for valid role and id
                    uniqueRolesMap.set(role.id, role);
                }
            });
            
            state.selectedRoles = Array.from(uniqueRolesMap.values());
            
            // Rebuild the lookup object
            state.selectedRoleIds = {};
            state.selectedRoles.forEach(role => {
                state.selectedRoleIds[role.id] = true;
            });
        },
        clearRoleSelection: (state) => {
            // Reset selected roles to an empty array
            state.selectedRoles = [];
            state.selectedRoleIds = {};
        },
    },
});

// Export actions
export const { toggleRoleSelection, setSelectedRoles, clearRoleSelection } =
    selectedRolesSlice.actions;

// Export selectors
// export const selectSelectedRoleIds = (state: RootState) =>
//     state.selectedRoles.selectedRoleIds;
export const selectSelectedRoles = (state: RootState) =>
    state.selectedRoles.selectedRoles;

export const selectSelectedRolesCount = (state: RootState) =>
    state.selectedRoles.selectedRoles.length;

// Selector to check if a specific role is selected by ID - O(1) lookup
export const selectIsRoleSelected = (state: RootState, roleId: string | undefined) =>
    roleId ? Boolean(state.selectedRoles.selectedRoleIds[roleId]) : false;

// Export the reducer
export default selectedRolesSlice.reducer; 