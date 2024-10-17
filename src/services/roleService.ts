import { Role } from "../data/user/user";
import { apiSlice } from "./apiSlice";

export const roleService = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRoles: builder.mutation<Role[], void>({
            query: () => `/roles/all`,
            transformResponse: (response: {data: Role[]}) => response.data
        }),
    })
})

export const {useGetRolesMutation} = roleService