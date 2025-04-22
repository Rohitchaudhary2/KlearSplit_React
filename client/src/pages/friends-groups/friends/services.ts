import { API_URLS } from "../../../constants/apiUrls";
import axiosInstance from "../../../utils/axiosInterceptor";

interface PaymentInfo {
    amount: number,
    id: string,
    payerId: string,
    debtorId: string,
    type: "friends"
}

export const onGetFriends = (params: { status: string }) => axiosInstance.get(`${API_URLS.getFriends}`, {
    params,
    withCredentials: true
})

export const onGetMessages = (params: { pageSize: number, timestamp: string }, id: string) => axiosInstance.get(`${API_URLS.getMessages}/${id}`, {
    params,
    withCredentials: true
})

export const onGetExpenses = (params: { fetchAll?: boolean, pageSize?: number, timestamp: string }, id: string) => axiosInstance.get(`${API_URLS.getExpenses}/${id}`, {
    params,
    withCredentials: true
})

export const onGetCombined = (params: { pageSize: number, timestamp: string }, id: string) => axiosInstance.get(`${API_URLS.getCombined}/${id}`, {
    params,
    withCredentials: true
})

export const onAcceptRejectRequest = (status: string, id: string) => axiosInstance.patch(
    `${API_URLS.acceptRejectRequest}/${id}`,
    { status },
    { withCredentials: true }
)

export const onAddExpense = (formData: FormData, id: string) => axiosInstance.post(
    `${API_URLS.addExpense}/${id}`,
    formData,
    { withCredentials: true }
)

export const onAddSettlement = (total_amount: number, id: string) => axiosInstance.post(
    `${API_URLS.addExpense}/${id}`,
    { split_type: "SETTLEMENT", total_amount },
    { withCredentials: true }
)

export const onArchiveBlockRequest = (type: string, id: string) => axiosInstance.patch(
    `${API_URLS.archiveBlockRequest}/${id}`,
    { type },
    { withCredentials: true }
)

export const onGetUsers = (inputTerm: string) => axiosInstance.get(`${API_URLS.getUsers}/${inputTerm}`, { withCredentials: true });

export const onAddFriend = (inputTerm: string) => axiosInstance.post(
    `${API_URLS.addFriend}`,
    { email: inputTerm },
    { withCredentials: true }
)

export const onBulkAddExpenses = (formData: FormData, id: string) => axiosInstance.post(
    `${API_URLS.bulkAddExpenses}/${id}`,
    formData,
    { withCredentials: true }
)

export const onCreatePayment = (paymentInfo: PaymentInfo) => axiosInstance.post(`${API_URLS.createPayment}`, paymentInfo, { withCredentials: true })

export const onUpdateExpenseService = (expenseInfo: FormData, id: string) => axiosInstance.patch(
    `${API_URLS.updateExpense}/${id}`,
    expenseInfo,
    { withCredentials: true }
)

export const onDeleteExpenseService = (friend_expense_id: string, id: string) => axiosInstance.delete(
    `${API_URLS.deleteExpense}/${id}`,
    {
        data: { friend_expense_id },
        withCredentials: true,
    }
);