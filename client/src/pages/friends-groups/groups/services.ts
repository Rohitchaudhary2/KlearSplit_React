import { API_URLS } from "../../../constants/apiUrls";
import axiosInstance from "../../../utils/axiosInterceptor";
import { CreateGroupResponse, GroupExpenseResponse } from "./index.model";

interface MembersData {
    coadmins?: string[] | undefined;
    admins?: string[] | undefined;
    members: string[];
}

interface PaymentInfo {
    amount: number,
    id: string,
    payerId: string,
    debtorId: string,
    type: "groups"
}

export const onGetGroups = () => axiosInstance.get(`${API_URLS.getGroups}`, {
    params: { status: "PENDING" },
    withCredentials: true
})

export const onGetMessages = (params: { pageSize: number, timestamp: string }, id: string) => axiosInstance.get(`${API_URLS.getGroupMessages}/${id}`, {
    params,
    withCredentials: true
})

export const onGetExpensesSettlements = (params: { pageSize: number, timestamp: string }, id: string) => axiosInstance.get(`${API_URLS.fetchExpensesSettlements}/${id}`, {
    params,
    withCredentials: true
})

export const onGetCombined = (params: { pageSize: number, timestamp: string }, id: string) => axiosInstance.get(`${API_URLS.fetchGroupCombined}/${id}`, {
    params,
    withCredentials: true
})

export const onAcceptRejectRequest = (status: string, id: string) => axiosInstance.patch(
    `${API_URLS.acceptRejectRequest}/${id}`,
    { status },
    { withCredentials: true }
);

export const onGetGroupData = (id: string) => axiosInstance.get(
    `${API_URLS.group}/${id}`,
    { withCredentials: true }
)

export const onAddExpense = (formData: FormData, id: string) => axiosInstance.post<GroupExpenseResponse>(
    `${API_URLS.addGroupExpense}/${id}`,
    formData,
    { withCredentials: true }
)

export const onLeaveGroup = (id: string) => axiosInstance.delete(`${API_URLS.leaveGroup}/${id}`, { withCredentials: true })

export const onUpdateGroupMember = (data: { has_blocked?: boolean, has_archived?: boolean }, id: string) => axiosInstance.patch(
    `${API_URLS.updateGroupMember}/${id}`,
    data,
    { withCredentials: true }
)

export const onAddSettlement = (data: {
    payer_id: string,
    debtor_id: string,
    settlement_amount: number
}, id: string) => axiosInstance.post(
    `${API_URLS.addGroupSettlements}/${id}`,
    data,
    { withCredentials: true }
)

export const onUpdateGroup = (formData: FormData, id: string) => axiosInstance.patch(`${API_URLS.group}/${id}`, formData, { withCredentials: true })

export const onCreateGroup = (formData: FormData) => axiosInstance.post<CreateGroupResponse>(
    `${API_URLS.createGroup}`,
    formData,
    { withCredentials: true }
)

export const onGetUsers = (q: string) => axiosInstance.get(`${API_URLS.getUsers}/${q}`, { params: { fetchAll: true } })

export const onAddMembers = (data: {
    membersData: MembersData,
    group_id: string
}) => axiosInstance.post(
    API_URLS.addGroupMembers,
    data,
    {withCredentials: true}
  )

  export const onCreatePayment = (paymentInfo: PaymentInfo) => axiosInstance.post(`${API_URLS.createPayment}`, paymentInfo, { withCredentials: true })
