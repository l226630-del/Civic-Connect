import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) =>
    {
        const token = localStorage.getItem("token");
        if (token)
        {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) =>
    {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) =>
    {
        const message =
            error.response?.data?.message || error.message || "An error occurred";


        if (error.response?.status === 401)
        {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/login")
            {
                window.location.href = "/login";
            }
        }

        return Promise.reject({ ...error, message });
    }
);

export default api;
