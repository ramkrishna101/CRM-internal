import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Paper,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import { createInteraction } from './interactionsSlice';
import type { AppDispatch, RootState } from '../../store/store';

interface InteractionFormProps {
    customerId: string;
}

const InteractionForm = ({ customerId }: InteractionFormProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { createLoading, error } = useSelector((state: RootState) => state.interactions);
    const { user } = useSelector((state: RootState) => state.auth);

    const [type, setType] = useState('note');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const result = await dispatch(createInteraction({
            customerId,
            type,
            content,
            agentId: user?.id,
        }));

        if (createInteraction.fulfilled.match(result)) {
            setContent('');
            setType('note');
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Log Interaction
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    select
                    label="Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    fullWidth
                    margin="normal"
                    size="small"
                >
                    <MenuItem value="note">Note</MenuItem>
                    <MenuItem value="call">Call</MenuItem>
                    <MenuItem value="meeting">Meeting</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    <MenuItem value="telegram">Telegram</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                    label="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={createLoading}
                    sx={{ mt: 1 }}
                >
                    {createLoading ? <CircularProgress size={24} /> : 'Log Interaction'}
                </Button>
                {error && (
                    <Box mt={2}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default InteractionForm;
