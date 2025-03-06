import { Email, Google, Lock, Person, Phone } from "@mui/icons-material";
import { Stack, TextField, Button, Typography, InputAdornment } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const RegisterPage = () => {
    const [signupInfo, setSignupInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [stage, setStage] = useState("signup");
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        otp: ''
    });
    const [isSignUpDisabled, setIsSignUpDisabled] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Otp verified');
    }

    const onChange = (key: string, value: string) => {
        setSignupInfo({...signupInfo, [key]: value});
    }
    
    return (
        <>
            <div className="flex justify-center min-h-screen items-center w-full md:w-6/7 mx-auto grid grid-cols-10 p-10 rounded-sm">
                <div className="md:col-span-5 col-span-10 h-full bg-[#D1F8EF] shadow-2xl rounded-lg md:rounded-l-lg md:rounded-r-none p-6 items-center content-center">
                    <Typography variant="h4" align="center" color="primary" className="pb-7" sx={{ fontWeight: 700 }}>KLEARSPLIT</Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                            label="First Name"
                            required
                            variant="outlined"
                            name="firstName"
                            value={signupInfo.firstName}
                            onChange={(e) => onChange("firstName", e.target.value)}
                            fullWidth
                            error={!!errors.firstName}
                            helperText={errors.firstName}
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
                            name="lastName"
                            value={signupInfo.lastName}
                            onChange={(e) => onChange("lastName", e.target.value)}
                            fullWidth
                            error={!!errors.lastName}
                            helperText={errors.lastName}
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
                            variant="outlined"
                            name="email"
                            value={signupInfo.email}
                            onChange={(e) => onChange("email", e.target.value)}
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
                        <TextField
                            label="Phone"
                            variant="outlined"
                            name="phone"
                            value={signupInfo.phone}
                            onChange={(e) => onChange("phone", e.target.value)}
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
                            // onChange={onChange}
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
                        <Button variant="contained" type="submit" disabled={isSignUpDisabled}>Send Otp</Button>
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
