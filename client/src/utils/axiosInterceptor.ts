import axios from 'axios';
import { toast } from 'sonner';
import { store } from '../store';
import { login, logout } from '../store/authSlice';
import { API_URLS } from '../constants/apiUrls';

const axiosInstance = axios.create({
  withCredentials: true,
});

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
    if(store.getState().auth.isAuthenticated) {
      toast.error(response.data.message)
    }
    return;

    // Re-throw the error to be handled elsewhere in your application if necessary
    // return Promise.reject(error.response.data);
  }
);

export default axiosInstance;
