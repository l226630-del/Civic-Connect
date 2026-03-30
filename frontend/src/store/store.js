import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import issuesReducer from "@/features/issues/issuesSlice";
import departmentsReducer from "@/features/departments/departmentsSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issuesReducer,
    departments: departmentsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
