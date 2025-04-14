import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, TextField, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import { useEffect, useState } from "react"
import SvgIcon from '@mui/joy/SvgIcon';
import { styled } from '@mui/joy';
import Button from '@mui/joy/Button';
import Payer from "./payer"
import { motion } from "framer-motion"
import SplitType from "./splitType"
import CustomDialog from "../../../components/base/customModal"
import { GroupData, GroupMemberData } from "./index.model"

interface Debtor {
    debtor_id: string;
    debtor_share: number;
}
const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const AddExpense: React.FC<{
    open: boolean,
    participants: GroupMemberData[],
    currentMember: GroupMemberData
    group: GroupData
    handleAddExpensesClose: () => void,
    handleAddExpense: (expenseInfo: FormData) => void
}> = ({ open, participants, currentMember, handleAddExpensesClose, handleAddExpense }) => {
    const user = useSelector((store: RootState) => store.auth.user);
    const [selectedParticipants, setSelectedParticipants] = useState<GroupMemberData[]>([...participants]);
    const [payerShare, setPayerShare] = useState<number>();
    const [debtors, setDebtors] = useState<Debtor[]>([]);
    const [expenseInfo, setExpenseInfo] = useState({
        expense_name: "",
        total_amount: "",
        description: "",
        payer_id: currentMember.group_membership_id,
        split_type: "EQUAL",
    });
    const [splitState, setSplitShare] = useState({
        split_type: expenseInfo.split_type,
        selectedParticipants, // Already populated from the previous split dialog
        debtors, // Shares for the participants
        payerId: expenseInfo.payer_id,
        payerShare,
    });
    const [errors, setErrors] = useState({
        expense_name: "",
        total_amount: "",
        description: ""
    })
    const [dialogOpen, setDialogOpen] = useState(false);
    const [PayerDialogOpen, setPayerDialogOpen] = useState(false);
    const [splitTypeOpen, setSplitTypeOpen] = useState(false);
    const handlePayerDialogOpen = () => {
        setPayerDialogOpen(true);
    }
    const handleSplitTypeOpen = () => {
        setSplitTypeOpen(true);
    }
    const handlePayerDialogClose = () => setPayerDialogOpen(false);
    const handleSplitTypeClose = () => setSplitTypeOpen(false);
    const onChange = (key: string, value: string) => {
        setExpenseInfo((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
    }
    const addExpenseDialogClose = () => {
        setDialogOpen(true);
    }
    const handleConfirmDialogClose = (value: boolean) => {
        setDialogOpen(false);
        if (value) handleAddExpensesClose();
    }
    const validateField = (name: string, value: string) => {
        let errorMsg = "";

        switch (name) {
            case "expense_name":
                if (!value) errorMsg = "Expense name is required";
                else if (value.length > 50) errorMsg = "Must not be greater than 50 characters";
                break;

            case "total_amount":
                const isAmountNan = isNaN(Number(expenseInfo.total_amount));
                const amount = parseFloat(expenseInfo.total_amount);
                if (!value) errorMsg = "Total amount is required";
                else if (isAmountNan || amount <= 0 || amount > 9999999999.99) {
                    errorMsg = "Amount must be between 0.01 and 9,999,999,999.99";
                }
                break;

            case "description":
                if (value.length > 150) errorMsg = "Must not be greater than 150 characters";
                break;
        }
        return errorMsg;
    };
    const [isFormInvalid, setIsFormInvalid] = useState(true);
    const isValid = !Object.entries(expenseInfo).every(([key, value]) => !validateField(key, value!));
    useEffect(() => setIsFormInvalid(isValid), [isValid])

    const handleSubmit = async () => {
        let debtorsArr: Debtor[] = [];
        let payer_share = 0;
        if (expenseInfo.split_type === "EQUAL") {
            debtorsArr = selectedParticipants.map((participant, index) => {
                // debtor_id: participant.group_membership_id,
                // debtor_share: parseFloat((expenseInfo.total_amount!/(selectedParticipants.length ?? 1)).toFixed(2))
                let debtorShare = parseFloat((parseFloat(expenseInfo.total_amount)! / (selectedParticipants.length ?? 1)).toFixed(2));

                // For all participants except the last one, round the amount
                if (index === selectedParticipants.length - 1) {
                    // Last participant gets the remainder to make sure the total sum matches
                    debtorShare = parseFloat((parseFloat(expenseInfo.total_amount)! - (debtorShare * (selectedParticipants.length - 1))).toFixed(2));
                }

                return {
                    debtor_id: participant.group_membership_id,
                    debtor_share: debtorShare
                };
            });
            const payer = debtorsArr.find((debtor) => expenseInfo.payer_id === debtor.debtor_id);
            payer_share = payer ? payer.debtor_share : 0;
            debtorsArr = debtorsArr.filter((debtor) => expenseInfo.payer_id !== debtor.debtor_id);
            setPayerShare(payer_share);
            setDebtors(debtorsArr);
        }

        // Exit the function if the form is not valid
        //   if (!form.valid) {
        //     return;
        //   }

        const formData = new FormData();
        // Loop through each form control and append values to formData
        Object.keys(expenseInfo).forEach((key) => {
            const value = expenseInfo[
                key as keyof typeof expenseInfo
            ] as unknown;
            // Only append the value if the control has a value
            if (value !== null && value !== undefined && value !== "") {
                if (key === "receipt" && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        formData.append("payer_share", `${payer_share ? payer_share.toString() : payerShare!.toString()}`);
        formData.append("debtors", JSON.stringify(debtorsArr.length ? debtorsArr : debtors));
        

        //   handleAddExpense({
        //     formData,
        //     expenseData: { ...expenseInfo, debtors: this.debtors, payer_share: this.payer_share }
        // });
        handleAddExpense(formData);
          handleAddExpensesClose();

        setExpenseInfo({
            expense_name: "",
            total_amount: "",
            description: "",
            payer_id: currentMember.group_membership_id,
            split_type: "EQUAL",
        });
        // Close the dialog and pass the formData and other relevant expense data
        //   this.dialogRef.close({
        //     formData: formData,
        //     expenseData: { ...expenseInfo, debtors: this.debtors, payer_share: this.payer_share },
        //   });
        // expenseInfo.debtor_id = expenseInfo.payer_id === user?.user_id ? friend.user_id : user!.user_id;
        // expenseInfo.debtor_share = expenseInfo.debtor_id === user?.user_id ? expenseInfo.participant1_share : expenseInfo.participant2_share
        // const formData = new FormData();
        // Object.keys(expenseInfo).forEach((key) => {
        // const value = expenseInfo[
        //     key as keyof typeof expenseInfo
        // ] as unknown;


        // });
    }
    const payerChange = (selectedId: string) => {
        setExpenseInfo((prev) => ({ ...prev, "payer_id": selectedId }));
    }
    const handleShareChange = (key: string, value: string) => {
        setExpenseInfo((prev) => ({ ...prev, [key]: value }))
    }
    return (
        <>
            <CustomDialog open={dialogOpen} onClose={(value: boolean) => handleConfirmDialogClose(value)} title="Confirmation" message={`Are you sure to cancel adding expense? All the data entered will be lost.`} />
            {
                open &&
                <>
                    <SplitType
                        totalAmount={parseFloat(expenseInfo.total_amount)}
                        participants={participants}
                        splitState={splitState}
                        open={splitTypeOpen}
                        handleSplitTypeClose={handleSplitTypeClose}
                        handleShareChange={handleShareChange}
                    />
                    <Payer participants={participants} selectedId={expenseInfo.payer_id} payerChange={payerChange} open={PayerDialogOpen} handleAddExpensesClose={handlePayerDialogClose} />
                </>
            }
            <Modal open={open} onClose={addExpenseDialogClose}>
                <motion.div
                    initial={{ x: 0 }}
                    animate={(PayerDialogOpen || splitTypeOpen) ? { x: -200 } : { x: 0 }} // Slide to the left when second modal opens
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        height: "100%",
                        zIndex: 10
                    }}
                >
                    <ModalDialog
                        sx={{
                            backgroundColor: "white",
                            position: "fixed",
                            top: "10",
                            minWidth: "35%",
                            padding: 0,
                            border: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                            zIndex: 10
                        }}
                    >
                        {/* <ModalClose onClick={() => handleViewExpensesClose()} /> */}
                        <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Add Expense</DialogTitle>
                        <Box className="rounded bg-[white] flex flex-col gap-3 p-3">
                            <TextField
                                label="Expense Name"
                                required
                                variant="outlined"
                                name="expense_name"
                                value={expenseInfo.expense_name}
                                onChange={(e) => onChange("expense_name", e.target.value)}
                                onBlur={(e) => onChange("expense_name", e.target.value.trim())}
                                fullWidth
                                error={!!errors.expense_name}
                                helperText={errors.expense_name}
                            />

                            <TextField
                                label="Total Amount"
                                required
                                variant="outlined"
                                name="total_amount"
                                value={expenseInfo.total_amount}
                                onChange={(e) => onChange("total_amount", e.target.value)}
                                onBlur={(e) => onChange("total_amount", e.target.value.trim())}
                                fullWidth
                                error={!!errors.total_amount}
                                helperText={errors.total_amount}
                            />
                            <TextField
                                label="Description"
                                variant="outlined"
                                name="description"
                                value={expenseInfo.description}
                                onChange={(e) => onChange("description", e.target.value)}
                                onBlur={(e) => onChange("description", e.target.value.trim())}
                                fullWidth
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                            <Box className="rounded-lg flex justify-center items-center gap-2">
                                <Typography>Paid by</Typography>
                                <Button disabled={isFormInvalid} sx={{ borderRadius: "50px" }} onClick={handlePayerDialogOpen} variant="outlined">
                                    {
                                        expenseInfo.payer_id === user?.user_id
                                            ?
                                            "you"
                                            :
                                            `${participants.find(participant => participant.group_membership_id === expenseInfo.payer_id)?.first_name} ${participants.find(participant => participant.group_membership_id === expenseInfo.payer_id)?.last_name}`
                                    }
                                </Button>
                                <Typography>and split</Typography>
                                <Button disabled={isFormInvalid} sx={{ borderRadius: "50px" }} onClick={handleSplitTypeOpen} variant="outlined">
                                    {expenseInfo.split_type}
                                </Button>
                            </Box>
                            <Button
                                component="label"
                                role={undefined}
                                tabIndex={-1}
                                variant="outlined"
                                color="neutral"
                                startDecorator={
                                    <SvgIcon>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                            />
                                        </svg>
                                    </SvgIcon>
                                }
                            >
                                Upload Receipt
                                <VisuallyHiddenInput type="file" />
                            </Button>
                            <Box className="flex justify-between items-center">
                                <Button >
                                    Bulk Insertion of Expenses
                                </Button>
                                <Box className="flex gap-3">
                                    <Button onClick={addExpenseDialogClose}>
                                        Cancel
                                    </Button>
                                    <Button disabled={isFormInvalid} onClick={handleSubmit}>
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </ModalDialog>
                </motion.div>
            </Modal>
        </>
    )
}

export default AddExpense