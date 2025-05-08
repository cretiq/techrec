import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Role } from '@/types'; // Import the Role type

interface SelectedRolesState {
    // selectedRoleIds: string[];
    selectedRoles: Role[]; // Store full Role objects
}

const initialState: SelectedRolesState = {
    // selectedRoleIds: [],
    selectedRoles: [],
};

export const selectedRolesSlice = createSlice({
    name: 'selectedRoles',
    initialState,
    reducers: {
        toggleRoleSelection: (state, action: PayloadAction<Role>) => {
            const role = action.payload;
            const index = state.selectedRoles.findIndex(r => r.id === role.id);

            if (index === -1) {
                // Add role if not already selected
                state.selectedRoles.push(role);
            } else {
                // Remove role if already selected
                state.selectedRoles.splice(index, 1);
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
        },
        clearRoleSelection: (state) => {
            // Reset selected roles to an empty array
            state.selectedRoles = [];
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

// Selector to check if a specific role is selected by ID
export const selectIsRoleSelected = (state: RootState, roleId: string | undefined) =>
    roleId ? state.selectedRoles.selectedRoles.some(role => role.id === roleId) : false;

// Export the reducer
export default selectedRolesSlice.reducer; 