import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  username: string;
  profileImageUrl?: string;
}

interface AuthState {
  user: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.tokens.accessToken = action.payload.accessToken;
      state.tokens.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      // Redux Persist가 자동으로 localStorage에 저장
    },
    logout: (state) => {
      state.user = null;
      state.tokens.accessToken = null;
      state.tokens.refreshToken = null;
      state.isAuthenticated = false;
      // Redux Persist가 자동으로 localStorage에서 제거
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
