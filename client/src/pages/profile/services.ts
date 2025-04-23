import { API_URLS } from "../../constants/apiUrls";
import axiosInstance from "../../utils/axiosInterceptor";

interface Passwords {
    currentPassword: string;
    newPassword: string;
}

export const onUpdateProfile = (formData: FormData, id: string) => axiosInstance.patch(
    `${API_URLS.updateProfile}/${id}`,
    formData,
    { withCredentials: true }
)

export const onUpdatePassword = (passwords: Passwords, id: string) => axiosInstance.patch(
    `${API_URLS.updateProfile}/${id}`,
    {
        "password": passwords.currentPassword,
        "new_password": passwords.newPassword
    },
    { withCredentials: true }
)