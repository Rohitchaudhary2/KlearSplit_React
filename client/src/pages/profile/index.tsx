import { Box, Button, ButtonGroup, Divider, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { Avatar } from '@mui/joy';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff } from "@mui/icons-material";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [profileInfo, setProfileInfo] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [passwordsError, setPasswordErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const [isSaveChangesDisabled, setIsSaveChangesDisabled] = useState(true);
    const [isChangePasswordDisabled, setIsChangePasswordDisabled] = useState(true);
    const onChange = (key: string, value: string) => {
        setProfileInfo((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
    }
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const validatePasswordField = (key: string, value: string) => {
        if (!value) return "This Field is required";
        switch (key) {
            case "newPassword":
                if (value.length < 8) return "Must be at least 8 characters";
                else if (value.length > 20) return "Must not be greater than 20 characters";
                break;
            case "confirmPassword":
                if(passwords.newPassword !== value) return "Passwords do not match"
        }
        return "";
    };
    const onPasswordChange = (key: string, value: string) => {
        setPasswords((prev) => ({ ...prev, [key]: value }));
        setPasswordErrors((prev) => ({ ...prev, [key]: validatePasswordField(key, value) }));
    }
    const handleClickShowPassword = (key: ("currentPassword" | "newPassword" | "confirmPassword")) => setShowPassword((prev) => ({...prev, [key]: !showPassword[key]}));
    useEffect(() => {
        const isValid = !Object.entries(passwords).every(([key, value]) => !validatePasswordField(key, value));
        setIsChangePasswordDisabled(isValid);
    }, [passwordsError])
    useEffect(() => {
        const isValid = !Object.entries(profileInfo).every(([key, value]) => !validateField(key, value));
        setIsSaveChangesDisabled(isValid);
    }, [errors])
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
        }

        return errorMsg;
    };
    const handleViewChange = (view: string) => setActiveTab(view);
    return (
        <Box className="flex flex-col min-h-[89vh] justify-center items-center content-center">
            <Paper square sx={{ borderRadius: "4px 4px 4px 4px" }} className="flex flex-col h-full md:h-6/7 w-full md:w-5/7" elevation={5}>
                <Box className="w-full bg-[#3674B5] p-2" sx={{ borderRadius: "4px 4px 0 0" }}>
                    <Typography variant="h6" fontWeight={700} color="white" textAlign="center">
                        Manage Account
                    </Typography>
                </Box>
                <Box className="w-full self-start rounded p-3">
                    <ButtonGroup variant="outlined" className="grid" aria-label="Basic button group">
                        <Button onClick={() => handleViewChange("profile")} variant={activeTab === "profile" ? "contained" : "outlined"}
                            sx={{ borderRadius: "4px 0px 0px 0px" }}
                        >Edit Profile</Button>
                        < Button onClick={() => handleViewChange("password")} variant={activeTab === "password" ? "contained" : "outlined"}
                            sx={{ borderRadius: "0px 4px 0px 0px" }}
                        >
                            Change Password
                        </Button>
                    </ButtonGroup>
                    <Divider />
                </Box>
                {
                    activeTab === "profile"
                        ?
                        <Box className="grow min-h-100 h-full overflow-auto px-3 pb-3 flex flex-col gap-4 justify-center items-center">
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" sx={{ height: 100, width: 100 }} />
                            <Box className="flex gap-3 w-full">
                                <TextField
                                    label="First Name"
                                    required
                                    variant="outlined"
                                    name="first_name"
                                    value={profileInfo.first_name}
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
                                    value={profileInfo.last_name}
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
                            </Box>
                            <TextField
                                label="Email"
                                required
                                variant="outlined"
                                name="email"
                                value={profileInfo.email}
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
                            <TextField
                                label="Phone"
                                variant="outlined"
                                name="phone"
                                value={profileInfo.phone}
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
                            <Button className="self-end" variant="contained" type="submit" disabled={isSaveChangesDisabled}>
                                Save Changes
                            </Button>
                        </Box>
                        :
                        <Box className="grow px-3 pb-3 flex flex-col gap-4 justify-start items-center h-100">
                            <TextField
                                sx={{ m: 1 }}
                                variant="outlined"
                                required
                                id="outlined-adornment-password"
                                label="Current Password"
                                type={showPassword.currentPassword ? 'text' : 'password'}
                                value={passwords.currentPassword}
                                error={!!passwordsError.currentPassword}
                                helperText={passwordsError.currentPassword} // Ensure `errors.password` exists
                                onChange={(e) => onPasswordChange("currentPassword", e.target.value.trim())}
                                onBlur={(e) => onPasswordChange("currentPassword", e.target.value.trim())}
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
                                                    aria-label={showPassword.currentPassword ? 'hide the password' : 'display the password'}
                                                    onClick={() => handleClickShowPassword("currentPassword")}
                                                    onMouseDown={handleMouseDownPassword}
                                                    onMouseUp={handleMouseUpPassword}
                                                    edge="end"
                                                >
                                                    {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                            <TextField
                                sx={{ m: 1 }}
                                variant="outlined"
                                required
                                id="outlined-adornment-password"
                                label="New Password"
                                type={showPassword.newPassword ? 'text' : 'password'}
                                value={passwords.newPassword}
                                error={!!passwordsError.newPassword}
                                helperText={passwordsError.newPassword} // Ensure `errors.password` exists
                                onChange={(e) => onPasswordChange("newPassword", e.target.value.trim())}
                                onBlur={(e) => onPasswordChange("newPassword", e.target.value.trim())}
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
                                                    onClick={() => handleClickShowPassword("newPassword")}
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
                            <TextField
                                sx={{ m: 1 }}
                                variant="outlined"
                                required
                                id="outlined-adornment-password"
                                label="Confirm Password"
                                type={showPassword.confirmPassword ? 'text' : 'password'}
                                value={passwords.confirmPassword}
                                error={!!passwordsError.confirmPassword}
                                helperText={passwordsError.confirmPassword} // Ensure `errors.password` exists
                                onChange={(e) => onPasswordChange("confirmPassword", e.target.value.trim())}
                                onBlur={(e) => onPasswordChange("confirmPassword", e.target.value.trim())}
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
                                                    onClick={() => handleClickShowPassword("confirmPassword")}
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
                            <Button className="self-end" variant="contained" type="submit" disabled={isChangePasswordDisabled}>
                                Change Password
                            </Button>
                        </Box>
                }
            </Paper>
        </Box>
    )
}

export default Profile