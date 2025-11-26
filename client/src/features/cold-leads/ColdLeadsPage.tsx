import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    Chip,
} from '@mui/material';
import { fetchAvailableLeads, fetchMyLeads, claimLead, promoteLead, clearClaimSuccess, clearError } from './coldLeadsSlice';
import type { AppDispatch, RootState } from '../../store/store';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ColdLeadsPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { availableLeads, myLeads, loading, error, claimLoading, claimSuccess } = useSelector((state: RootState) => state.coldLeads);
    const { user } = useSelector((state: RootState) => state.auth);

    const [tabValue, setTabValue] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Hardcoded websiteId for demo
    const websiteId = '6e9a7f98-6181-49d7-b759-7365ac7328f6';

    useEffect(() => {
        if (tabValue === 0) {
            dispatch(fetchAvailableLeads({ websiteId, limit: 50 }));
        } else if (tabValue === 1 && user?.id) {
            dispatch(fetchMyLeads(user.id));
        }
    }, [dispatch, tabValue, user?.id]);

    useEffect(() => {
        if (claimSuccess) {
            setSnackbarOpen(true);
        }
    }, [claimSuccess]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleClaim = async (leadId: string) => {
        if (!user?.id) return;
        dispatch(claimLead({ leadId, agentId: user.id }));
    };

    const handlePromote = async (leadId: string) => {
        if (!user?.id) return;
        dispatch(promoteLead({ leadId, agentId: user.id }));
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        dispatch(clearClaimSuccess());
    };

    const renderTable = (leads: typeof availableLeads, isMyLeads: boolean) => (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="cold leads table">
                <TableHead>
                    <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Status</TableCell>
                        {isMyLeads && <TableCell>Claimed At</TableCell>}
                        <TableCell align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow
                            key={lead.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {lead.username || 'N/A'}
                            </TableCell>
                            <TableCell>{lead.email || 'N/A'}</TableCell>
                            <TableCell>{lead.phone || 'N/A'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={lead.status}
                                    color={lead.status === 'available' ? 'success' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            {isMyLeads && (
                                <TableCell>
                                    {lead.claimedAt ? new Date(lead.claimedAt).toLocaleString() : '-'}
                                </TableCell>
                            )}
                            <TableCell align="right">
                                {!isMyLeads ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleClaim(lead.id)}
                                        disabled={claimLoading === lead.id}
                                    >
                                        {claimLoading === lead.id ? 'Claiming...' : 'Claim'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        onClick={() => handlePromote(lead.id)}
                                        disabled={claimLoading === lead.id}
                                    >
                                        {claimLoading === lead.id ? 'Promoting...' : 'Promote'}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {leads.length === 0 && !loading && (
                        <TableRow>
                            <TableCell colSpan={isMyLeads ? 6 : 5} align="center">
                                {isMyLeads ? 'You have not claimed any leads yet.' : 'No available leads found.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Cold Leads Management
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="cold leads tabs">
                    <Tab label="Available Leads" />
                    <Tab label="My Leads" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                {loading && availableLeads.length === 0 ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    renderTable(availableLeads, false)
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {loading && myLeads.length === 0 ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    renderTable(myLeads, true)
                )}
            </TabPanel>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={claimSuccess}
            />
        </Box>
    );
};

export default ColdLeadsPage;
