import { create } from "zustand";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    read: boolean;
    createdAt: Date;
}

interface NotificationState {
    notifications: Notification[];
    hasNewAlert: boolean;
    addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    unreadCount: () => number;
    clearNewAlert: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    hasNewAlert: false,

    addNotification: (n) => {
        const notification: Notification = {
            ...n,
            id: crypto.randomUUID(),
            read: false,
            createdAt: new Date(),
        };
        set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 50),
            hasNewAlert: true,
        }));

        // Auto-clear the alert flag after animation completes
        setTimeout(() => {
            set({ hasNewAlert: false });
        }, 3000);
    },

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    clearAll: () => set({ notifications: [] }),

    unreadCount: () => get().notifications.filter((n) => !n.read).length,

    clearNewAlert: () => set({ hasNewAlert: false }),
}));
