import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
};


export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const getUnreadCount = createAsyncThunk(
  "notifications/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationIds = [], { rejectWithValue }) => {
    try {
      await api.put("/notifications/read", { notificationIds });
      return notificationIds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.put("/notifications/read-all");
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      .addCase(markAsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        if (ids.length > 0) {
          state.notifications = state.notifications.map((n) =>
            ids.includes(n._id) ? { ...n, read: true } : n
          );
          state.unreadCount = Math.max(0, state.unreadCount - ids.length);
        }
      })
      
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        state.unreadCount = 0;
      })
      
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deleted = state.notifications.find(
          (n) => n._id === action.payload
        );
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload
        );
        if (deleted && !deleted.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
