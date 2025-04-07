import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, Divider, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import { useState } from "react"
import Button from '@mui/joy/Button';
import { motion } from "framer-motion"

const Payer: React.FC<{
    open: boolean,
    handleAddExpensesClose: () => void
}> = ({ open, handleAddExpensesClose }) => {
    const user = useSelector((store: RootState) => store.auth.user)
    const [expenseInfo, setExpenseInfo] = useState({
        expense_name: "",
        total_amount: "",
        description: "",
        payer_id: user?.user_id,
        participant1_share: 0,
        participant2_share: 0,
        split_type: "EQUAL",
        receipt: null
    });
    const [errors, setErrors] = useState({
        expense_name: "",
        total_amount: "",
        description: ""
    })
    const onChange = (key: string, value: string | number) => setExpenseInfo((prev) => ({ ...prev, [key]: value }))
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
                            [0, 1].map((index) => {
                                return (
                                    <>
                                        <ListItem disablePadding alignItems="flex-start" key={index}>
                                            <ListItemButton sx={{ paddingX: 1 }}>
                                                <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box className="flex justify-between">
                                                            <Box>Rohit Chaudhary</Box>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{ color: 'text.primary', display: 'inline' }}
                                                        >
                                                            sdesdewdwsit@gmail.com
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