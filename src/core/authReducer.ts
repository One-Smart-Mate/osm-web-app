import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import User from "../data/user/user";

interface AuthState {
  user: User | null;
}

const initState: AuthState = { user: null };
const authSlice = createSlice({
  name: "auth",
  initialState: initState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logOut: (state, _) => {
      state.user = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: any): User => state.auth.user;
