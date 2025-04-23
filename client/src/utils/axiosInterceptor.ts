import axios from 'axios';
import { toast } from 'sonner';
import { store } from '../store';
import { login, logout } from '../store/authSlice';
import { API_URLS } from '../constants/apiUrls';

const axiosInstance = axios.create({
  withCredentials: true,
});

const getErrorMessage = (status: number, error: any): string => {
  const defaultMessages: Record<number, string> = {
      400: error?.message || "Bad Request",
      401: "Unauthorized",
      403: error?.message || "You do not have permission to perform this action.",
      404: error?.message || "The requested resource was not found.",
      410: error?.message || "Account deleted, please restore it.",
      500: "Something went wrong. Please try again later.",
      503: "Service unavailable. Please try again later.",
  };

  return defaultMessages[status] || error?.message || "Something went wrong. Please try again.";
};

// Axios interceptor to catch 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response, // Just return the response if no error
  async (error) => {
    const { response, config } = error;

    // Check for 401 Unauthorized status
    if (response?.status === 401 && response.data.message === "Token expired") {
        try {
            // Refresh the access token
            await axiosInstance.get(API_URLS.refreshAccessToken, { withCredentials: true });
            const user = await axiosInstance.get(`${API_URLS.fetchUser}`, {withCredentials: true});
            store.dispatch(login(user.data.data));
    
            // Retry the original request
            return axiosInstance(config);
          } catch (error) {
            // Handle refresh token failure
            if(store.getState().auth.isAuthenticated) {
                toast.error("Unauthorized!")
            }
            store.dispatch(logout())
            return;
          }
    }
    const errorMessage = getErrorMessage(response.status, response.data);
    if(response.status !== 401) toast.error(errorMessage);
    return;
  }
);

export default axiosInstance;
