import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'manager' | 'agent';
    fullName?: string;
    managerId?: string;
    websiteId?: string;
    websiteName?: string;
    website?: {
        id: string;
        name: string;
    } | null;
    panels?: string[];
    createdAt: string;
}

interface UsersState {
    items: User[];
    loading: boolean;
    error: string | null;
    actionLoading: boolean; // For create/update/delete
    actionError: string | null;
    actionSuccess: string | null;
}

const normalizeUser = (user: any): User => ({
    ...user,
    websiteName: user.websiteName || user.website?.name || '',
});

const initialState: UsersState = {
    items: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
    actionSuccess: null,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/users');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/create',
    async (userData: Partial<User> & { password?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/users', userData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/users/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`/users/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearActionState: (state) => {
            state.actionError = null;
            state.actionSuccess = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Users
        builder.addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
            state.loading = false;
            state.items = action.payload.map(normalizeUser);
        });
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create User
        builder.addCase(createUser.pending, (state) => {
            state.actionLoading = true;
            state.actionError = null;
            state.actionSuccess = null;
        });
        builder.addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.actionLoading = false;
            state.items.push(normalizeUser(action.payload));
            state.actionSuccess = 'User created successfully';
        });
        builder.addCase(createUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.actionError = action.payload as string;
        });

        // Update User
        builder.addCase(updateUser.pending, (state) => {
            state.actionLoading = true;
            state.actionError = null;
            state.actionSuccess = null;
        });
        builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.actionLoading = false;
            const index = state.items.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = normalizeUser(action.payload);
            }
            state.actionSuccess = 'User updated successfully';
        });
        builder.addCase(updateUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.actionError = action.payload as string;
        });

        // Delete User
        builder.addCase(deleteUser.pending, (state) => {
            state.actionLoading = true;
            state.actionError = null;
            state.actionSuccess = null;
        });
        builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
            state.actionLoading = false;
            state.items = state.items.filter(u => u.id !== action.payload);
            state.actionSuccess = 'User deleted successfully';
        });
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.actionError = action.payload as string;
        });
    },
});

export const { clearActionState } = usersSlice.actions;
export default usersSlice.reducer;
