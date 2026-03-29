import api from "./axios";

export const settingsApi = {
    getSettings: async () => {
        const response = await api.get("/admin/settings");
        return response.data;
    },

    updateSettings: async (settingsData: any) => {
        const response = await api.put("/admin/settings", settingsData);
        return response.data;
    }
};
