import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

const initialState = {
  issues: [],
  currentIssue: null,
  myIssues: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    category: "",
    status: "",
    department: "",
    search: "",
  },
  isLoading: false,
  error: null,
};


export const getIssues = createAsyncThunk(
  "issues/getIssues",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/issues", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const getIssue = createAsyncThunk(
  "issues/getIssue",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const createIssue = createAsyncThunk(
  "issues/createIssue",
  async (formData, { rejectWithValue }) => {
    try {
      
      const response = await api.post("/issues", formData, {
        transformRequest: [(data) => data],
        headers: {},
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const deleteIssue = createAsyncThunk(
  "issues/deleteIssue",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/issues/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const toggleUpvote = createAsyncThunk(
  "issues/toggleUpvote",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issues/${id}/upvote`);
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const updateIssueStatus = createAsyncThunk(
  "issues/updateIssueStatus",
  async ({ id, status, department }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/issues/${id}/status`, {
        status,
        department,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const getMyIssues = createAsyncThunk(
  "issues/getMyIssues",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/issues/user/my-issues", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const updateIssue = createAsyncThunk(
  "issues/updateIssue",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/issues/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(getIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentIssue = action.payload;
      })
      .addCase(getIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues.unshift(action.payload);
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteIssue.fulfilled, (state, action) => {
        state.issues = state.issues.filter(
          (issue) => issue._id !== action.payload
        );
        state.myIssues = state.myIssues.filter(
          (issue) => issue._id !== action.payload
        );
      })
      
      .addCase(toggleUpvote.fulfilled, (state, action) => {
        const { id, upvoteCount, hasUpvoted } = action.payload;
        const updateIssue = (issue) => {
          if (issue._id === id) {
            return {
              ...issue,
              upvoteCount,
              upvotes: hasUpvoted
                ? [...(issue.upvotes || []), "current-user"]
                : (issue.upvotes || []).filter((u) => u !== "current-user"),
            };
          }
          return issue;
        };
        state.issues = state.issues.map(updateIssue);
        if (state.currentIssue?._id === id) {
          state.currentIssue = updateIssue(state.currentIssue);
        }
      })
      
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const updatedIssue = action.payload;
        state.issues = state.issues.map((issue) =>
          issue._id === updatedIssue._id ? updatedIssue : issue
        );
        if (state.currentIssue?._id === updatedIssue._id) {
          state.currentIssue = updatedIssue;
        }
      })
      
      .addCase(getMyIssues.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myIssues = action.payload.data;
      })
      .addCase(getMyIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedIssue = action.payload;
        state.issues = state.issues.map((issue) =>
          issue._id === updatedIssue._id ? updatedIssue : issue
        );
        state.myIssues = state.myIssues.map((issue) =>
          issue._id === updatedIssue._id ? updatedIssue : issue
        );
        if (state.currentIssue?._id === updatedIssue._id) {
          state.currentIssue = updatedIssue;
        }
      })
      .addCase(updateIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentIssue, clearError } =
  issuesSlice.actions;
export default issuesSlice.reducer;
