import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import api from "../../api/axios";

interface StatusBreakdown {
    [key: string]: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    DELIVERED:  { label: "Delivered",  color: "#10b981" },
    PROCESSING: { label: "Processing", color: "#3b82f6" },
    SHIPPED:    { label: "Shipped",    color: "#8b5cf6" },
    PENDING:    { label: "Pending",    color: "#f59e0b" },
    CANCELLED:  { label: "Cancelled",  color: "#ef4444" },
    RETURNED:   { label: "Returned",   color: "#6b7280" },
};

export const OrderStatusChart = () => {
    const [breakdown, setBreakdown] = useState<StatusBreakdown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/dashboard/stats")
            .then(res => setBreakdown(res.data.data?.statusBreakdown || {}))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const chartData = breakdown
        ? Object.entries(breakdown)
              .filter(([, v]) => v > 0)
              .map(([key, value]) => ({
                  name: STATUS_CONFIG[key]?.label || key,
                  value,
                  color: STATUS_CONFIG[key]?.color || "#94a3b8",
              }))
        : [];

    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 flex flex-col"
        >
            <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900">Order Status</h3>
                <p className="text-xs text-gray-400 mt-0.5">Current order breakdown</p>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                </div>
            ) : total === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10">
                    <p className="text-xs text-gray-300">No orders yet</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-[180px] h-[180px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100 text-xs">
                                                        <span className="font-semibold text-gray-900">
                                                            {d.name}
                                                        </span>
                                                        <span className="text-gray-400 ml-2">
                                                            {d.value} orders
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">
                                    {total.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    Total Orders
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                        {chartData.map(item => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                                <span
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-gray-500 truncate">{item.name}</span>
                                <span className="ml-auto font-semibold text-gray-700">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
};
