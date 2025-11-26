import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { fetchCustomerById } from './customersSlice';
import InteractionForm from '../interactions/InteractionForm';
import InteractionList from '../interactions/InteractionList';
import CommunicationDialog from '../integrations/CommunicationDialog';
import type { AppDispatch, RootState } from '../../store/store';

const CustomerDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector((state: RootState) => state.customers);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);

    const customer = items.find(c => c.id === id);

    useEffect(() => {
        if (id && !customer) {
            dispatch(fetchCustomerById(id));
        }
    }, [dispatch, id, customer]);

    if (loading && !customer) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!customer) {
        return <Alert severity="warning">Customer not found</Alert>;
    }

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/customers')}
                sx={{ mb: 2 }}
            >
                Back to Customers
            </Button>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {customer.username}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                            {customer.email}
                        </Typography>
                        <Chip
                            label={customer.status}
                            color={customer.status === 'retained' ? 'success' : 'default'}
                            sx={{ mt: 1 }}
                        />

                        <Box mt={3}>
                            <Typography variant="subtitle2">Phone</Typography>
                            <Typography variant="body1">{customer.phone || 'N/A'}</Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => setContactDialogOpen(true)}
                        >
                            Contact Customer
                        </Button>

                        <Box mt={2}>
                            <Typography variant="subtitle2">Website</Typography>
                            <Typography variant="body1">{customer.websiteName || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Panel Name</Typography>
                            <Typography variant="body1">{customer.panelName || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Created Date</Typography>
                            <Typography variant="body1">{customer.createdDate ? new Date(customer.createdDate).toLocaleDateString() : '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Language</Typography>
                            <Typography variant="body1">{customer.language || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Retention RM</Typography>
                            <Typography variant="body1">{customer.retentionRM || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Pullback RM</Typography>
                            <Typography variant="body1">{customer.pullbackRM || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Client Name</Typography>
                            <Typography variant="body1">{customer.clientName || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Branch</Typography>
                            <Typography variant="body1">{customer.branch || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">ID Status</Typography>
                            <Typography variant="body1">{customer.idStatus || '-'}
                            </Typography>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="subtitle2">Game Interest</Typography>
                            <Typography variant="body1">{customer.gameInterest || '-'}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Financial Overview
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="subtitle2">Total Deposits</Typography>
                                <Typography variant="h4">
                                    ${Number(customer.totalDeposits).toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="subtitle2">Last Deposit Date</Typography>
                                <Typography variant="h6">
                                    {customer.lastDepositDate ? new Date(customer.lastDepositDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box mt={4}>
                            <Typography variant="h6" gutterBottom>
                                Interaction History
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <InteractionForm customerId={customer.id} />
                            <InteractionList customerId={customer.id} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <CommunicationDialog
                open={contactDialogOpen}
                onClose={() => setContactDialogOpen(false)}
                customerId={customer.id}
                customerName={customer.username}
                customerPhone={customer.phone}
            />
        </Box>
    );
};

export default CustomerDetailPage;
