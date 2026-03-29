import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { reportsApi } from "../../api/reports";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Download, CalendarIcon, Loader2 } from "lucide-react";

// Minimal DatePicker setup using native inputs for simplicity/speed to avoid 
// complex react-date-range popover styling overhead if not strictly required, 
// though we can enhance it if needed.
export default function SalesTab() {
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
    
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });

    const fetchSalesData = async () => {
        try {
            setIsLoading(true);
            const res = await reportsApi.getSalesReport({ startDate, endDate, groupBy });
            setData(res.data?.sales || []);
            setSummary({
                totalRevenue: res.data?.summary?.totalRevenue || 0,
                totalOrders: res.data?.summary?.totalOrders || 0,
            });
        } catch (error) {
            console.error("Failed to fetch sales data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, [startDate, endDate, groupBy]);

    const handleExport = () => {
        reportsApi.downloadCSV("sales", { startDate, endDate, groupBy });
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Filters Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm text-gray-700 outline-none w-[120px]"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm text-gray-700 outline-none w-[120px]"
                        />
                    </div>
                    
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Summary KPI Cards inside Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-brand-gold-50/50 border border-brand-gold-100 rounded-xl p-5">
                    <p className="text-sm font-medium text-brand-gold-800/70">Total Revenue</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(summary.totalRevenue)}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {summary.totalOrders}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[400px] w-full mt-8">
                {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-gold-500" />
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                dy={10}
                            />
                            <YAxis 
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(val) => `₹${val / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                                labelStyle={{ color: '#374151', fontWeight: '500', marginBottom: '4px' }}
                            />
                            <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="revenue" 
                                name="Revenue"
                                stroke="#D4AF37" 
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                        No sales data found for the selected period.
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="mt-8 border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Orders</th>
                            <th className="px-6 py-4 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">{row.date}</td>
                                    <td className="px-6 py-4 text-gray-600 text-right">{row.ordersCount}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium text-right">
                                        {formatCurrency(row.revenue)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
