import { createSlice } from '@reduxjs/toolkit';

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('auth')); } catch { return null; }
})();

const initialState = {
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  isAuthenticated: !!stored?.token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload: { token, user } }) {
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify({ token, user }));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
