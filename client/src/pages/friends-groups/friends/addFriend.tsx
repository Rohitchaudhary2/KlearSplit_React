import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, TextField, Typography, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material"
import { useEffect, useState } from "react"
import Button from '@mui/joy/Button';
import axiosInstance from "../../../utils/axiosInterceptor";
import { API_URLS } from "../../../constants/apiUrls";
import { toast } from "sonner";
import { Friend } from "./index.model";

const AddFriend: React.FC<{
    open: boolean,
    handleAddFriendRequests: (requests: Friend[]) => void
    handleAddFriendClose: () => void
}> = ({ open, handleAddFriendRequests, handleAddFriendClose }) => {
    const [addFriendLoader, setAddFriendLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputTerm, setInputTerm] = useState('');
    const [isAddDisabled, setIsAddDisabled] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const cleanInput = (value: string) => {
        // Trim spaces from start and leave only one space at the end
        value = value.replace(/^\s+/, "").replace(/\s+$/, " ");
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setIsAddDisabled(false);
        } else {
            setIsAddDisabled(true)
        }
        return value;
    };
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (inputTerm.trim().length > 0) {
                setLoading(true);

                const getUsers = async () => {
                    try {
                        const filteredUsers = await axiosInstance.get(`${API_URLS.getUsers}/${inputTerm}`, { withCredentials: true });
                        setUsers(filteredUsers.data.data);
                    } catch (error) {
                        console.error("Error fetching users", error);
                    } finally {
                        setLoading(false);
                    }
                };

                getUsers();
            } else {
                setUsers([]); // Clear options when input is empty
            }
        }, 500);
        return () => clearTimeout(debounceTimeout);
    }, [inputTerm]);
    const selectedUser = (email: string) => {
        setInputTerm(email);
        setIsAddDisabled(false);
    }
    const handleAddFriend = async () => {
        setAddFriendLoader(true);
        try {
            await axiosInstance.post(
                `${API_URLS.addFriend}`,
                { email: inputTerm },
                { withCredentials: true }
            );

            const requests = await axiosInstance.get(`${API_URLS.getFriends}`, {
                params: { status: "PENDING" },
                withCredentials: true
            });

            handleAddFriendRequests(requests.data.data);
            handleAddFriendClose();
            toast.success("Request sent successfully");
        } catch (error) {
            toast.error("Failed to send friend request, please try again later");
        } finally {
            setAddFriendLoader(false);
        }
    }
    return (
        <Modal open={open} onClose={handleAddFriendClose}>

            <ModalDialog layout="center"
                sx={{
                    backgroundColor: "white",
                    position: "fixed",
                    top: "10",
                    // minHeight: "50%",
                    minWidth: "30%",
                    padding: 0,
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                }}
            >
                <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Add Friend</DialogTitle>
                <Box className="p-3 flex flex-col gap-3">
                    <TextField
                        label="Search using email or Name"
                        variant="outlined"
                        name="description"
                        value={inputTerm}
                        onChange={(e) => setInputTerm(cleanInput(e.target.value))}
                        fullWidth
                    // error={!!errors.description}
                    // helperText={errors.description}
                    />
                    {
                        users.length ? <List dense className="max-h-[30vh] overflow-y-auto overflow-x-auto border border-[#ccc]" sx={{ width: '100%', padding: 0, bgcolor: 'background.paper', borderRadius: "4px 4px 4px 4px" }}>
                            {
                                users.map((user) => {
                                    return (
                                        <>
                                            <ListItem disablePadding alignItems="flex-start" key={user.user_id} onClick={() => selectedUser(user.email)}>
                                                <ListItemButton sx={{ paddingX: 1 }}>
                                                    <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                                                        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box className="flex justify-between">
                                                                <Box>{user.first_name} {user.last_name ?? ''}</Box>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                sx={{ color: 'text.primary', display: 'inline' }}
                                                            >
                                                                {user.email}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </>
                                    )
                                })
                            }

                        </List> : null
                    }
                </Box>
                <Box className="flex justify-end items-center gap-3 p-3 items-center">
                    {
                        (!loading && inputTerm.length && !users.length) ?
                            <Typography className="justify-self-start" align="center">No user found!</Typography> :
                            null
                    }
                    <Box className="flex gap-3">
                        <Button onClick={handleAddFriendClose}>
                            Cancel
                        </Button>
                        <Button disabled={isAddDisabled} onClick={handleAddFriend}>
                            Add
                        </Button>
                    </Box>
                </Box>
            </ModalDialog>
        </Modal>
    )
}

export default AddFriend