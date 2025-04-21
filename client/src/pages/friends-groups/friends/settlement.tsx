import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, TextField } from "@mui/material"
import { useState } from "react"
import Button from '@mui/joy/Button';
import classes from './index.module.css';
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { Friend } from "./index.model";
import axiosInstance from "../../../utils/axiosInterceptor";
import { API_URLS } from "../../../constants/apiUrls";
import { toast } from "sonner";

const Settlement: React.FC<{
    open: boolean,
    handleSettlementClose: () => void,
    handleSettlement: (settlementAmount: number) => void,
    selectedFriend: Friend
}> = ({ open, handleSettlementClose, handleSettlement, selectedFriend }) => {
    const user = useSelector((store: RootState) => store.auth.user)
    const totalAmount = Math.abs(
        parseFloat(selectedFriend.balance_amount),
    );
    const [settlementAmount, setSettlementAmount] = useState(totalAmount);
    const isUserPayer = parseFloat(selectedFriend.balance_amount) < 0;
    const getFullNameAndImage = (user: User | Friend["friend"]) => {
        return {
            fullName: `${user?.first_name} ${user?.last_name ?? ""}`.trim(),
            imageUrl: user?.image_url,
        };
    }
    let payerName, payerImage, debtorName, debtorImage, payerId, debtorId;

    switch (isUserPayer) {
        case true: {
            const { fullName: payer, imageUrl: payerImg } = getFullNameAndImage(user!);
            const { fullName: debtor, imageUrl: debtorImg } = getFullNameAndImage(selectedFriend.friend);
            payerName = payer;
            debtorName = debtor;
            payerImage = payerImg;
            debtorImage = debtorImg;
            payerId = user!.user_id;
            debtorId = selectedFriend.friend.user_id;
            break;
        }
        case false: {
            const { fullName: payer, imageUrl: payerImg } = getFullNameAndImage(selectedFriend.friend);
            const { fullName: debtor, imageUrl: debtorImg } = getFullNameAndImage(user!);
            payerName = payer;
            debtorName = debtor;
            payerImage = payerImg;
            debtorImage = debtorImg;
            debtorId = user!.user_id;
            payerId = selectedFriend.friend.user_id;
        }
    }
    const onChange = (value: string) => {
        if (isNaN(parseFloat(value))) value = "0"
        setSettlementAmount(parseFloat(value) ?? 0)
    };
    const handleSubmit = () => {
        handleSettlement(settlementAmount);
        handleSettlementClose()
    }
    const payWithPayPal = async () => {
        try {
            const res = await axiosInstance.post(`${API_URLS.createPayment}`, {
                amount: settlementAmount,
                id: selectedFriend.conversation_id,
                payerId,
                debtorId,
                type: "friends"
            });

            window.location.href = res.data.data;
        } catch (error) {
            toast.error("Failed to initiate payment, please try again later");
        }
    }
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
                    <Box className="flex justify-between gap-3 px-2 items-center">
                        <Box className="flex flex-col justify-center items-center gap-2 w-[10vw]">
                            <Avatar alt="avatar" src={payerImage ?? "assets/image.png"} sx={{ width: 60, height: 60 }} />
                            <Typography>{payerName}</Typography>
                        </Box>
                        <span className={classes.arrow}></span>
                        <Box className="flex flex-col justify-center items-center gap-2 w-[10vw]">
                            <Avatar alt="avatar" src={debtorImage ?? "assets/image.png"} sx={{ width: 60, height: 60 }} />
                            <Typography>{debtorName}</Typography>
                        </Box>
                    </Box>

                    <TextField
                        label="Total Amount"
                        required
                        variant="outlined"
                        name="settlement_amount"
                        value={settlementAmount}
                        onChange={(e) => onChange(e.target.value.trim() ?? "0")}
                        fullWidth
                    // error={!!errors.total_amount}
                    // helperText={errors.total_amount}
                    />
                    <Box className="flex flex-col gap-3">
                        <Button variant="outlined" onClick={handleSubmit}>Record as cash Payment</Button>
                        <Button variant="outlined" onClick={payWithPayPal} disabled={payerId !== user?.user_id}>Pay using Paypal</Button>
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