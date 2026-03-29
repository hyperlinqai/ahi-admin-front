import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import api from "../../api/axios";

type Period = "monthly" | "quarterly" | "yearly";

interface ChartPoint {
    name: string;
    revenue: number;
}

export const SalesOverview = () => {
    const [period, setPeriod] = useState<Period>("monthly");
    const [data, setData] = useState<ChartPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/admin/dashboard/revenue-chart?period=${period}`)
            .then(res => setData(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [period]);

    const periodLabels: Record<Period, string> = {
        monthly: "Monthly",
        quarterly: "Quarterly",
        yearly: "Yearly",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 lg:col-span-2 glass-card p-6"
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Revenue Overview</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {period === "monthly" ? "This year by month" :
                         period === "quarterly" ? "This year by quarter" :
                         "Last 5 years"}
                    </p>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {(["monthly", "quarterly", "yearly"] as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                                period === p
                                    ? "bg-white shadow-sm text-gray-900"
                                    : "text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            {periodLabels[p]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[280px] w-full">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-gray-300">No revenue data yet</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d4a853" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                                tickFormatter={(v) =>
                                    v >= 100_000
                                        ? `₹${(v / 100_000).toFixed(1)}L`
                                        : v >= 1_000
                                        ? `₹${(v / 1_000).toFixed(0)}K`
                                        : `₹${v}`
                                }
                            />
                            <Tooltip
                                cursor={{ stroke: "#d4a853", strokeWidth: 1, strokeDasharray: "4 4" }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload as ChartPoint;
                                        const rev = d.revenue;
                                        const formatted =
                                            rev >= 100_000
                                                ? `₹${(rev / 100_000).toFixed(2)}L`
                                                : rev >= 1_000
                                                ? `₹${(rev / 1_000).toFixed(1)}K`
                                                : `₹${rev.toLocaleString("en-IN")}`;
                                        return (
                                            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                    {d.name}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {formatted}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#c49a3c"
                                strokeWidth={2.5}
                                fill="url(#revenueGradient)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#c49a3c", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};
