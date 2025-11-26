import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export interface AgentPerformance {
    agentId: string;
    totalCustomers: number;
    claimedLeads: number;
    totalDeposits: number;
    retainedCustomers: number;
    retentionRate: number;
}

export interface ManagerDashboard {
    managerId: string;
    teamSize: number;
    totalDeposits: number;
    totalCustomers: number;
    totalClaimed: number;
    totalRetained: number;
    averageRetentionRate: number;
    agents: AgentPerformance[];
}

interface ReportingState {
    agentPerformance: AgentPerformance | null;
    managerDashboard: ManagerDashboard | null;
    loading: boolean;
    error: string | null;
}

const initialState: ReportingState = {
    agentPerformance: null,
    managerDashboard: null,
    loading: false,
    error: null,
};

export const fetchAgentPerformance = createAsyncThunk(
    'reporting/fetchAgentPerformance',
    async ({ agentId, startDate, endDate }: { agentId: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/reporting/agent/${agentId}`, {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent performance');
        }
    }
);

export const fetchManagerDashboard = createAsyncThunk(
    'reporting/fetchManagerDashboard',
    async (managerId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/reporting/manager/${managerId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch manager dashboard');
        }
    }
);

const reportingSlice = createSlice({
    name: 'reporting',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Agent Performance
        builder.addCase(fetchAgentPerformance.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAgentPerformance.fulfilled, (state, action: PayloadAction<AgentPerformance>) => {
            state.loading = false;
            state.agentPerformance = action.payload;
        });
        builder.addCase(fetchAgentPerformance.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Manager Dashboard
        builder.addCase(fetchManagerDashboard.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchManagerDashboard.fulfilled, (state, action: PayloadAction<ManagerDashboard>) => {
            state.loading = false;
            state.managerDashboard = action.payload;
        });
        builder.addCase(fetchManagerDashboard.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearError } = reportingSlice.actions;
export default reportingSlice.reducer;
