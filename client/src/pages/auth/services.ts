import { API_URLS } from "../../constants/apiUrls";
import axiosInstance from "../../utils/axiosInterceptor";

interface SignupInfo {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    otp?: string;
}

export const signup = (signupInfo: SignupInfo) => axiosInstance.post(API_URLS.verify, signupInfo);

export const otpSubmission = (data: SignupInfo) => axiosInstance.post(API_URLS.register, data, { withCredentials: true })

export const handleLogin = (loginInfo: {email: string, password: string}) => axiosInstance.post(API_URLS.login, loginInfo, { withCredentials: true })

export const forgotPassword = async (email: string, otp: string) => await axiosInstance.post(API_URLS.forgotPassword, { email, otp });

export const verifyForgotPassword = async (email: string) => await axiosInstance.post(API_URLS.verifyForgotPassword, { email });