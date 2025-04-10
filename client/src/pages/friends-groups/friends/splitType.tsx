import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, Divider, ListItem, ListItemAvatar, ListItemButton, ListItemText, ButtonGroup, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import Button from '@mui/joy/Button';
import { motion } from "framer-motion"
import { ExpenseInfo } from "./index.model"

const SplitType: React.FC<{
    open: boolean,
    friend: User,
    user: User,
    expenseInfo: ExpenseInfo,
    handleShareChange: (key: string, value: string) => void
    handleSplitTypeClose: () => void
}> = ({ open, handleSplitTypeClose, friend, user, expenseInfo, handleShareChange }) => {
    const [splitType, setSplitType] = useState(expenseInfo.split_type);
    const handleViewChange = (view: string) => {
        let error = "";
        switch(view) {
            case "UNEQUAL": {
                const isInvalid = parseFloat(expenseInfo.total_amount) !== unequalShares[0] + unequalShares[1];
                if(isInvalid) error = "Amount must be equal to total amount."
                break;
            }
            case "PERCENTAGE": {
                const isInvalid = percentageShares[0] + percentageShares[1] !== 100;
                if(isInvalid) error = "Total percentage must be equal to 100"
            }
        }
        setError(error);
        if(error) setIsFormInvalid(true);
        setSplitType(view);
    };
    const [equalShare, setEqualShare] = useState(0);
    const [isFormInvalid, setIsFormInvalid] = useState(true);
    const [unequalShares, setUnequalShares] = useState<number[]>([]);
    const [percentageShares, setPercentageShares] = useState<number[]>([]);
    const [error, setError] = useState("");
    const onChange = (key: string, value: number) => {
        switch(splitType) {
            case "UNEQUAL": {
                switch(key) {
                    case "participant1_share": {
                        setUnequalShares((prev) => [value, prev[1]]);
                        const isInvalid = parseFloat(expenseInfo.total_amount) !== value + unequalShares[1];
                        setIsFormInvalid(isInvalid);
                        if(isInvalid) setError("Amount must be equal to total amount.");
                        else setError("")
                        break;
                    }
                    case "participant2_share": {
                        setUnequalShares((prev) => [prev[0], value]);
                        const isInvalid = parseFloat(expenseInfo.total_amount) !== value + unequalShares[0];
                        setIsFormInvalid(isInvalid);
                        if(isInvalid) setError("Amount must be equal to total amount.");
                        else setError("")
                    }
                }
                break;
            }
            case "PERCENTAGE": {
                switch(key) {
                    case "participant1_share": {
                        setPercentageShares((prev) => [value, prev[1]])
                        const isInvalid = (value + percentageShares[1] !== 100)
                        setIsFormInvalid(isInvalid);
                        if(isInvalid) setError("Total percentage must be equal to 100")
                        else setError("")
                        break;
                    }
                    case "participant2_share": {
                        setPercentageShares((prev) => [prev[0], value])
                        const isInvalid = (value + percentageShares[0] !== 100);
                        setIsFormInvalid(isInvalid);
                        if(isInvalid) setError("Total percentage must be equal to 100")
                        else setError("")
                    }
                }
            }
        }
    };
    useEffect(() => {
        const share = parseFloat(expenseInfo.total_amount) / 2;
        setEqualShare(share);
        const unequal = expenseInfo.split_type !== "UNEQUAL" ?
            [share, share] : [parseFloat(expenseInfo.participant1_share) ?? share, parseFloat(expenseInfo.participant2_share) ?? share];
        setUnequalShares(unequal);
        const percentage = expenseInfo.split_type === "PERCENTAGE" ?
            [parseFloat(expenseInfo.participant1_share) ?? 50, parseFloat(expenseInfo.participant2_share) ?? 50] : [50, 50];
        setPercentageShares(percentage);
    }, [open])
    const handleSubmit = () => {
        handleShareChange("split_type", splitType);
        switch(splitType) {
            case "EQUAL": {
                handleShareChange("participant1_share", String(equalShare));
                handleShareChange("participant2_share", String(equalShare));
                break;
            }
            case "UNEQUAL": {
                handleShareChange("participant1_share", String(unequalShares[0]));
                handleShareChange("participant2_share", String(unequalShares[1]));
                break;
            }
            case "PERCENTAGE": {
                handleShareChange("participant1_share", String(percentageShares[0]));
                handleShareChange("participant2_share", String(percentageShares[1]));
            }
        }
        handleSplitTypeClose()
    }
    const participantShare = (index: number) => {
        switch(splitType) {
            case "EQUAL": {
                return equalShare;
            }
            case "UNEQUAL": {
                return unequalShares[index];
            }
            case "PERCENTAGE": {
                return percentageShares[index];
            }
        }
        return 0;
    }
    
    return (
        <Modal hideBackdrop={true} open={open} onClose={() => handleSplitTypeClose()}>
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
                    <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Choose Split Option</DialogTitle>
                    <Box className="w-full self-start rounded p-3">
                        <ButtonGroup variant="outlined" className="grid" aria-label="Basic button group">
                            <Button onClick={() => handleViewChange("EQUAL")} variant={splitType === "EQUAL" ? "solid" : "outlined"}
                                sx={{ borderRadius: "4px 0px 0px 0px" }}
                            >Equal</Button>
                            < Button onClick={() => handleViewChange("UNEQUAL")} variant={splitType === "UNEQUAL" ? "solid" : "outlined"}
                                sx={{ borderRadius: "0px 0px 0px 0px" }}
                            >
                                Unequal
                            </Button>
                            < Button onClick={() => handleViewChange("PERCENTAGE")} variant={splitType === "PERCENTAGE" ? "solid" : "outlined"}
                                sx={{ borderRadius: "0px 4px 0px 0px" }}
                            >
                                Percentage
                            </Button>
                        </ButtonGroup>
                        <Divider />
                    </Box>
                    <Box className="rounded bg-[white] flex flex-col">
                        {
                            [user, friend].map((participant, index) => {
                                return (
                                    <>
                                        <ListItem disablePadding alignItems="flex-start" key={participant.user_id}>
                                            <ListItemButton sx={{ paddingX: 1 }}>
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
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={participantShare(index)}
                                                    disabled={splitType === "EQUAL"}
                                                    onChange={(e) => {
                                                        participant.user_id === user.user_id ?
                                                            onChange("participant1_share", parseFloat(e.target.value) ?? 0) :
                                                            onChange("participant2_share", parseFloat(e.target.value) ?? 0)
                                                    }
                                                    }
                                                    className={
                                                        splitType === "EQUAL" ? "cursor-not-allowed" : ""
                                                    }
                                                    sx={{ maxWidth: 80 }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                    </>
                                )
                            })
                        }
                        {
                            error && 
                            <Typography className="p-2 pb-0 text-red-500" variant="caption">*{error}</Typography>
                        }
                        <Box className="flex justify-end items-center gap-3 p-3">
                            <Button onClick={handleSplitTypeClose}>
                                Cancel
                            </Button>
                            <Button disabled={isFormInvalid} onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </ModalDialog>
            </motion.div>
        </Modal>
    )
}

export default SplitType