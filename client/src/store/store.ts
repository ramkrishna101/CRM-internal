import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import customersReducer from '../features/customers/customersSlice';
import coldLeadsReducer from '../features/cold-leads/coldLeadsSlice';
import interactionsReducer from '../features/interactions/interactionsSlice';
import reportingReducer from '../features/reporting/reportingSlice';
import usersReducer from '../features/users/usersSlice';
import integrationsReducer from '../features/integrations/integrationsSlice';
import transactionsReducer from '../features/transactions/transactionsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        customers: customersReducer,
        coldLeads: coldLeadsReducer,
        interactions: interactionsReducer,
        reporting: reportingReducer,
        users: usersReducer,
        integrations: integrationsReducer,
        transactions: transactionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
