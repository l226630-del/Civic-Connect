import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

const initialState = {
  departments: [],
  currentDepartment: null,
  isLoading: false,
  error: null,
};


export const getDepartments = createAsyncThunk(
  "departments/getDepartments",
  async (activeOnly = false, { rejectWithValue }) => {
    try {
      const response = await api.get("/departments", {
        params: { activeOnly: activeOnly.toString() },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const getDepartment = createAsyncThunk(
  "departments/getDepartment",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/departments", departmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/departments/${id}`, departmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(getDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(getDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (d) => d._id !== action.payload
        );
      });
  },
});

export const { clearCurrentDepartment, clearError } = departmentsSlice.actions;
export default departmentsSlice.reducer;
