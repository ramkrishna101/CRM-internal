import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: string;
    remark: string;
    panel: string;
    client: string;
    branch: string;
    sourceFile: string;
    website: string;
    createdAt: string;
    websiteHash: string | null;
}

interface TransactionsState {
    items: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    options: {
        panels: string[];
        websites: string[];
    };
}

const initialState: TransactionsState = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: false,
    error: null,
    options: {
        panels: [],
        websites: [],
    },
};

export const fetchTransactionOptions = createAsyncThunk(
    'transactions/fetchOptions',
    async (website: string | undefined, { rejectWithValue }) => {
        try {
            const response = await api.get('/transactions/options', {
                params: { website }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch options');
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchAll',
    async ({ page, limit, startDate, endDate, website, panel, type }: {
        page: number;
        limit: number;
        startDate?: string;
        endDate?: string;
        website?: string;
        panel?: string;
        type?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await api.get('/transactions', {
                params: { page, limit, startDate, endDate, website, panel, type },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setLimit: (state, action) => {
            state.limit = action.payload;
            state.page = 1; // Reset to first page when limit changes
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTransactionOptions.fulfilled, (state, action) => {
                state.options = action.payload;
            });
    },
});

export const { setPage, setLimit } = transactionsSlice.actions;
export default transactionsSlice.reducer;
