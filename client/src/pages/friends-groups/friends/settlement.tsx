import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, TextField } from "@mui/material"
import { useState } from "react"
import Button from '@mui/joy/Button';
import classes from './index.module.css';

const Settlement: React.FC<{
    open: boolean,
    handleSettlementClose: () => void
}> = ({ open, handleSettlementClose }) => {

    const [settlementAmount, setSettlementAmount] = useState("0");
    const onChange = (value: string) => setSettlementAmount(value);
    return (
        <Modal open={open} onClose={() => handleSettlementClose()}>

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
                <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Settle up</DialogTitle>
                <Box className="w-full self-start rounded p-3 flex flex-col gap-3">
                    <Box className="flex justify-between gap-3 px-6 items-center">
                        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 60, height: 60 }} />
                        <span className={classes.arrow}></span>
                        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 60, height: 60 }} />
                    </Box>
                    <Box className="flex justify-between gap-3 items-center">
                        <Typography className="grow">Rohit Chaudhary</Typography>
                        <Typography>paid</Typography>
                        <Typography className="grow text-end">Rohit Bhambota</Typography>
                    </Box>
                    <TextField
                        label="Total Amount"
                        required
                        variant="outlined"
                        name="settlement_amount"
                        value={settlementAmount}
                        onChange={(e) => onChange(e.target.value.trim())}
                        fullWidth
                    // error={!!errors.total_amount}
                    // helperText={errors.total_amount}
                    />
                    <Box className="flex flex-col gap-3">
                        <Button variant="outlined">Record as cash Payment</Button>
                        <Button variant="outlined">Pay using Paypal</Button>
                    </Box>
                    <Box className="flex justify-end items-center p-3">
                        <Button onClick={handleSettlementClose}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </ModalDialog>
        </Modal>
    )
}

export default Settlement