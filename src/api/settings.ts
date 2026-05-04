import api from "./axios";

export const settingsApi = {
    getSettings: async () => {
        const response = await api.get("/admin/settings");
        return response.data;
    },

    updateSettings: async (settingsData: any) => {
        const response = await api.put("/admin/settings", settingsData);
        return response.data;
    },

    uploadLogo: async (file: File) => {
        const formData = new FormData();
        formData.append("logo", file);
        const response = await api.post("/admin/settings/logo", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }
};
