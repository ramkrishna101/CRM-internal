import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { fetchUsers, deleteUser, clearActionState, type User } from './usersSlice';
import UserForm from './UserForm';
import type { AppDispatch, RootState } from '../../store/store';

const UsersPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: users, loading, error, actionSuccess } = useSelector((state: RootState) => state.users);

    const [openForm, setOpenForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        if (actionSuccess) {
            setSnackbarOpen(true);
            setOpenForm(false);
            setSelectedUser(null);
        }
    }, [actionSuccess]);

    const handleCreate = () => {
        setSelectedUser(null);
        setOpenForm(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setOpenForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await dispatch(deleteUser(id));
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        dispatch(clearActionState());
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'error';
            case 'manager': return 'warning';
            case 'agent': return 'success';
            default: return 'default';
        }
    };

    if (loading && users.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">User Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Add User
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.fullName || '-'}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role.toUpperCase()}
                                        color={getRoleColor(user.role) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {user.managerId ? users.find(u => u.id === user.managerId)?.fullName || 'Unknown' : '-'}
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleEdit(user)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(user.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No users found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <UserForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                user={selectedUser}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={actionSuccess}
            />
        </Box>
    );
};

export default UsersPage;
