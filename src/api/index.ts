export { default as api } from "./axios";
export * from "./coupons";
export * from "./inventory";
export * from "./reports";
export * from "./returns";
export * from "./reviews";
export * from "./settings";

/** Relative paths under `/api/v1` for admin UI. */
export const adminEndpoints = {
    dashboard: {
        stats: "/admin/dashboard/stats",
        recentOrders: "/admin/dashboard/recent-orders",
        topProducts: "/admin/dashboard/top-products",
        revenueChart: "/admin/dashboard/revenue-chart",
    },
    reports: {
        sales: "/admin/reports/sales",
        inventory: "/admin/reports/inventory",
        customers: "/admin/reports/customers",
        returns: "/admin/reports/returns",
    },
    abandonedCheckouts: "/admin/abandoned-checkouts",
    auditLogs: "/admin/audit-logs",
    adminReviews: "/admin/reviews",
    settings: "/admin/settings",
    products: "/products",
    categories: "/categories",
    orders: "/orders",
    users: "/users",
    banners: "/banners",
    pages: "/pages",
    shipment: (id: string) => `/shipment/${id}/create`,
} as const;
