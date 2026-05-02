import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://api.ahijewellery.com/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    let token = localStorage.getItem("accessToken");
    
    console.log("🔍 Axios interceptor - Token from localStorage:", token ? "Found" : "Not found");

    // Fallback: Auto-recover the token from Zustand's storage if missing (e.g. user was logged in prior to the fix)
    if (!token) {
        try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                if (parsed?.state?.token) {
                    token = parsed.state.token;
                    localStorage.setItem("accessToken", token as string); // Heal missing token
                    console.log("🔧 Token recovered from auth-storage");
                }
            }
        } catch (e) {
            console.error("Failed to parse auth storage fallback", e);
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Authorization header set (first 30 chars):", token.substring(0, 30) + "...");
    } else {
        console.warn("⚠️ No token available - request will be unauthenticated");
    }
    return config;
});

// Global response interceptor to handle 401 Unauthorized errors (expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("🔒 Token expired or unauthorized. Logging out...");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("auth-storage");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
