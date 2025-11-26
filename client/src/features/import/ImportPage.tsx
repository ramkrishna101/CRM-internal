import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import axios from '../../utils/axios';

const ImportPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { user } = useSelector((state: RootState) => state.auth);
    const websiteId = user?.websiteId || '';

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setError(null);
            setSuccessMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('websiteId', websiteId);

        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post('/import/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccessMessage(response.data.message);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload file.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box maxWidth="md" mx="auto">
            <Typography variant="h4" gutterBottom>
                Data Import
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
                Upload a CSV file to import customers. The CSV should have the following headers:
                <br />
                <code>external_id, username, email, phone, last_deposit_amount, last_deposit_date</code>
            </Typography>

            <Paper sx={{ p: 4, mt: 3, textAlign: 'center' }}>
                <input
                    accept=".csv"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                    >
                        Select CSV File
                    </Button>
                </label>

                {file && (
                    <Box mt={2} mb={2}>
                        <Typography variant="subtitle1">Selected File:</Typography>
                        <Typography variant="body2">{file.name}</Typography>
                    </Box>
                )}

                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? <CircularProgress size={24} /> : 'Upload & Import'}
                    </Button>
                </Box>
            </Paper>

            {successMessage && (
                <Alert severity="success" sx={{ mt: 3 }}>
                    {successMessage}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default ImportPage;
