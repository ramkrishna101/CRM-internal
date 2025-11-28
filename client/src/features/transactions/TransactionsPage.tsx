import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  TablePagination,
  TextField,
  Grid,
  MenuItem
} from '@mui/material';
import type { AppDispatch, RootState } from '../../store/store';
import {
  fetchTransactions,
  fetchTransactionOptions,
  setPage,
  setLimit
} from './transactionsSlice';

const TransactionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, total, page, limit, options } = useSelector(
    (state: RootState) => state.transactions
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [website, setWebsite] = useState('');
  const [panel, setPanel] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    dispatch(fetchTransactionOptions(undefined));
  }, [dispatch]);

  useEffect(() => {
    // Refetch panels when website changes
    dispatch(fetchTransactionOptions(website || undefined));
  }, [dispatch, website]);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        page,
        limit,
        startDate,
        endDate,
        website,
        panel,
        type
      })
    );
  }, [dispatch, page, limit, startDate, endDate, website, panel, type]);

  const handleChangePage = (_: unknown, newPage: number) => {
    dispatch(setPage(newPage + 1));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(setLimit(parseInt(event.target.value, 10)));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Website"
              fullWidth
              value={website}
              onChange={e => {
                setWebsite(e.target.value);
                setPanel('');
              }}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {options?.websites.map(option => (
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
              onChange={e => setPanel(e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {options?.panels.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Type"
              fullWidth
              value={type}
              onChange={e => setType(e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="DEPOSIT">Deposit</MenuItem>
              <MenuItem value="WITHDRAW">Withdrawal</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Panel</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Remark</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(transaction => (
                <TableRow
                  key={transaction.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.client}</TableCell>
                  <TableCell>{transaction.panel}</TableCell>
                  <TableCell>{transaction.website}</TableCell>
                  <TableCell>{transaction.remark}</TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={total}
            rowsPerPage={limit}
            page={page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default TransactionsPage;
