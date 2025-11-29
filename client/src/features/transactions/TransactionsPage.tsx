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
  const [userId, setUserId] = useState('');
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState('');
  const [lastCallStartDate, setLastCallStartDate] = useState('');
  const [lastCallEndDate, setLastCallEndDate] = useState('');
  const [lastCallOutcome, setLastCallOutcome] = useState('');
  const [lastTransactionStartDate, setLastTransactionStartDate] = useState('');
  const [lastTransactionEndDate, setLastTransactionEndDate] = useState('');
  const [firstTransactionStartDate, setFirstTransactionStartDate] =
    useState('');
  const [firstTransactionEndDate, setFirstTransactionEndDate] = useState('');
  const [totalDepositAmountStart, setTotalDepositAmountStart] = useState('');
  const [totalDepositAmountEnd, setTotalDepositAmountEnd] = useState('');
  const [gameInterest, setGameInterest] = useState('');

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
        type,
        userId,
        branch,
        status,
        lastCallStartDate,
        lastCallEndDate,
        lastCallOutcome,
        lastTransactionStartDate,
        lastTransactionEndDate,
        firstTransactionStartDate,
        firstTransactionEndDate,
        totalDepositAmountStart: totalDepositAmountStart
          ? parseFloat(totalDepositAmountStart)
          : undefined,
        totalDepositAmountEnd: totalDepositAmountEnd
          ? parseFloat(totalDepositAmountEnd)
          : undefined,
        gameInterest
      })
    );
  }, [
    dispatch,
    page,
    limit,
    startDate,
    endDate,
    website,
    panel,
    type,
    userId,
    branch,
    status,
    lastCallStartDate,
    lastCallEndDate,
    lastCallOutcome,
    lastTransactionStartDate,
    lastTransactionEndDate,
    firstTransactionStartDate,
    firstTransactionEndDate,
    totalDepositAmountStart,
    totalDepositAmountEnd,
    gameInterest
  ]);

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

      <Paper sx={{ p: 2, mb: 2, maxHeight: 400, overflowY: 'auto' }}>
        <Grid container spacing={2}>
          {/* Transaction Date Range */}
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

          {/* Website */}
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

          {/* Panel */}
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

          {/* Type */}
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

          {/* User ID */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="User ID"
              fullWidth
              value={userId}
              onChange={e => setUserId(e.target.value)}
              size="small"
              placeholder="Search by user ID"
            />
          </Grid>

          {/* Branch */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Branch"
              fullWidth
              value={branch}
              onChange={e => setBranch(e.target.value)}
              size="small"
              placeholder="Enter branch"
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Status"
              fullWidth
              value={status}
              onChange={e => setStatus(e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="sleeping">Sleeping</MenuItem>
            </TextField>
          </Grid>

          {/* Last Call Date Range */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Last Call Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={lastCallStartDate}
              onChange={e => setLastCallStartDate(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Last Call End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={lastCallEndDate}
              onChange={e => setLastCallEndDate(e.target.value)}
              size="small"
            />
          </Grid>

          {/* Last Call Outcome */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Last Call Outcome"
              fullWidth
              value={lastCallOutcome}
              onChange={e => setLastCallOutcome(e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ringing">Ringing</MenuItem>
              <MenuItem value="didn't pick">Didn't Pick</MenuItem>
              <MenuItem value="interested">Interested</MenuItem>
              <MenuItem value="not interested">Not Interested</MenuItem>
              <MenuItem value="callback">Callback</MenuItem>
              <MenuItem value="wrong number">Wrong Number</MenuItem>
              <MenuItem value="busy">Busy</MenuItem>
            </TextField>
          </Grid>

          {/* Last Transaction Date Range */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Last Transaction Start"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={lastTransactionStartDate}
              onChange={e => setLastTransactionStartDate(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Last Transaction End"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={lastTransactionEndDate}
              onChange={e => setLastTransactionEndDate(e.target.value)}
              size="small"
            />
          </Grid>

          {/* First Transaction Date Range */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="First Transaction Start"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={firstTransactionStartDate}
              onChange={e => setFirstTransactionStartDate(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="First Transaction End"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={firstTransactionEndDate}
              onChange={e => setFirstTransactionEndDate(e.target.value)}
              size="small"
            />
          </Grid>

          {/* Total Deposit Amount Range */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Min Deposit Amount"
              type="number"
              fullWidth
              value={totalDepositAmountStart}
              onChange={e => setTotalDepositAmountStart(e.target.value)}
              size="small"
              placeholder="Min amount"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Max Deposit Amount"
              type="number"
              fullWidth
              value={totalDepositAmountEnd}
              onChange={e => setTotalDepositAmountEnd(e.target.value)}
              size="small"
              placeholder="Max amount"
            />
          </Grid>

          {/* Game Interest */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Game Interest"
              fullWidth
              value={gameInterest}
              onChange={e => setGameInterest(e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SPORTS">Sports</MenuItem>
              <MenuItem value="LIVE">Live</MenuItem>
              <MenuItem value="BOTH">Both</MenuItem>
              <MenuItem value="CASINO">Casino</MenuItem>
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
