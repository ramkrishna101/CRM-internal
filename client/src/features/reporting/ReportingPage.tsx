import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import {
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    Phone as PhoneIcon,
    TrendingUp as TrendingUpIcon,
    Group as GroupIcon,
} from '@mui/icons-material';
import { fetchAgentPerformance, fetchManagerDashboard, clearError } from './reportingSlice';
import type { AppDispatch, RootState } from '../../store/store';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ color: color, display: 'flex', p: 1, borderRadius: '50%', bgcolor: `${color}20` }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const ReportingPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { agentPerformance, managerDashboard, loading, error } = useSelector((state: RootState) => state.reporting);
    const { user } = useSelector((state: RootState) => state.auth);

    const isManager = user?.role === 'manager' || user?.role === 'admin';

    useEffect(() => {
        if (user?.id) {
            if (isManager) {
                dispatch(fetchManagerDashboard(user.id));
            } else {
                dispatch(fetchAgentPerformance({ agentId: user.id }));
            }
        }
    }, [dispatch, user?.id, isManager]);

    if (loading && !agentPerformance && !managerDashboard) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const renderAgentView = () => (
        agentPerformance && (
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Customers"
                        value={agentPerformance.totalCustomers}
                        icon={<PeopleIcon fontSize="large" />}
                        color="#1976d2"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Deposits"
                        value={`$${Number(agentPerformance.totalDeposits).toFixed(2)}`}
                        icon={<MoneyIcon fontSize="large" />}
                        color="#2e7d32"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Claimed Leads"
                        value={agentPerformance.claimedLeads}
                        icon={<PhoneIcon fontSize="large" />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Retention Rate"
                        value={`${Number(agentPerformance.retentionRate).toFixed(1)}%`}
                        icon={<TrendingUpIcon fontSize="large" />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>
        )
    );

    const renderManagerView = () => (
        managerDashboard && (
            <Box>
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            title="Team Size"
                            value={managerDashboard.teamSize}
                            icon={<GroupIcon fontSize="large" />}
                            color="#1976d2"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            title="Team Total Deposits"
                            value={`$${Number(managerDashboard.totalDeposits).toFixed(2)}`}
                            icon={<MoneyIcon fontSize="large" />}
                            color="#2e7d32"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            title="Avg Retention Rate"
                            value={`${Number(managerDashboard.averageRetentionRate).toFixed(1)}%`}
                            icon={<TrendingUpIcon fontSize="large" />}
                            color="#9c27b0"
                        />
                    </Grid>
                </Grid>

                <Typography variant="h5" gutterBottom>
                    Agent Performance
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Agent ID</TableCell>
                                <TableCell align="right">Customers</TableCell>
                                <TableCell align="right">Deposits</TableCell>
                                <TableCell align="right">Claimed Leads</TableCell>
                                <TableCell align="right">Retention</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {managerDashboard.agents.map((agent) => (
                                <TableRow key={agent.agentId}>
                                    <TableCell component="th" scope="row">
                                        {agent.agentId}
                                    </TableCell>
                                    <TableCell align="right">{agent.totalCustomers}</TableCell>
                                    <TableCell align="right">${Number(agent.totalDeposits).toFixed(2)}</TableCell>
                                    <TableCell align="right">{agent.claimedLeads}</TableCell>
                                    <TableCell align="right">{Number(agent.retentionRate).toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                            {managerDashboard.agents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No agents found in your team.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        )
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {isManager ? 'Team Dashboard' : 'My Performance'}
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isManager ? renderManagerView() : renderAgentView()}
        </Box>
    );
};

export default ReportingPage;
