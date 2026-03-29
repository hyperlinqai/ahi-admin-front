import api from "./axios";

export const reportsApi = {
    getSalesReport: async (params: { startDate: string; endDate: string; groupBy: "day" | "week" | "month" }) => {
        const response = await api.get("/admin/reports/sales", { params });
        return response.data;
    },
    
    getInventoryReport: async () => {
        const response = await api.get("/admin/reports/inventory");
        return response.data;
    },

    getCustomersReport: async () => {
        const response = await api.get("/admin/reports/customers");
        return response.data;
    },

    getReturnsReport: async () => {
        const response = await api.get("/admin/reports/returns");
        return response.data;
    },

    downloadCSV: (endpoint: string, params?: Record<string, string>) => {
        const urlParams = new URLSearchParams();
        urlParams.append("format", "csv");
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) urlParams.append(key, value);
            });
        }
        
        // Use standard window.open to prompt download - assuming token isn't strictly needed for CSV GET
        // If JWT is required for CSV download, a fetch Blob approach is needed instead.
        // Let's implement fetch Blob approach to be safe with JWT auth
        const token = localStorage.getItem("accessToken");
        
        const fullUrl = `${api.defaults.baseURL}/admin/reports/${endpoint}?${urlParams.toString()}`;
        
        return fetch(fullUrl, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `${endpoint}-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }
};
