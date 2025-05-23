import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import Button from '@mui/joy/Button';
import classes from './index.module.css';
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { GroupMemberData } from "./index.model";
import { toast } from "sonner";
import { onCreatePayment } from "./services";

const Settlement: React.FC<{
    open: boolean,
    handleSettlementClose: () => void,
    handleSettlement: (settlementAmount: number) => void,
    settlement_amount: number,
    payer: GroupMemberData,
    debtor: GroupMemberData
}> = ({ open, handleSettlementClose, handleSettlement, settlement_amount, payer, debtor }) => {
    const user = useSelector((store: RootState) => store.auth.user)
    const [settlementAmount, setSettlementAmount] = useState(settlement_amount);
    useEffect(() => {
        setSettlementAmount(settlement_amount);
    }, [settlement_amount])
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState("");
    const onChange = (value: string) => {
        if (isNaN(parseFloat(value))) value = "0"
        setSettlementAmount(parseFloat(value) ?? 0)
        if (parseFloat(value) < 0.1 || parseFloat(value) > settlement_amount) {
            setError(`Amount must be between 0.1 and ${settlement_amount}.`)
        } else setError("")
    }
    const handleSubmit = () => {
        handleSettlement(settlementAmount);
        handleSettlementClose()
    }
    const payWithPayPal = async () => {
        setLoader(true);
        const res = await onCreatePayment({
            amount: settlementAmount,
            id: payer.group_id,
            payerId: payer.group_membership_id,
            debtorId: debtor.group_membership_id,
            type: "groups"
        })

        if (!res) {
            setLoader(false);
            return;
        }

        window.location.href = res.data.data;
    }
    return (
        <Modal open={open} onClose={() => handleSettlementClose()}>

            <ModalDialog layout="center"
                sx={{
                    backgroundColor: "white",
                    position: "fixed",
                    top: "10",
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
                    <Box className="flex justify-between gap-3 px-2 items-center">
                        <Box className="flex flex-col justify-center items-center gap-2 w-[10vw]">
                            <Avatar alt="avatar" src={payer.image_url ?? "assets/image.png"} sx={{ width: 60, height: 60 }} />
                            <Typography>{payer.first_name} {payer.last_name ?? ''}</Typography>
                        </Box>
                        <span className={classes.arrow}></span>
                        <Box className="flex flex-col justify-center items-center gap-2 w-[10vw]">
                            <Avatar alt="avatar" src={debtor.image_url ?? "assets/image.png"} sx={{ width: 60, height: 60 }} />
                            <Typography>{debtor.first_name} {debtor.last_name ?? ''}</Typography>
                        </Box>
                    </Box>
                    <TextField
                        label="Total Amount"
                        required
                        variant="outlined"
                        name="settlement_amount"
                        value={settlementAmount}
                        onChange={(e) => onChange(e.target.value.trim())}
                        fullWidth
                        error={!!error}
                        helperText={error}
                    />
                    <Box className="flex flex-col gap-3">
                        <Button variant="outlined" disabled={!!error || loader} onClick={handleSubmit}>Record as cash Payment</Button>
                        <Button variant="outlined" onClick={payWithPayPal} disabled={payer.member_id !== user?.user_id || !!error || loader}>Pay using Paypal</Button>
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