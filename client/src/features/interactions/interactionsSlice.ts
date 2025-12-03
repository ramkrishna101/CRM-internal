import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export interface Interaction {
    id: string;
    customerId: string;
    agentId: string;
    type: 'note' | 'call' | 'meeting' | 'email' | 'whatsapp' | 'telegram' | 'other';
    content: string;
    createdAt: string;
    agent?: {
        fullName: string;
        email: string;
    };
}

interface InteractionsState {
    items: Interaction[];
    loading: boolean;
    error: string | null;
    createLoading: boolean;
}

const initialState: InteractionsState = {
    items: [],
    loading: false,
    error: null,
    createLoading: false,
};

export const fetchInteractions = createAsyncThunk(
    'interactions/fetchByCustomer',
    async (customerId: string, { rejectWithValue }) => {
        try {
            const response = await api.get('/interactions', { params: { customerId } });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch interactions');
        }
    }
);

export const createInteraction = createAsyncThunk(
    'interactions/create',
    async (data: { customerId: string; type: string; content: string; agentId?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/interactions', data);
            return response.data;
        } catch (error: any) {
            const resp = error?.response?.data;
            let message = 'Failed to create interaction';
            if (resp) {
                if (typeof resp?.message === 'string') {
                    message = resp.message;
                } else if (Array.isArray(resp?.message)) {
                    message = resp.message.join(', ');
                } else if (typeof resp === 'string') {
                    message = resp;
                } else if (resp?.error) {
                    message = resp.error;
                }
            }
            return rejectWithValue(message);
        }
    }
);

const interactionsSlice = createSlice({
    name: 'interactions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInteractions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInteractions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchInteractions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createInteraction.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(createInteraction.fulfilled, (state, action) => {
                state.createLoading = false;
                state.items.unshift(action.payload); // Add to top
            })
            .addCase(createInteraction.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default interactionsSlice.reducer;
