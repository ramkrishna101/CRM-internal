import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
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
    CircularProgress,
    Alert,
    TextField,
    Chip,
    IconButton,
    Tooltip,
    TablePagination,
    Grid,
    MenuItem,
} from '@mui/material';
import { WhatsApp, Phone } from '@mui/icons-material';
import api from '../../utils/axios';
import CommunicationDialog from '../integrations/CommunicationDialog';

interface TransactionClient {
    client: string;
    branch: string;
    panel: string;
    website: string;
    status: string;
    transactionCount: number;
    totalDeposits: number;
    totalWithdrawals: number;
    lastDepositDate: string | null;
}

/* --------------------------------------------------------------- */
/*                     Component definition                         */
/* --------------------------------------------------------------- */
const TransactionClientsPage = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    /* --------------------------- State --------------------------- */
    const [clients, setClients] = useState<TransactionClient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is admin
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';
    
    // Get user's website name (we'll need to fetch it or get from token)
    const [userWebsiteName, setUserWebsiteName] = useState<string | null>(currentUser?.websiteName || null);

    // filter state
    const [search, setSearch] = useState('');
    const [lastDepositDate, setLastDepositDate] = useState('');
    const [website, setWebsite] = useState('');
    const [panel, setPanel] = useState('');

    // options for website / panel dropdowns
    const [options, setOptions] = useState<{ websites: string[]; panels: string[] }>({
        websites: [],
        panels: [],
    });

    // pagination
    const [page, setPage] = useState(0); // MUI page is 0‑based
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    // contact dialog
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);

    /* ---------------------- Load user's website name ----------------------- */
    useEffect(() => {
        if (isAdmin) {
            setUserWebsiteName(null);
            return;
        }

        if (currentUser?.websiteName) {
            setUserWebsiteName(currentUser.websiteName);
            return;
        }

        const loadUserWebsite = async () => {
            if (currentUser?.websiteId) {
                try {
                    const resp = await api.get(`/websites/${currentUser.websiteId}`);
                    setUserWebsiteName(resp.data?.name || null);
                } catch (e) {
                    console.error('Failed to load user website', e);
                }
            } else {
                setUserWebsiteName(null);
            }
        };

        loadUserWebsite();
    }, [currentUser?.websiteName, currentUser?.websiteId, isAdmin]);

    /* ---------------------- Load options ----------------------- */
    // 1️⃣ Load websites and panels based on user restrictions
    useEffect(() => {
        const loadOptions = async () => {
            try {
                // If user has website restriction, load panels for that website
                const params: any = {};
                if (!isAdmin && userWebsiteName) {
                    params.website = userWebsiteName;
                }
                
                const resp = await api.get('/transactions/options', { params });
                
                // Filter websites if user has restriction
                let availableWebsites = resp.data.websites || [];
                if (!isAdmin && userWebsiteName) {
                    availableWebsites = availableWebsites.filter((w: string) => w === userWebsiteName);
                }
                
                // Filter panels if user has restrictions
                let availablePanels = resp.data.panels || [];
                if (!isAdmin && currentUser?.panels && currentUser.panels.length > 0) {
                    availablePanels = availablePanels.filter((p: string) => 
                        currentUser.panels!.includes(p)
                    );
                }
                
                setOptions({
                    websites: availableWebsites,
                    panels: availablePanels,
                });
                
                // Auto-set website filter if user has restriction
                if (!isAdmin && userWebsiteName && !website) {
                    setWebsite(userWebsiteName);
                }
            } catch (e) {
                console.error('Failed to load options', e);
            }
        };
        loadOptions();
    }, [isAdmin, userWebsiteName, currentUser?.panels, website]);

    // 2️⃣ Load panels whenever a website changes
    useEffect(() => {
        const loadPanels = async () => {
            try {
                const params: any = {};
                if (website) {
                    params.website = website;
                }
                const resp = await api.get('/transactions/options', { params });
                let panels = resp.data?.panels || [];
                
                // Filter panels if user has restrictions
                if (!isAdmin && currentUser?.panels && currentUser.panels.length > 0) {
                    panels = panels.filter((p: string) => currentUser.panels!.includes(p));
                }
                
                setOptions(prev => ({ ...prev, panels }));
            } catch (e) {
                console.error('Failed to load panels', e);
                setOptions(prev => ({ ...prev, panels: [] }));
            }
        };
        loadPanels();
    }, [website, isAdmin, currentUser?.panels]);

    /* ---------------------- Fetch clients ---------------------- */
    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            setError(null);
            try {
                const params: any = {
                    page: page + 1, // API expects 1‑based page
                    limit: rowsPerPage,
                };
                
                if (search) params.search = search;
                if (lastDepositDate) params.lastDepositDate = lastDepositDate;
                if (website) params.website = website;
                if (panel) params.panel = panel;
                
                const response = await api.get('/transactions/clients', { params });
                setClients(response.data.items);
                setTotal(response.data.total);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch clients');
            } finally {
                setLoading(false);
            }
        };

        // debounce search / filter changes (500 ms)
        const timeout = setTimeout(fetchClients, 500);
        return () => clearTimeout(timeout);
    }, [
        page,
        rowsPerPage,
        search,
        lastDepositDate,
        website,
        panel,
    ]);

    /* ------------------------ Handlers ------------------------ */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const handleLastDepositDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastDepositDate(e.target.value);
        setPage(0);
    };

    const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWebsite(e.target.value);
        setPanel(''); // reset panel when website changes
        setPage(0);
    };

    const handlePanelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPanel(e.target.value);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleContactClick = (e: React.MouseEvent, client: TransactionClient) => {
        e.stopPropagation();
        setSelectedClient({ id: client.client, name: client.client });
        setContactDialogOpen(true);
    };

    const handleClientClick = (clientName: string) => {
        navigate(`/customers/transaction-client/${encodeURIComponent(clientName)}`);
    };

    /* -------------------------- UI --------------------------- */

    /* ---------------------- Render ---------------------- */
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Transaction Clients
            </Typography>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            label="Search"
                            fullWidth
                            value={search}
                            onChange={handleSearchChange}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            label="Last Deposit Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={lastDepositDate}
                            onChange={handleLastDepositDateChange}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            select
                            label="Website"
                            fullWidth
                            value={website}
                            onChange={handleWebsiteChange}
                            size="small"
                            disabled={!isAdmin && userWebsiteName !== null}
                            helperText={!isAdmin && userWebsiteName ? 'Restricted to your assigned website' : ''}
                        >
                            <MenuItem value="">All</MenuItem>
                            {options.websites.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            select
                            label="Panel"
                            fullWidth
                            value={panel}
                            onChange={handlePanelChange}
                            size="small"
                            disabled={!isAdmin && currentUser?.panels && currentUser.panels.length > 0}
                            helperText={!isAdmin && currentUser?.panels && currentUser.panels.length > 0 ? 'Restricted to your assigned panels' : ''}
                        >
                            <MenuItem value="">All</MenuItem>
                            {options.panels.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="transaction clients table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Panel</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Website</TableCell>
                            <TableCell align="right">Total Deposits</TableCell>
                            <TableCell>Last Deposit</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map(client => (
                            <TableRow
                                key={client.client}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => handleClientClick(client.client)}
                            >
                                <TableCell component="th" scope="row">{client.client}</TableCell>
                                <TableCell>{client.panel || client.branch || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip label={client.status} color="success" size="small" />
                                </TableCell>
                                <TableCell>{client.website}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={`$${Number(client.totalDeposits).toFixed(2)}`}
                                        color="success"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {client.lastDepositDate
                                        ? new Date(client.lastDepositDate).toLocaleDateString()
                                        : 'No deposits'}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="WhatsApp">
                                        <IconButton
                                            color="success"
                                            size="small"
                                            onClick={e => handleContactClick(e, client)}
                                        >
                                            <WhatsApp />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Call">
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={e => handleContactClick(e, client)}
                                        >
                                            <Phone />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {clients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No clients found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Contact dialog – receives client id for future use */}
            <CommunicationDialog
                open={contactDialogOpen}
                onClose={() => setContactDialogOpen(false)}
                customerId={selectedClient?.id || ''}
                customerName={selectedClient?.name || ''}
            />
        </Box>
    );
};

export default TransactionClientsPage;
