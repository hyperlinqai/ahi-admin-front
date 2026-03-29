import KPICards from "../components/Dashboard/KPICards";
import { SalesOverview } from "../components/Dashboard/SalesOverview";
import { OrderStatusChart } from "../components/Dashboard/CustomersActive";
import { SalesDataTable } from "../components/Dashboard/SalesDataTable";
import { TopProducts } from "../components/Dashboard/TopProducts";
import { LowStockAlerts } from "../components/Dashboard/LowStockAlerts";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
    const { user } = useAuthStore();
    const currentDate = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
        >
            {/* Welcome Banner */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">{currentDate}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <KPICards />

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <SalesOverview />
                <OrderStatusChart />
            </div>

            {/* Recent Orders */}
            <SalesDataTable />

            {/* Bottom Row: Top Products + Low Stock */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TopProducts />
                <LowStockAlerts />
            </div>
        </motion.div>
    );
}
