import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

interface IntegrationsState {
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: IntegrationsState = {
    loading: false,
    error: null,
    successMessage: null,
};

export const sendMessage = createAsyncThunk(
    'integrations/sendMessage',
    async ({ customerId, channel, content, agentId }: { customerId: string; channel: 'whatsapp' | 'telegram' | 'sms'; content: string; agentId?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/integrations/message', { customerId, channel, content, agentId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

export const initiateCall = createAsyncThunk(
    'integrations/initiateCall',
    async ({ customerId, agentId }: { customerId: string; agentId: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/integrations/call', { customerId, agentId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to initiate call');
        }
    }
);

const integrationsSlice = createSlice({
    name: 'integrations',
    initialState,
    reducers: {
        clearIntegrationState: (state) => {
            state.error = null;
            state.successMessage = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        // Send Message
        builder.addCase(sendMessage.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
        });
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.loading = false;
            state.successMessage = action.payload.message;
        });
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Initiate Call
        builder.addCase(initiateCall.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.successMessage = null;
        });
        builder.addCase(initiateCall.fulfilled, (state, action) => {
            state.loading = false;
            state.successMessage = action.payload.message;
        });
        builder.addCase(initiateCall.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearIntegrationState } = integrationsSlice.actions;
export default integrationsSlice.reducer;
