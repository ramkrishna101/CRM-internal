import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export interface ColdLead {
    id: string;
    websiteId: string;
    externalId: string;
    username: string;
    email: string;
    phone: string;
    status: 'available' | 'claimed';
    claimedById: string | null;
    claimedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ColdLeadsState {
    availableLeads: ColdLead[];
    myLeads: ColdLead[];
    loading: boolean;
    error: string | null;
    claimSuccess: string | null;
    claimLoading: string | null;
}

const initialState: ColdLeadsState = {
    availableLeads: [],
    myLeads: [],
    loading: false,
    error: null,
    claimSuccess: null,
    claimLoading: null,
};

export const fetchAvailableLeads = createAsyncThunk(
    'coldLeads/fetchAvailable',
    async ({ websiteId, limit }: { websiteId: string; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/cold-leads/available`, {
                params: { websiteId, limit },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch available leads');
        }
    }
);

export const fetchMyLeads = createAsyncThunk(
    'coldLeads/fetchMyLeads',
    async (agentId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/cold-leads/my-leads`, {
                params: { agentId },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my leads');
        }
    }
);

export const claimLead = createAsyncThunk(
    'coldLeads/claim',
    async ({ leadId, agentId }: { leadId: string; agentId: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`/cold-leads/${leadId}/claim`, { agentId });
            // Refresh lists after claiming
            dispatch(fetchMyLeads(agentId));
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to claim lead');
        }
    }
);

export const promoteLead = createAsyncThunk(
    'coldLeads/promote',
    async ({ leadId, agentId }: { leadId: string; agentId: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`/cold-leads/${leadId}/promote`, { agentId });
            // Refresh lists after promoting
            dispatch(fetchMyLeads(agentId));
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to promote lead');
        }
    }
);

const coldLeadsSlice = createSlice({
    name: 'coldLeads',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearClaimSuccess: (state) => {
            state.claimSuccess = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Available Leads
        builder.addCase(fetchAvailableLeads.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAvailableLeads.fulfilled, (state, action: PayloadAction<ColdLead[]>) => {
            state.loading = false;
            state.availableLeads = action.payload;
        });
        builder.addCase(fetchAvailableLeads.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch My Leads
        builder.addCase(fetchMyLeads.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchMyLeads.fulfilled, (state, action: PayloadAction<ColdLead[]>) => {
            state.loading = false;
            state.myLeads = action.payload;
        });
        builder.addCase(fetchMyLeads.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Claim Lead
        builder.addCase(claimLead.pending, (state, action) => {
            state.claimLoading = action.meta.arg.leadId;
            state.error = null;
            state.claimSuccess = null;
        });
        builder.addCase(claimLead.fulfilled, (state, action: PayloadAction<ColdLead>) => {
            state.claimLoading = null;
            state.claimSuccess = 'Lead claimed successfully!';
            // Remove claimed lead from available list
            state.availableLeads = state.availableLeads.filter((lead) => lead.id !== action.payload.id);
        });
        builder.addCase(claimLead.rejected, (state, action) => {
            state.claimLoading = null;
            state.error = action.payload as string;
        });

        // Promote Lead
        builder.addCase(promoteLead.pending, (state, action) => {
            state.claimLoading = action.meta.arg.leadId;
            state.error = null;
            state.claimSuccess = null;
        });
        builder.addCase(promoteLead.fulfilled, (state, action) => {
            state.claimLoading = null;
            state.claimSuccess = 'Lead promoted to customer successfully!';
            state.myLeads = state.myLeads.filter((lead) => lead.id !== action.meta.arg.leadId);
        });
        builder.addCase(promoteLead.rejected, (state, action) => {
            state.claimLoading = null;
            state.error = action.payload as string;
        });
    },
});

export const { clearError, clearClaimSuccess } = coldLeadsSlice.actions;
export default coldLeadsSlice.reducer;
