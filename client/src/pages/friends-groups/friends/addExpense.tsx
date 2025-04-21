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
import { Expense } from "./index.model"
import axiosInstance from "../../../utils/axiosInterceptor"
import { API_URLS } from "../../../constants/apiUrls"
import { toast } from "sonner"

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
    id: string,
    open: boolean,
    friend: User,
    expense?: Expense,
    handleBulkAddExpenses?: (expenses: Expense[]) => void
    handleAddExpensesClose: () => void,
    handleAddExpense: (expenseInfo: FormData) => void
}> = ({ id, open, friend, expense, handleBulkAddExpenses,handleAddExpensesClose, handleAddExpense }) => {
    const user = useSelector((store: RootState) => store.auth.user)
    const [expenseInfo, setExpenseInfo] = useState({
        expense_name: "",
        total_amount: "",
        description: "",
        payer_id: user!.user_id,
        debtor_id: "",
        participant1_share: "",
        participant2_share: "",
        split_type: "EQUAL",
        debtor_share: ""
    });
    const [isBulkExpenseOptionOpen, setIsBulkExpenseOptionOpen] = useState(false);
    useEffect(() => {
        if (expense) {
            let participant1_share = "";
            let participant2_share = "";
            const isUserPayer = expense.payer_id === user?.user_id;
            switch (expense.split_type) {
                case "EQUAL": {
                    participant1_share = JSON.stringify(parseFloat(expense.total_amount) / 2);
                    participant2_share = JSON.stringify(parseFloat(expense.total_amount) / 2);
                    break;
                }
                case "UNEQUAL": {
                    participant1_share = isUserPayer ?
                        JSON.stringify(parseFloat(expense.total_amount) - parseFloat(expense.debtor_amount)) :
                        expense.debtor_amount
                    participant2_share = !isUserPayer ?
                        JSON.stringify(parseFloat(expense.total_amount) - parseFloat(expense.debtor_amount)) :
                        expense.debtor_amount
                    break;
                }
                case "PERCENTAGE": {
                    const payerPercentage = JSON.stringify(Math.round((parseFloat(expense.total_amount) - parseFloat(expense.debtor_amount)) / parseFloat(expense.total_amount)) * 100);
                    const debtorPercentage = JSON.stringify(Math.round(parseFloat(expense.debtor_amount) / parseFloat(expense.total_amount)) * 100);
                    participant1_share = isUserPayer ? payerPercentage : debtorPercentage;
                    participant2_share = !isUserPayer ? payerPercentage : debtorPercentage;
                }
            }
            setExpenseInfo({
                expense_name: expense.expense_name,
                total_amount: expense.total_amount,
                description: expense.description ?? "",
                payer_id: expense.payer_id,
                debtor_id: expense.debtor_id,
                participant1_share,
                participant2_share,
                split_type: expense.split_type,
                debtor_share: "",
            });
        }
    }, [])
    const [errors, setErrors] = useState({
        expense_name: "",
        total_amount: "",
        description: ""
    })
    const [csvError, setCsvError] = useState("");
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
        if(isBulkExpenseOptionOpen) {
            const formData = new FormData();
            formData.append("file", selectedFile!, selectedFile!.name);
            formData.append("tableName", "friends_expenses");
            try {
                const res = await axiosInstance.post(
                  `${API_URLS.bulkAddExpenses}/${id}`,
                  formData,
                  { withCredentials: true }
                );
              
                toast.success("Expenses added successfully!");
                handleBulkAddExpenses!(res.data.data);
                handleAddExpensesClose();
              } catch (error) {
                toast.error("Failed to add expenses, please try again later");
              }              
            return;
        }
        expenseInfo.debtor_id = expenseInfo.payer_id === user?.user_id ? friend.user_id : user!.user_id;
        expenseInfo.debtor_share = expenseInfo.debtor_id === user?.user_id ? expenseInfo.participant1_share : expenseInfo.participant2_share
        const formData = new FormData();
        Object.keys(expenseInfo).forEach((key) => {
            const value = expenseInfo[
                key as keyof typeof expenseInfo
            ] as unknown;

            if (value !== null && value !== undefined && value !== "") {
                if (key === "receipt" && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });
        if (expense) {
            formData.append("friend_expense_id", expense.friend_expense_id);
            handleAddExpense(formData);
        } else {
            handleAddExpense(formData);
            handleAddExpensesClose();
        }
        setExpenseInfo({
            expense_name: "",
            total_amount: "",
            description: "",
            payer_id: user!.user_id,
            debtor_id: "",
            participant1_share: "",
            participant2_share: "",
            split_type: "EQUAL",
            debtor_share: ""
        });
    }
    const payerChange = (selectedId: string) => {
        setExpenseInfo((prev) => ({ ...prev, "payer_id": selectedId }));
    }
    const handleShareChange = (key: string, value: string) => {
        setExpenseInfo((prev) => ({ ...prev, [key]: value }))
    }
    const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const fileName = file.name;
            const fileExtension = fileName.split(".").pop()?.toLowerCase();

            const isValidExtension = fileExtension === "csv";

            if (isValidExtension) {
                setIsFileSelected(true);
                setSelectedFile(file);
                setCsvError("");
            } else {
                setIsFileSelected(false);
                setSelectedFile(null);
                setCsvError(
                    "Please select a .csv file only"
                );
            }
        } else {
            resetFileSelection();
        }
    }

    const resetFileSelection = () => {
        setIsFileSelected(false);
        setSelectedFile(null);
        setCsvError("")
    }
    const downloadFile = (fileUrl: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };
    return (
        <>
            <CustomDialog open={dialogOpen} onClose={(value: boolean) => handleConfirmDialogClose(value)} title="Confirmation" message={`Are you sure to cancel adding expense? All the data entered will be lost.`} />
            {
                open &&
                <>
                    <SplitType
                        friend={friend}
                        user={user!}
                        open={splitTypeOpen}
                        handleSplitTypeClose={handleSplitTypeClose}
                        expenseInfo={expenseInfo}
                        handleShareChange={handleShareChange}
                    />
                    <Payer friend={friend} user={user!} selectedId={expenseInfo.payer_id} payerChange={payerChange} open={PayerDialogOpen} handleAddExpensesClose={handlePayerDialogClose} />
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
                            {
                                !isBulkExpenseOptionOpen ?
                                    <>
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
                                                        `${friend.first_name} ${friend.last_name}`
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
                                    </> :
                                    <>
                                        <div className="file-upload-section space-y-4">
                                            <input
                                                type="file"
                                                onChange={onFileSelected}
                                                accept=".csv"
                                                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                            />

                                            <Box className="flex flex-col gap-2">
                                                <Button
                                                    fullWidth
                                                    onClick={() => downloadFile("sample.csv", "sample.csv")}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                                >
                                                    Download Sample CSV
                                                </Button>

                                                <Button
                                                    fullWidth
                                                    onClick={() => downloadFile("Instructions.pdf", "Instructions.pdf")}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                                >
                                                    Instructions For CSV
                                                </Button>
                                            </Box>
                                            {csvError && (
                                                <p className="text-red-600">Please select a .csv file only.</p>
                                            )}
                                        </div>
                                    </>
                            }
                            <Box className="flex justify-between items-center">
                                <Button onClick={() => {
                                    setIsBulkExpenseOptionOpen((prev) => !prev)
                                    resetFileSelection()
                                }}>
                                    {!isBulkExpenseOptionOpen ? "Bulk Insertion of Expenses" : "Single Insertion"}
                                </Button>
                                <Box className="flex gap-3">
                                    <Button onClick={addExpenseDialogClose}>
                                        Cancel
                                    </Button>
                                    <Button disabled={isFormInvalid && !isFileSelected} onClick={handleSubmit}>
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