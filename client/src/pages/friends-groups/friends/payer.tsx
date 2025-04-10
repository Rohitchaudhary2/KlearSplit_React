import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, Divider, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material"
import Button from '@mui/joy/Button';
import { motion } from "framer-motion"

const Payer: React.FC<{
    open: boolean,
    friend: User,
    user: User,
    selectedId: string,
    payerChange: (selectedId: string) => void
    handleAddExpensesClose: () => void
}> = ({ open, friend, user, handleAddExpensesClose, selectedId, payerChange }) => {
    return (
        <Modal hideBackdrop={true} open={open} onClose={() => handleAddExpensesClose()}>
            <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 200, opacity: 1 }}
                exit={{ x: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                    height: "100%",
                    zIndex: 9
                }}
            >
                <ModalDialog layout="center"
                    sx={{
                        backgroundColor: "white",
                        position: "fixed",
                        top: "10",
                        // minHeight: "50%",
                        minWidth: "25%",
                        padding: 0,
                        border: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        zIndex: 9
                    }}
                >
                    {/* <ModalClose onClick={() => handleViewExpensesClose()} /> */}
                    <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Choose Payer</DialogTitle>
                    <Box className="rounded bg-[white] flex flex-col">
                        {
                            [user, friend].map((participant) => {
                                return (
                                    <>
                                        <ListItem disablePadding alignItems="flex-start" key={participant.user_id}>
                                            <ListItemButton sx={{ paddingX: 1 }} selected={selectedId === participant.user_id} onClick={() => payerChange(participant.user_id)}>
                                                <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box className="flex justify-between">
                                                            <Box>{participant.first_name} {participant.last_name}</Box>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{ color: 'text.primary', display: 'inline' }}
                                                        >
                                                            {participant.email}
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
                        <Box className="flex justify-end items-center p-3">
                            <Button onClick={handleAddExpensesClose}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </ModalDialog>
            </motion.div>
        </Modal>
    )
}

export default Payer