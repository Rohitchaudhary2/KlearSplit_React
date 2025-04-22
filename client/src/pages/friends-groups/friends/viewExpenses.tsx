import { Delete, Download, Edit } from "@mui/icons-material"
import { ModalDialog } from "@mui/joy"
import { Modal, DialogTitle, Box, Button, Divider } from "@mui/material"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { Expense, Friend } from "./index.model";
import { format } from "date-fns";
import AddExpense from "./addExpense";
import { toast } from "sonner";
import { onDeleteExpenseService, onGetExpenses, onUpdateExpenseService } from "./services";

const ViewExpenses: React.FC<{
    open: boolean,
    handleUpdateExpense: (expense: Expense) => void,
    handleDeleteExpense: (expense: Expense) => void,
    friend: Friend
    handleViewExpensesClose: () => void
}> = ({ open, friend, handleUpdateExpense, handleDeleteExpense,
    handleViewExpensesClose
}) => {
        const [loading, setLoading] = useState(false);
        const [expenses, setExpenses] = useState<Expense[]>([]);
        const [updateExpenseOpen, setUpdateExpenseOpen] = useState(false);
        const [expenseToBeUpdated, setExpenseToBeUpdated] = useState<Expense>();
        useEffect(() => {
            if (expenseToBeUpdated) {
                setUpdateExpenseOpen(true);
            } else {
                setUpdateExpenseOpen(false)
            }
        }, [expenseToBeUpdated])
        useEffect(() => {
            setLoading(true);
            const fetchExpenses = async () => {
                const params = { fetchAll: true, timestamp: new Date().toISOString() };
                try {
                    const res = await onGetExpenses(params, friend.conversation_id);

                    setExpenses(res.data.data);
                } catch (error) {
                    toast.error("Failed to fetch expenses, please try again later");
                } finally {
                    setLoading(false);
                }
            }
            fetchExpenses()
        }, [open])
        const downloadExpenses = () => {
            const doc = new jsPDF();

            // Define the columns for the table (these will be used as headers)
            const columns = [
                { header: "Date", dataKey: "date" },
                { header: "Expense Name", dataKey: "name" },
                { header: "Total Amount", dataKey: "amount" },
                { header: "Payer Name", dataKey: "payer" },
                { header: "Split Type", dataKey: "splitType" },
                { header: "Debt Amount", dataKey: "debtAmount" },
                { header: "Description", dataKey: "description" },
            ];

            // Map through the totalExpenses and transform the data into a format compatible with the table
            const extractedExpense = expenses.map((expense) => ({
                date: format(new Date(expense.createdAt), 'dd MMM, yyyy'),
                name: expense.expense_name,
                amount: expense.total_amount,
                payer: expense.payer,
                splitType: expense.split_type,
                debtAmount: expense.debtor_amount,
                description: expense.description ?? "-",
            }));

            // Convert the array of objects (expenses) into array of arrays for the autoTable body
            const body = extractedExpense.map((expense) => Object.values(expense));

            // Generate the table in the PDF using the autoTable
            autoTable(doc, {
                head: [columns.map((col) => col.header)],
                body,
            });

            // Save the generated PDF with the filename 'expense_report.pdf'
            doc.save("expense_report.pdf");
        }
        const onUpdateExpense = (expense: Expense) => {
            setExpenseToBeUpdated(expense);
        }
        const handleAddExpense = async (expenseInfo: FormData) => {
            try {
                const res = await onUpdateExpenseService(expenseInfo, friend.conversation_id);

                const updatedExpenses = expenses.map((expense) => {
                    if(expense.friend_expense_id === res.data.data.friend_expense_id) {
                        return res.data.data;
                    }
                    return expense;
                })
                setExpenses(updatedExpenses);

                handleUpdateExpense(res.data.data);
                toast.success("Expense updated successfully!");
            } catch (error) {
                toast.error("Failed to update expense, please try again later");
            }
            handleAddExpensesClose();
        }
        const onDeleteExpense = async (expenseData: Expense) => {
            try {
                await onDeleteExpenseService(expenseData.friend_expense_id, friend.conversation_id);

                const updatedExpenses = expenses.filter((expense) => expense.friend_expense_id !== expenseData.friend_expense_id)
                setExpenses(updatedExpenses);

                handleDeleteExpense(expenseData);
                toast.success("Expense deleted successfully!");
            } catch (error) {
                toast.error("Failed to delete expense, please try again later");
            }
        }
        const handleAddExpensesClose = () => {
            setExpenseToBeUpdated(undefined);
        }
        return (
            <>
                {
                    updateExpenseOpen &&
                    <AddExpense
                        id={friend.conversation_id}
                        open={updateExpenseOpen}
                        friend={friend.friend}
                        expense={expenseToBeUpdated!}
                        handleAddExpense={handleAddExpense}
                        handleAddExpensesClose={handleAddExpensesClose}
                    />
                }
                <Modal open={open} onClose={() => handleViewExpensesClose()}>
                    <ModalDialog layout="center"
                        sx={{
                            backgroundColor: "#A1E3F9",
                            position: "fixed",
                            top: "10",
                            minHeight: "90%",
                            minWidth: "90%",
                            padding: 0,
                            border: "none",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0
                        }}
                    >
                        {/* <ModalClose onClick={() => handleViewExpensesClose()} /> */}
                        <DialogTitle className="bg-[#3674B5] text-center text-white" sx={{ borderRadius: "7px 7px 0px 0px" }}>Expenses</DialogTitle>
                        <Box className="grow overflow-y-auto">
                            <table className="table-auto w-full h-full border-collapse table-hover table-bordered bg-[white]">
                                <thead className="bg-[white] text-black sticky top-0 z-10 border-none p-0 m-0">
                                    <tr className="text-center">
                                        <th className="px-2 py-1 text-sm">Date</th>
                                        <th className="px-2 py-1 text-sm">Expense Name</th>
                                        <th className="px-2 py-1 text-sm">Total Amount</th>
                                        <th className="px-2 py-1 text-sm">Payer Name</th>
                                        <th className="px-2 py-1 text-sm">Split Type</th>
                                        <th className="px-2 py-1 text-sm">Debt Amount</th>
                                        <th className="px-2 py-1 text-sm">Description</th>
                                        <th className="px-2 py-1 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                {
                                    !loading ?
                                        <tbody className="border-y">
                                            {
                                                expenses.map((expense) => (
                                                    <tr key={expense.friend_expense_id} className="text-center text-sm">
                                                        <td className="px-2 py-1">{format(new Date(expense.createdAt), 'dd MMM, yyyy')}</td>

                                                        {/* Expense Name */}
                                                        <td className="px-2 py-1 max-w-[13vw] break-words">
                                                            {expense.expense_name}
                                                        </td>

                                                        {/* Total Amount */}
                                                        <td className="px-2 py-1">
                                                            {expense.total_amount}
                                                        </td>

                                                        {/* Payer Name */}
                                                        <td className="px-2 py-1">
                                                            {expense.payer}
                                                        </td>

                                                        {/* Split Type */}
                                                        <td className="px-2 py-1">
                                                            {expense.split_type}
                                                        </td>

                                                        {/* Debt Amount */}
                                                        <td className="px-2 py-1">
                                                            {expense.debtor_amount}
                                                        </td>

                                                        {/* Description */}
                                                        <td className="px-2 py-1">
                                                            {expense.description ?? "-"}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-2 py-1 flex justify-center items-center space-x-2">
                                                            {/* Update Icon */}
                                                            <button
                                                                disabled={expense.split_type === "SETTLEMENT"}
                                                                onClick={() => onUpdateExpense(expense)}
                                                                onKeyUp={(e) => e.key === 'Enter' && onUpdateExpense(expense)}
                                                                className={"hover:text-blue-500 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"}
                                                                aria-label="Update"
                                                            >
                                                                {/* {isUpdateLoading(expense) ? (
                                                                    <div className="spinner-border spinner-border-sm text-blue-500" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                ) : 'Edit'} */}
                                                                <Edit />
                                                            </button>

                                                            {/* Delete Icon */}
                                                            <button
                                                                disabled={expense.split_type === "SETTLEMENT"}
                                                                onClick={() => onDeleteExpense(expense)}
                                                                onKeyUp={(e) => e.key === 'Enter' && onDeleteExpense(expense)}
                                                                className={"hover:text-red-500 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"}
                                                                aria-label="Delete"
                                                            >
                                                                {/* {isDeleteLoading(expense) ? (
                                                                    <div className="spinner-border spinner-border-sm text-blue-500" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                ) : 'Delete'} */}
                                                                <Delete />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                        :
                                        <tbody className="max-h-[70vh] overflow-y-auto">
                                            <tr>
                                                <td className="text-center py-4 text-gray-500">Loading...</td>
                                            </tr>
                                        </tbody>

                                }
                            </table>
                            <Divider />
                        </Box>
                        <Box className="flex justify-end gap-2 items-center py-2 px-3">
                            <Button onClick={downloadExpenses}>
                                <Download />
                            </Button>
                            <Button variant="contained" onClick={handleViewExpensesClose}>
                                Close
                            </Button>
                        </Box>
                    </ModalDialog>
                </Modal>
            </>
        )
    }

export default ViewExpenses;