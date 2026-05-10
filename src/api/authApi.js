import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getMe: build.query({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),

    updateMe: build.mutation({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),

    changePassword: build.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    forgotPassword: build.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPasswordToken: build.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordTokenMutation,
} = authApi;
