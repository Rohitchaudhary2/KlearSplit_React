import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Typography, Avatar, Divider, ListItem, ListItemAvatar, ListItemButton, ListItemText, ButtonGroup, TextField } from "@mui/material"
import { useEffect, useState } from "react"
import Button from '@mui/joy/Button';
import { motion } from "framer-motion"
import { GroupMemberData } from "./index.model";

interface Debtor {
    debtor_id: string;
    debtor_share: number;
}

const SplitType: React.FC<{
    totalAmount: number,
    participants: GroupMemberData[],
    splitState: any
    open: boolean,
    handleSplitTypeSubmit: (splitType:string, debtors: Debtor[], selectedParticipants: GroupMemberData[]) => void,
    handleShareChange: (key: string, value: string) => void
    handleSplitTypeClose: () => void
}> = ({ open, handleSplitTypeClose, totalAmount, participants, splitState, handleSplitTypeSubmit, handleShareChange }) => {
    const [splitType, setSplitType] = useState("EQUAL");
    const [selectedParticipants, setSelectedParticipants] = useState<GroupMemberData[]>([]);
    const [calculatedShares, setCalculatedShares] = useState<Record<string, number>>({});
    const [remainingTotal, setRemainingTotal] = useState<number>(0);
    const [unequalShares, setUnequalShares] = useState<Record<string, number>>({});
    const [percentageShares, setPercentageShares] = useState<Record<string, number>>({});
    const [error, setError] = useState("");
    const setStoredShare = () => {
        if (splitType === "UNEQUAL") {
            setUnequalShares({ ...calculatedShares });
        } else if (splitType === "PERCENTAGE") {
            setPercentageShares({ ...calculatedShares });
        }
    }
    const updateRemainingTotal = () => {
        const total = Object.values(calculatedShares).reduce(
            (acc, val) => acc + (val || 0),
            0
        );
        setRemainingTotal(splitType === "UNEQUAL"
            ? totalAmount - total
            : 100 - total);
    }
    const initializeShares = () => {
        participants.forEach((participant) => {
            calculatedShares[participant.group_membership_id] = 0;
            unequalShares[participant.group_membership_id] = 0; // Initialize for UNEQUAL
            percentageShares[participant.group_membership_id] = 0; // Initialize for PERCENTAGE
        });
        updateRemainingTotal();
    }
    useEffect(() => {
        if (splitState) {
            setSplitType(splitState.split_type);
            setSelectedParticipants(splitState.selectedParticipants);
            const newShares: Record<string, number> = {};
            splitState.debtors.forEach((debtor: { debtor_id: string, debtor_share: number }) => {
                newShares[debtor.debtor_id] = debtor.debtor_share;
            }); // Set the calculated shares
            newShares[splitState.payerId] = splitState.payerShare;
            // setStoredShare();
            setCalculatedShares(newShares);
            if (splitState.split_type === "UNEQUAL") {
                setUnequalShares({ ...newShares });
            } else if (splitState.split_type === "PERCENTAGE") {
                setPercentageShares({ ...newShares });
            }
            const total = Object.values(newShares).reduce(
                (acc, val) => acc + (val || 0),
                0
            );
            setRemainingTotal(splitState.split_type === "UNEQUAL"
                ? totalAmount - total
                : 100 - total);
            // updateRemainingTotal();
        } else {
            // Default behavior if no previous state is provided
            initializeShares();
            setActive("EQUAL")
        }
    }, [splitState, totalAmount])

    const toggleParticipant = (participant: GroupMemberData) => {
        if (selectedParticipants.includes(participant)) {
            setSelectedParticipants(selectedParticipants.filter(
                (p) => p.group_membership_id !== participant.group_membership_id
            ));
        } else {
            setSelectedParticipants((prev) => [...prev, participant]);
        }
    }

    const isValidSplit = (): boolean => {
        const total = Object.values(calculatedShares).reduce(
            (acc, val) => acc + (val || 0),
            0
        );

        switch (splitType) {
            case "UNEQUAL":
                return total === totalAmount;
            case "PERCENTAGE":
                return total === 100;
            default:
                // For 'EQUAL' or other cases
                return true;
        }
    }

    const setActive = (item: "EQUAL" | "UNEQUAL" | "PERCENTAGE") => {
        const wasActiveItem = splitType;
        setSplitType(item);

        const newShares = {...calculatedShares}
        switch (item) {
            case "EQUAL": {
                const equalShare = totalAmount / (selectedParticipants.length || 1);
                selectedParticipants.forEach(
                    (participant) => (newShares[participant.group_membership_id] = equalShare)
                );
                break;
            }
            case "UNEQUAL":
                if (wasActiveItem === "EQUAL" || Object.values(unequalShares).some((value) => value !== 0)) {
                    // If switching to UNEQUAL, retain previous values
                    selectedParticipants.forEach((participant) => {
                        newShares[participant.group_membership_id] = unequalShares[participant.group_membership_id] || 0;
                    });
                } else {
                    // Reset shares for first-time visit to UNEQUAL
                    participants.forEach((participant) => {
                        newShares[participant.group_membership_id] = 0;
                    });
                }
                break;

            case "PERCENTAGE":
                if (wasActiveItem === "EQUAL" || Object.values(percentageShares).some((value) => value !== 0)) {
                    // If switching to PERCENTAGE, retain previous values
                    selectedParticipants.forEach((participant) => {
                        newShares[participant.group_membership_id] = percentageShares[participant.group_membership_id] || 0;
                    });
                } else {
                    // Reset shares for first-time visit to PERCENTAGE
                    participants.forEach((participant) => {
                        newShares[participant.group_membership_id] = 0;
                    });
                }
                break;
        }
        setCalculatedShares(newShares);

        const total = Object.values(newShares).reduce(
            (acc, val) => acc + (val || 0),
            0
        );
        setRemainingTotal(item === "UNEQUAL"
            ? totalAmount - total
            : 100 - total);
    }

    const checkForNegativeValues = () => {
        const hasNegativeValues = Object.values(calculatedShares).some((share) => share < 0);
        if (hasNegativeValues) {
            setError("Amounts cannot be negative");
        } else {
            setError("");
        }
    }

    const updateTotal = () => {
        updateRemainingTotal();
        checkForNegativeValues();
    }

    const onChange = (value: number, groupMembershipId: string) => {
        // Ensure the value is non-negative
        if (value < 0) {
            value = 0; // Prevent negative numbers by resetting to 0
        }

        calculatedShares[groupMembershipId] = value;
        // Based on the active type, store the calculated shares in the appropriate type for submission
        setStoredShare();
        updateTotal();
    }

    const handleSubmit = () => {
        const debtors = selectedParticipants.map((participant) => ({
            debtor_id: participant.group_membership_id,
            debtor_share: splitType === "EQUAL" ? totalAmount/selectedParticipants.length : (calculatedShares[participant.group_membership_id] || 0),
        })).filter((debtor) => debtor.debtor_share !== 0);
        handleSplitTypeSubmit(splitType, debtors, selectedParticipants);
        handleSplitTypeClose()
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
                            <Button onClick={() => setActive("EQUAL")} variant={splitType === "EQUAL" ? "solid" : "outlined"}
                                sx={{ borderRadius: "4px 0px 0px 0px" }}
                            >Equal</Button>
                            < Button onClick={() => setActive("UNEQUAL")} variant={splitType === "UNEQUAL" ? "solid" : "outlined"}
                                sx={{ borderRadius: "0px 0px 0px 0px" }}
                            >
                                Unequal
                            </Button>
                            < Button onClick={() => setActive("PERCENTAGE")} variant={splitType === "PERCENTAGE" ? "solid" : "outlined"}
                                sx={{ borderRadius: "0px 4px 0px 0px" }}
                            >
                                Percentage
                            </Button>
                        </ButtonGroup>
                        <Divider />
                    </Box>
                    <Box className="rounded bg-[white] flex flex-col">
                        {
                            participants.map((participant) => {
                                return (
                                    <>
                                        <ListItem disablePadding alignItems="flex-start" key={participant.group_membership_id}>
                                            <ListItemButton sx={{ paddingX: 1 }}>
                                                <ListItemAvatar sx={{ minWidth: 32, paddingRight: 1 }}>
                                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box className="flex justify-between">
                                                            <Box>{participant.first_name} {participant.last_name ?? ''}</Box>
                                                        </Box>
                                                    }
                                                />
                                                {
                                                    splitType === "EQUAL" ?
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input ms-3"
                                                            checked={selectedParticipants.includes(participant)}
                                                            onChange={() => toggleParticipant(participant)}
                                                        /> :
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={calculatedShares[participant.group_membership_id]}
                                                            disabled={splitType === "EQUAL"}
                                                            onChange={(e) => onChange(parseFloat(e.target.value), participant.group_membership_id)}
                                                            className={
                                                                splitType === "EQUAL" ? "cursor-not-allowed" : ""
                                                            }
                                                            sx={{ maxWidth: 80 }}
                                                        />
                                                }
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                    </>
                                )
                            })
                        }
                        {
                            splitType !== "EQUAL" &&
                            <div className="text-center mt-3">
                            <span>Remaining:</span>
                            <span className={remainingTotal! < 0 ? "text-red-500" : "text-green-500"}>
                                {remainingTotal}
                            </span>
                            <span> of </span>
                            <span className="text-success">
                                {splitType === "UNEQUAL" ? totalAmount : "100%"}
                            </span>

                            {/* Validation Message */}
                            {!isValidSplit() && (
                                <div className="text-danger mt-2">
                                    Total does not match the expected {splitType === "UNEQUAL" ? "amount" : "percentage"}.
                                </div>
                            )}

                            {error.length > 0 && (
                                <div className="text-danger mt-2">
                                    {error}
                                </div>
                            )}
                        </div>
                        }

                        {
                            error &&
                            <Typography className="p-2 pb-0 text-red-500" variant="caption">*{error}</Typography>
                        }
                        <Box className="flex justify-end items-center gap-3 p-3">
                            <Button onClick={handleSplitTypeClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </ModalDialog>
            </motion.div>
        </Modal>
    )
}

export default SplitType;