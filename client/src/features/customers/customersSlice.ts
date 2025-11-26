import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export interface Customer {
    id: string;
    websiteId: string;
    externalId: string;
    username: string;
    email: string;
    phone: string;
    totalDeposits: number;
    lastDepositDate: string;
    status: string;
    category: string;
    assignedAgentId: string | null;
    createdAt: string;
    language?: string;
    retentionRM?: string;
    pullbackRM?: string;
    clientName?: string;
    branch?: string;
    idStatus?: string;
    gameInterest?: string;
    panelName?: string;
    websiteName?: string;
}

interface CustomersState {
    items: Customer[];
    loading: boolean;
    error: string | null;
    options: {
        websites: string[];
        branches: string[];
    };
}

const initialState: CustomersState = {
    items: [],
    loading: false,
    error: null,
    options: {
        websites: [],
        branches: [],
    },
};

export const fetchCustomerOptions = createAsyncThunk(
    'customers/fetchOptions',
    async (website: string | undefined, { rejectWithValue }) => {
        try {
            const response = await api.get('/customers/options', {
                params: { website }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch options');
        }
    }
);

export const fetchCustomers = createAsyncThunk(
    'customers/fetchAll',
    async (filters: {
        websiteId?: string;
        search?: string;
        status?: string;
        lastDepositDate?: string;
        website?: string;
        branch?: string;
    } = {}, { rejectWithValue }) => {
        try {
            const { websiteId, search, status, lastDepositDate, website, branch } = filters;
            const params: any = {};
            if (websiteId) params.websiteId = websiteId;
            if (search) params.search = search;
            if (status) params.status = status;
            if (lastDepositDate) params.lastDepositDate = lastDepositDate;
            if (website) params.website = website;
            if (branch) params.branch = branch;
            const response = await api.get('/customers', { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
        }
    }
);

export const fetchCustomerById = createAsyncThunk(
    'customers/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/customers/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
        }
    }
);

const customersSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCustomerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomerById.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                } else {
                    state.items.push(action.payload);
                }
            })
            .addCase(fetchCustomerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCustomerOptions.fulfilled, (state, action) => {
                state.options = action.payload;
            });
    },
});

export default customersSlice.reducer;
