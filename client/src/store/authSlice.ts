import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    role: string;
    websiteId?: string;
    websiteName?: string;
    panels?: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

// Helper function to decode token and get user info
const getUserFromToken = (token: string | null): User | null => {
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            websiteId: decoded.websiteId,
            websiteName: decoded.websiteName,
            panels: decoded.panels || [],
        };
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};

const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
    user: getUserFromToken(storedToken),
    token: storedToken,
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            return access_token;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload;
                // Decode token to get user info (simplified for now)
                try {
                    const decoded: any = jwtDecode(action.payload);
                    state.user = {
                        id: decoded.sub,
                        email: decoded.email,
                        role: decoded.role,
                        websiteId: decoded.websiteId,
                        websiteName: decoded.websiteName,
                        panels: decoded.panels || [],
                    };
                } catch (e) {
                    console.error("Failed to decode token", e);
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
