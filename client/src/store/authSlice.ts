import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Authstate {
    user: User | null;
    isAuthenticated: boolean
}

const initialState: Authstate = {
    user: null,
    isAuthenticated: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state = {
                user: action.payload,
                isAuthenticated: true
            }
        },
        logout: (state) => {
            state = {
                user: null,
                isAuthenticated: false
            }
        }
    }
})

export const { login, logout } = authSlice.actions;

export default authSlice.reducer
