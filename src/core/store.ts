import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../services/apiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import genericReducer from "./genericReducer";
import authReducer from "./authReducer";



export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        data: genericReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        // OPTIMIZED: Disable expensive development checks for better performance
        serializableCheck: false, // Disable serializable state check (was taking 500-700ms)
        immutableCheck: false,    // Disable immutable state check in production-like scenarios
    }).concat(apiSlice.middleware),
    devTools: false,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
