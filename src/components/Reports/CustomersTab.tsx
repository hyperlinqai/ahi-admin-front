import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { reportsApi } from "../../api/reports";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Download, CalendarIcon, Loader2, Users } from "lucide-react";

export default function CustomersTab() {
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>({ signups: [], topCustomers: [], totalNew: 0 });

    const fetchCustomersData = async () => {
        try {
            setIsLoading(true);
            const res = await reportsApi.getCustomersReport(); // Add params if backend supports it
            setData(res.data || { signups: [], topCustomers: [], totalNew: 0 });
        } catch (error) {
            console.error("Failed to fetch customers data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomersData();
    }, [startDate, endDate]);

    const handleExport = () => {
        reportsApi.downloadCSV("customers", { startDate, endDate });
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: KPI & Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-brand-gold-50/50 border border-brand-gold-100 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <Users className="w-6 h-6 text-brand-gold-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-gold-800/70">New Signups (Selected Period)</p>
                            <span className="text-2xl font-bold text-gray-900 mt-1 block">
                                {data.totalNew || 0}
                            </span>
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-5 h-[350px]">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Signups Over Time</h4>
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-brand-gold-500" />
                            </div>
                        ) : data.signups && data.signups.length > 0 ? (
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={data.signups} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        name="Signups"
                                        stroke="#D4AF37" 
                                        fillOpacity={1} 
                                        fill="url(#colorSignups)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm pb-10">
                                No signup data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Top Customers Table */}
                <div className="border border-gray-100 rounded-xl flex flex-col items-stretch overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h4 className="text-sm font-semibold text-gray-900">Top Customers (By Spend)</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto w-full">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium text-right">Spend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-gray-400">Loading...</td>
                                    </tr>
                                ) : data.topCustomers && data.topCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-gray-400">No data found.</td>
                                    </tr>
                                ) : (
                                    (data.topCustomers || []).map((customer: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900 truncate max-w-[150px]">{customer.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{customer.email}</p>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 text-right">
                                                ₹{(customer.totalSpend || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
