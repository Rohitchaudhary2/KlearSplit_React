import { Google, Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import { Stack, TextField, Button, Typography, InputAdornment, IconButton } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../store/authSlice";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const validateField = (name: string, value: string) => {
        let errorMsg = "";

        switch (name) {
            case "email":
                if (!value) errorMsg = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    errorMsg = "Invalid email format";
                break;
            case "password":
                if(!value) errorMsg = "Password is required";
                break;
        }
        return errorMsg;
    };
    const [isLoginDisabled, setIsLoginDisabled] = useState(true);
    const isValid = !Object.entries(loginInfo).every(([key, value]) => !validateField(key, value));
    useEffect(() => setIsLoginDisabled(isValid), [isValid]);
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        const res = await axios.post("http://localhost:3000/api/auth/login", loginInfo)
        if(!res.data.success) {
            toast.error(res.data.message);
        }
        dispatch(login(res.data.data))
        navigate("/dashboard");
        toast.success(res.data.message);
    }

    const [showPassword, setShowPassword] = useState(false);

    const onChange = (key: string, value: string) => {
        setLoginInfo((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
    }

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <>
            <div className="flex justify-center min-h-screen items-center w-full md:w-6/7 mx-auto grid grid-cols-10 p-10 rounded-sm">
                <div className="md:col-span-5 col-span-10 h-full bg-[#D1F8EF] shadow-2xl rounded-lg md:rounded-l-lg md:rounded-r-none p-6 items-center">
                    <Typography variant="h4" align="center" color="primary" className="pb-7" sx={{ fontWeight: 700 }}>KLEARSPLIT</Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Email"
                                required
                                variant="outlined"
                                name="email"
                                value={loginInfo.email}
                                onChange={(e) => onChange("email", e.target.value.trim())}
                                onBlur={(e) => onChange("email", e.target.value.trim())}
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email}
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
                                sx={{ m: 1 }}
                                variant="outlined"
                                required
                                id="outlined-adornment-password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={loginInfo.password}
                                error={!!errors.password}
                                helperText={errors.password} // Ensure `errors.password` exists
                                onChange={(e) => onChange("password", e.target.value.trim())}
                                onBlur={(e) => onChange("password", e.target.value.trim())}
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={showPassword ? 'hide the password' : 'display the password'}
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    onMouseUp={handleMouseUpPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <div className="mt-4 text-right">
                                <Link to="/register" className="text-blue-600 hover:underline">
                                    Forgot your Password?
                                </Link>
                            </div>
                            <Button variant="contained" type="submit" disabled={isLoginDisabled}>LOGIN</Button>
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
                            // onClick={handleGoogleLogin}
                            >
                                Sign in with Google
                            </Button>

                            <div className="mt-4 text-center">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-400 hover:underline">
                                    Register now
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

export default LoginPage
