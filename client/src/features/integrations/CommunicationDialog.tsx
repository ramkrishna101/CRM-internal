import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, initiateCall } from './integrationsSlice';
import type { AppDispatch, RootState } from '../../store/store';

interface CommunicationDialogProps {
    open: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    customerPhone?: string;
}

const CommunicationDialog = ({ open, onClose, customerId, customerName, customerPhone }: CommunicationDialogProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, successMessage } = useSelector((state: RootState) => state.integrations);
    const { user } = useSelector((state: RootState) => state.auth);

    const [channel, setChannel] = useState<'whatsapp' | 'telegram' | 'sms' | 'call'>('whatsapp');
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (channel === 'call') {
            await dispatch(initiateCall({ customerId, agentId: user?.id || '' }));
        } else {
            await dispatch(sendMessage({
                customerId,
                channel,
                content: message,
                agentId: user?.id,
            }));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Contact {customerName}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <FormControl fullWidth>
                        <InputLabel>Channel</InputLabel>
                        <Select
                            value={channel}
                            label="Channel"
                            onChange={(e) => setChannel(e.target.value as any)}
                        >
                            <MenuItem value="whatsapp">WhatsApp</MenuItem>
                            <MenuItem value="telegram">Telegram</MenuItem>
                            <MenuItem value="sms">SMS</MenuItem>
                            <MenuItem value="call">Voice Call</MenuItem>
                        </Select>
                    </FormControl>

                    {channel !== 'call' && (
                        <TextField
                            label="Message"
                            multiline
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            fullWidth
                            placeholder={`Type your ${channel} message here...`}
                        />
                    )}

                    {channel === 'call' && (
                        <Typography variant="body1">
                            Initiating a call to {customerPhone || 'the customer'}...
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading || (channel !== 'call' && !message)}
                >
                    {loading ? 'Sending...' : (channel === 'call' ? 'Call Now' : 'Send Message')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CommunicationDialog;
