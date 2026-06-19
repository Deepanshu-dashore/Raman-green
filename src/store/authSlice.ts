import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, put, del } from "@/lib/axios";

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: 'customer' | 'admin';
  image?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunk to fetch the current user profile (using me API)
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<User>("/api/auth/me");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch profile");
    }
  }
);

// Async thunk to handle login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await post<{ user: User; token: string }>("/api/auth/login", credentials);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

// Async thunk to handle logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await post("/api/auth/logout");
      return null;
    } catch (err: any) {
      return rejectWithValue(err.message || "Logout failed");
    }
  }
);

// Async thunk to update profile details
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: { name: string; email: string; phone: string; image?: string | null }, { rejectWithValue }) => {
    try {
      const response = await put<User>("/api/auth/me", profileData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update profile");
    }
  }
);

// Async thunk to remove profile image
export const removeProfileImage = createAsyncThunk(
  "auth/removeProfileImage",
  async (_, { rejectWithValue }) => {
    try {
      await del("/api/auth/me");
      return null;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to remove profile image");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.initialized = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("rg-user", JSON.stringify(action.payload.user));
        localStorage.setItem("rg-token", action.payload.token);
      }
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.initialized = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("rg-user");
        localStorage.removeItem("rg-token");
        localStorage.removeItem("adminToken");
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.loading = false;
        state.initialized = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("rg-user", JSON.stringify(action.payload));
          (window as any).__auth_initialized = true;
        }
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.initialized = true;
        state.error = action.payload as string;
        if (typeof window !== "undefined") {
          localStorage.removeItem("rg-user");
          localStorage.removeItem("rg-token");
          localStorage.removeItem("adminToken");
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          (window as any).__auth_initialized = true;
        }
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        if (typeof window !== "undefined") {
          localStorage.setItem("rg-user", JSON.stringify(action.payload.user));
          localStorage.setItem("rg-token", action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.initialized = true;
        if (typeof window !== "undefined") {
          localStorage.removeItem("rg-user");
          localStorage.removeItem("rg-token");
          localStorage.removeItem("adminToken");
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.loading = false;
        if (typeof window !== "undefined") {
          localStorage.setItem("rg-user", JSON.stringify(action.payload));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // removeProfileImage
      .addCase(removeProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProfileImage.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.image = null;
          if (typeof window !== "undefined") {
            localStorage.setItem("rg-user", JSON.stringify(state.user));
          }
        }
      })
      .addCase(removeProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
