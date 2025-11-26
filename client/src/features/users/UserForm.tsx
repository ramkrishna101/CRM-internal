import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    Chip,
    OutlinedInput,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, updateUser, type User } from './usersSlice';
import type { AppDispatch, RootState } from '../../store/store';
import api from '../../utils/axios';

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    user?: User | null; // If provided, we are in edit mode
}

const UserForm = ({ open, onClose, user }: UserFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { actionLoading, actionError } = useSelector((state: RootState) => state.users);
    const { items: users } = useSelector((state: RootState) => state.users);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'agent',
        fullName: '',
        managerId: '',
        websiteId: '',
        websiteName: '',
        panels: [] as string[],
    });

    const [websites, setWebsites] = useState<Array<{ id: string; name: string }>>([]);
    const [websiteOptions, setWebsiteOptions] = useState<string[]>([]);
    const [availablePanels, setAvailablePanels] = useState<string[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    // Load websites and panels (using same approach as TransactionsPage)
    useEffect(() => {
        const loadOptions = async () => {
            if (!open) return;
            setLoadingOptions(true);
            try {
                // Load websites with IDs from /websites endpoint (for saving websiteId)
                const websitesResp = await api.get('/websites');
                // Handle both array and single object responses
                let websitesArray: Array<{ id: string; name: string }> = [];
                if (Array.isArray(websitesResp.data)) {
                    websitesArray = websitesResp.data;
                } else if (websitesResp.data) {
                    websitesArray = [websitesResp.data];
                }
                setWebsites(websitesArray);

                // Load panels from /transactions/options (same as TransactionsPage)
                const optionsResp = await api.get('/transactions/options');
                setAvailablePanels(optionsResp.data?.panels || []);
                setWebsiteOptions(optionsResp.data?.websites || []);
            } catch (error: any) {
                console.error('Failed to load options', error);
                console.error('Error details:', error.response?.data);
                // Set empty arrays on error
                setWebsites([]);
                setAvailablePanels([]);
                setWebsiteOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        };
        loadOptions();
    }, [open]);

    // Load panels when website changes (same as TransactionsPage)
    useEffect(() => {
        const loadPanels = async () => {
            try {
                const params: any = {};
                if (formData.websiteName) {
                    params.website = formData.websiteName;
                }
                const resp = await api.get('/transactions/options', { params });
                setAvailablePanels(resp.data?.panels || []);
            } catch (error) {
                console.error('Failed to load panels', error);
            }
        };

        if (formData.websiteName) {
            loadPanels();
        } else {
            api.get('/transactions/options')
                .then(resp => setAvailablePanels(resp.data?.panels || []))
                .catch(error => console.error('Failed to load panels', error));
        }
    }, [formData.websiteName]);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                password: '', // Don't populate password on edit
                role: user.role,
                fullName: user.fullName || '',
                managerId: user.managerId || '',
                websiteId: user.websiteId || '',
                websiteName: user.website?.name || user.websiteName || '',
                panels: user.panels || [],
            });
        } else {
            setFormData({
                email: '',
                password: '',
                role: 'agent',
                fullName: '',
                managerId: '',
                websiteId: '',
                websiteName: '',
                panels: [],
            });
        }
    }, [user, open]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePanelChange = (event: any) => {
        const value = event.target.value;
        setFormData({
            ...formData,
            panels: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            email: formData.email,
            role: formData.role,
            fullName: formData.fullName,
            managerId: formData.managerId || null,
            websiteId: formData.websiteId || null,
            panels: formData.panels.length > 0 ? formData.panels : null,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        if (user) {
            await dispatch(updateUser({ id: user.id, data: payload }));
        } else {
            await dispatch(createUser(payload));
        }
        onClose();
    };

    const managers = users.filter(u => u.role === 'manager');

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label={user ? "Password (leave blank to keep current)" : "Password"}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!user}
                            fullWidth
                        />
                        <TextField
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="agent">Agent</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.role === 'agent' && (
                            <FormControl fullWidth>
                                <InputLabel>Assign Manager</InputLabel>
                                <Select
                                    name="managerId"
                                    value={formData.managerId}
                                    label="Assign Manager"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {managers.map((manager) => (
                                        <MenuItem key={manager.id} value={manager.id}>
                                            {manager.fullName || manager.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <Autocomplete
                            options={websiteOptions}
                            value={formData.websiteName || ''}
                            freeSolo
                            onChange={(_event, newValue) => {
                                const matchedWebsite = websites.find((w) => w.name === newValue);
                                setFormData((prev) => ({
                                    ...prev,
                                    websiteName: newValue || '',
                                    websiteId: matchedWebsite?.id || '',
                                    panels: [],
                                }));
                            }}
                            getOptionLabel={(option) => option || ''}
                            isOptionEqualToValue={(option, value) => option === value}
                            noOptionsText={loadingOptions ? 'Loading websites…' : 'No websites found'}
                            disablePortal
                            loading={loadingOptions}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Website"
                                    placeholder={loadingOptions ? 'Loading…' : 'Select website'}
                                    disabled={loadingOptions}
                                />
                            )}
                        />

                        <FormControl fullWidth key={`panels-control-${availablePanels.length}`}>
                            <InputLabel id="panels-select-label">Panels (Multi-select)</InputLabel>
                            <Select
                                labelId="panels-select-label"
                                multiple
                                name="panels"
                                value={formData.panels}
                                onChange={handlePanelChange}
                                input={<OutlinedInput label="Panels (Multi-select)" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                                disabled={loadingOptions || !formData.websiteName}
                            >
                                {availablePanels.length > 0 ? (
                                    availablePanels.map((panel) => (
                                        <MenuItem key={panel} value={panel}>
                                            {panel}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>
                                        No panels available
                                        {formData.websiteName ? ' for selected website' : ' (select a website first)'}
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserForm;
