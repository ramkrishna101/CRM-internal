
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
} from '@mui/material';
import {
    Note as NoteIcon,
    Phone as PhoneIcon,
    MeetingRoom as MeetingIcon,
    Email as EmailIcon,
    QuestionMark as OtherIcon,
} from '@mui/icons-material';
import { fetchInteractions } from './interactionsSlice';
import type { AppDispatch, RootState } from '../../store/store';

interface InteractionListProps {
    customerId: string;
}

const InteractionList = ({ customerId }: InteractionListProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading } = useSelector((state: RootState) => state.interactions);

    useEffect(() => {
        if (customerId) {
            dispatch(fetchInteractions(customerId));
        }
    }, [dispatch, customerId]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'call': return <PhoneIcon />;
            case 'meeting': return <MeetingIcon />;
            case 'email': return <EmailIcon />;
            case 'note': return <NoteIcon />;
            default: return <OtherIcon />;
        }
    };

    if (loading && items.length === 0) {
        return <Typography>Loading interactions...</Typography>;
    }

    if (items.length === 0) {
        return <Typography color="textSecondary">No interactions found.</Typography>;
    }

    return (
        <List>
            {items.map((interaction, index) => (
                <Box key={interaction.id}>
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar>
                                {getIcon(interaction.type)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" component="span">
                                        {interaction.type.toUpperCase()}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(interaction.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {interaction.agent?.fullName || 'Unknown Agent'}
                                    </Typography>
                                    {" — "}{interaction.content}
                                </>
                            }
                        />
                    </ListItem>
                    {index < items.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
            ))}
        </List>
    );
};

export default InteractionList;
