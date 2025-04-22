import { API_URLS } from "../../constants/apiUrls";
import axiosInstance from "../../utils/axiosInterceptor";

export const handleExpensesCount = () => axiosInstance.get(API_URLS.expensesCount, { withCredentials: true });

export const handleBalanceAmounts = () => axiosInstance.get(API_URLS.balanceAmounts, { withCredentials: true });

export const handleCashFlowFriends = () => axiosInstance.get(API_URLS.cashFlowFriends, { withCredentials: true });

export const handleCashFlowGroups = () => axiosInstance.get(API_URLS.cashFlowGroups, { withCredentials: true });

export const handleMonthlyExpenses = (year: number) => axiosInstance.post(API_URLS.monthlyExpenses, { year }, { withCredentials: true });