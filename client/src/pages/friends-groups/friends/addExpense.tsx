import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, TextField, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import { useState } from "react"
import SvgIcon from '@mui/joy/SvgIcon';
import { styled } from '@mui/joy';
import Button from '@mui/joy/Button';
import Payer from "./payer"
import { motion } from "framer-motion"
import SplitType from "./splitType"

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
    const onChange = (key: string, value: string | number) => setExpenseInfo((prev) => ({ ...prev, [key]: value }))
    return (
        <>
            <SplitType open={splitTypeOpen} handleSplitTypeClose={handleSplitTypeClose}/>
            <Payer open={PayerDialogOpen} handleAddExpensesClose={handlePayerDialogClose} />
            <Modal open={open} onClose={() => handleAddExpensesClose() }>
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
                                <Button sx={{ borderRadius: "50px" }} onClick={handlePayerDialogOpen} variant="outlined">you</Button>
                                <Typography>and split</Typography>
                                <Button sx={{ borderRadius: "50px" }} onClick={handleSplitTypeOpen} variant="outlined">EQUAL</Button>
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
                                    <Button onClick={handleAddExpensesClose}>
                                        Cancel
                                    </Button>
                                    <Button >
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