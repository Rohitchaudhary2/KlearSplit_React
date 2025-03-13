import { Email, Google, Lock, Person, Phone } from "@mui/icons-material";
import { Stack, TextField, Button, Typography, InputAdornment } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../../store/authSlice";
import CustomDialog from "../../../components/base/customModal";
import { API_URLS } from "../../../constants/apiUrls";

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [signupInfo, setSignupInfo] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [stage, setStage] = useState("signup");
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        otp: ''
    });
    const validateField = (name: string, value: string) => {
        let errorMsg = "";

        switch (name) {
            case "first_name":
                if (!value) errorMsg = "First Name is required";
                else if (value.length < 3) errorMsg = "Must be at least 3 characters";
                else if (value.length > 50) errorMsg = "Must not be greater than 50 characters";
                break;

            case "email":
                if (!value) errorMsg = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    errorMsg = "Invalid email format";
                break;

            case "last_name":
                if (value && value.length < 3) errorMsg = "Must be at least 3 characters";
                else if (value.length > 50) errorMsg = "Must not be greater than 50 characters";
                break;

            case "phone":
                if (value && !(/^\d+$/.test(value))) {
                    errorMsg = "Only Numbers are allowed"
                } else if (value && value.length !== 10) {
                    errorMsg = "Phone Number must be of 10 digits."
                }
                break;
            case "otp":
                if (value.length !== 6) errorMsg = "OTP must be of 6 digits."
                break;
        }

        return errorMsg;
    };
    
    const [isSignUpDisabled, setIsSignUpDisabled] = useState(true);
    const isValid = !Object.entries(signupInfo).every(([key, value]) => !validateField(key, value));
    useEffect(() => setIsSignUpDisabled(isValid), [isValid])
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        switch(stage) {
            case "signup":
                const res = await axios.post(API_URLS.verify, signupInfo)
                if(!res.data.success) {
                    toast.error(res.data.message);
                }
                
                setStage("otp");
                toast.success(res.data.message);
                break;
            case "otp": {
                const res = await axios.post(API_URLS.register, { ...signupInfo, "otp": otp}, {withCredentials: true})
                if(!res.data.success) {
                    toast.error(res.data.message);
                }
                dispatch(login(res.data.data))
                navigate("/dashboard");
                toast.success(res.data.message);
                break;
            }
        }
        
    }

    const onChange = (key: string, value: string) => {
        setSignupInfo((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
    }
    const onOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        // Allow only digits and limit to 6 characters
        if (/^\d{0,6}$/.test(value)) {
            setOtp(value);
            setErrors((prev) => ({ ...prev, otp: validateField("otp", value) }));

            if (value.length === 6) {
                setIsSignUpDisabled(false);
            } else {
                setIsSignUpDisabled(true);
            }
        }
    }

    const handleWrongEmail = () => {
        setDialogOpen(true);
    }

    const handleDialogClose = (value: boolean) => {
        setDialogOpen(false);
        if(value) setStage("signup")
    }

    const handleGoogleSignup = () => {
        const newWindow = window.open(API_URLS.googleAuth, "_self");
        if (newWindow) {
        newWindow.opener = null; // Ensures no link between the parent and the new window
        }
    }

    return (
        <>
            <CustomDialog open={dialogOpen} onClose={handleDialogClose} title="Confirmation" message={`Are you sure entered email "${signupInfo.email} wrong?"`}/>
            <div className="flex justify-center min-h-screen items-center w-full md:w-6/7 mx-auto grid grid-cols-10 p-10 rounded-sm">
                <div className="md:col-span-5 col-span-10 h-full bg-[#D1F8EF] shadow-2xl rounded-lg md:rounded-l-lg md:rounded-r-none p-6 items-center content-center">
                    <Typography variant="h4" align="center" color="primary" className="pb-7" sx={{ fontWeight: 700 }}>KLEARSPLIT</Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="First Name"
                                required
                                variant="outlined"
                                name="first_name"
                                value={signupInfo.first_name}
                                onChange={(e) => onChange("first_name", e.target.value)}
                                onBlur={(e) => onChange("first_name", e.target.value.trim())}
                                fullWidth
                                error={!!errors.first_name}
                                helperText={errors.first_name}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <TextField
                                label="Last Name"
                                variant="outlined"
                                name="last_name"
                                value={signupInfo.last_name}
                                onChange={(e) => onChange("last_name", e.target.value)}
                                onBlur={(e) => onChange("last_name", e.target.value.trim())}
                                fullWidth
                                error={!!errors.last_name}
                                helperText={errors.last_name}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <TextField
                                label="Email"
                                required
                                disabled={stage === "otp"}
                                variant="outlined"
                                name="email"
                                value={signupInfo.email}
                                onChange={(e) => onChange("email", e.target.value)}
                                onBlur={(e) => onChange("email", e.target.value.trim())}
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            {
                                stage === "otp" && 
                                <div className="mt-4 text-right">
                                    <p onClick={handleWrongEmail} className="text-blue-600 hover:underline hover:cursor-pointer">
                                        Wrong Email?
                                    </p>
                                </div>
                            }
                            <TextField
                                label="Phone"
                                variant="outlined"
                                name="phone"
                                value={signupInfo.phone}
                                onChange={(e) => onChange("phone", e.target.value)}
                                onBlur={(e) => onChange("phone", e.target.value.trim())}
                                fullWidth
                                error={!!errors.phone}
                                helperText={errors.phone}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            {
                                stage === 'otp' &&
                                <TextField
                                    required
                                    label="Otp"
                                    variant="outlined"
                                    name="otp"
                                    value={otp}
                                    onChange={onOtpChange}
                                    fullWidth
                                    error={!!errors.otp}
                                    helperText={errors.otp}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            }
                            <Button variant="contained" type="submit" disabled={isSignUpDisabled}>
                                {
                                    stage === "signup" ? "Send Otp" : "REGISTER"
                                }
                            </Button>
                            <div className="flex items-center mt-4">
                                <div className="flex-grow border-t" style={{ border: '1px solid rgba(51, 60, 77, 0.6)' }}></div>
                                <span className="mx-2">OR</span>
                                <div className="flex-grow border-t" style={{ border: '1px solid rgba(51, 60, 77, 0.6)' }}></div>
                            </div>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Google />}
                                sx={{ padding: 2 }}
                                className="mt-4 text-white border-white"
                            onClick={handleGoogleSignup}
                            >
                                Sign in with Google
                            </Button>

                            <div className="mt-4 text-center">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:underline">
                                    Log in
                                </Link>
                            </div>
                        </Stack>
                    </form>
                </div>
                <div className="col-span-5 h-full bg-[#3674B5] rounded-r-lg shadow-2xl md:w-full h-full hidden md:block flex items-center content-center bg-[#3674B5] ">
                    <div className="text-white px-4 py-5 md:px-10 md:py-12 mx-4">
                        <h4 className="mb-4 text-2xl font-semibold">Welcome to KlearSplit!</h4>
                        <p className="text-sm mb-0">
                            Easily manage and split bills with friends and family. Whether you're sharing a meal, an apartment, or travel expenses, our intuitive platform takes the hassle out of dividing costs. Key Features:
                        </p>
                        <ul className="text-sm mb-0 list-disc pl-5">
                            <li>Effortless Bill Splitting: Quickly calculate each person's share.</li>
                            <li>Track Expenses: Keep an organized record of who owes what.</li>
                            <li>Reminders: Never forget to settle up with gentle reminders.</li>
                        </ul>
                        <p className="text-sm mb-0 mt-4">
                            Start enjoying stress-free sharing today!
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RegisterPage
