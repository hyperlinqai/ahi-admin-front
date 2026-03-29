import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ShoppingBag, IndianRupee, Package, TrendingUp, TrendingDown } from "lucide-react";
import api from "../../api/axios";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    revenueToday: number;
    ordersToday: number;
    newUsersToday: number;
    outOfStockCount: number;
}

function formatRevenue(val: number): string {
    if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)}Cr`;
    if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)}L`;
    if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
}

const KPICards = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/dashboard/stats")
            .then(res => setStats(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card-hover p-5 animate-pulse">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="h-2.5 bg-gray-100 rounded w-20" />
                                <div className="h-7 bg-gray-100 rounded w-28" />
                            </div>
                            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                        </div>
                        <div className="h-4 bg-gray-100 rounded w-32" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = stats
        ? [
              {
                  title: "TOTAL REVENUE",
                  value: formatRevenue(stats.totalRevenue),
                  change:
                      stats.revenueToday > 0
                          ? `+${formatRevenue(stats.revenueToday)} today`
                          : "No sales today",
                  isPositive: stats.revenueToday > 0,
                  icon: IndianRupee,
                  iconBg: "bg-amber-50",
                  iconColor: "text-amber-600",
              },
              {
                  title: "TOTAL ORDERS",
                  value: stats.totalOrders.toLocaleString("en-IN"),
                  change:
                      stats.ordersToday > 0
                          ? `+${stats.ordersToday} today`
                          : "No orders today",
                  isPositive: stats.ordersToday > 0,
                  icon: ShoppingBag,
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-600",
              },
              {
                  title: "TOTAL CUSTOMERS",
                  value: stats.totalUsers.toLocaleString("en-IN"),
                  change:
                      stats.newUsersToday > 0
                          ? `+${stats.newUsersToday} today`
                          : "No new today",
                  isPositive: stats.newUsersToday > 0,
                  icon: Users,
                  iconBg: "bg-emerald-50",
                  iconColor: "text-emerald-600",
              },
              {
                  title: "TOTAL PRODUCTS",
                  value: stats.totalProducts.toLocaleString("en-IN"),
                  change:
                      stats.outOfStockCount > 0
                          ? `${stats.outOfStockCount} out of stock`
                          : "All in stock",
                  isPositive: stats.outOfStockCount === 0,
                  icon: Package,
                  iconBg: "bg-violet-50",
                  iconColor: "text-violet-600",
              },
          ]
        : [];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        className="glass-card-hover p-5"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    {kpi.title}
                                </span>
                                <h3 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">
                                    {kpi.value}
                                </h3>
                            </div>
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.iconBg} transition-transform`}
                            >
                                <Icon
                                    className={`h-[18px] w-[18px] ${kpi.iconColor}`}
                                    strokeWidth={2}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <div
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                                    kpi.isPositive
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-500"
                                }`}
                            >
                                {kpi.isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {kpi.change}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default KPICards;
