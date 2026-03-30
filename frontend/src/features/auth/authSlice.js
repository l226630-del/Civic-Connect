import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

// Get user from localStorage
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

const initialState = {
    user: user,
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
};


export const register = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post("/auth/register", userData);
            const { data } = response.data;


            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));

            return data;
        } catch (error)
        {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post("/auth/login", credentials);
            const { data } = response.data;


            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));

            return data;
        } catch (error)
        {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


export const getProfile = createAsyncThunk(
    "auth/getProfile",
    async (_, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.get("/auth/profile");
            const { data } = response.data;


            localStorage.setItem("user", JSON.stringify(data));

            return data;
        } catch (error)
        {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (profileData, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.put("/auth/profile", profileData);
            const { data } = response.data;


            localStorage.setItem("user", JSON.stringify(data));

            return data;
        } catch (error)
        {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


export const uploadProfilePhoto = createAsyncThunk(
    "auth/uploadProfilePhoto",
    async (formData, { rejectWithValue }) =>
    {
        try
        {
            const response = await api.post("/auth/profile/photo", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.data;
        } catch (error)
        {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) =>
        {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        clearError: (state) =>
        {
            state.error = null;
        },
    },
    extraReducers: (builder) =>
    {
        builder

            .addCase(register.pending, (state) =>
            {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) =>
            {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) =>
            {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(login.pending, (state) =>
            {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) =>
            {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) =>
            {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(getProfile.pending, (state) =>
            {
                state.isLoading = true;
            })
            .addCase(getProfile.fulfilled, (state, action) =>
            {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(getProfile.rejected, (state, action) =>
            {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(updateProfile.pending, (state) =>
            {
                state.isLoading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) =>
            {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) =>
            {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(uploadProfilePhoto.fulfilled, (state, action) =>
            {
                if (state.user)
                {
                    state.user.profilePhoto = action.payload.profilePhoto;
                    localStorage.setItem("user", JSON.stringify(state.user));
                }
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
