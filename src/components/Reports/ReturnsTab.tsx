import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { reportsApi } from "../../api/reports";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Download, CalendarIcon, Loader2, RefreshCw } from "lucide-react";

const COLORS = ['#D4AF37', '#9CA3AF', '#374151', '#FCD34D', '#EF4444']; // Gold, Gray-400, Gray-700, Light Gold, Red (defective)

export default function ReturnsTab() {
    const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>({ rate: 0, totalReturns: 0, returnReasons: [] });

    const fetchReturnsData = async () => {
        try {
            setIsLoading(true);
            const res = await reportsApi.getReturnsReport(); 
            setData(res.data || { rate: 0, totalReturns: 0, returnReasons: [] });
        } catch (error) {
            console.error("Failed to fetch returns data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnsData();
    }, [startDate, endDate]);

    const handleExport = () => {
        reportsApi.downloadCSV("returns", { startDate, endDate });
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scorecards */}
                <div className="space-y-6">
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-6 flex flex-col justify-center items-center h-40">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                            <RefreshCw className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-red-800/70">Overall Return Rate</p>
                        <span className="text-3xl font-bold text-gray-900 mt-1">
                            {data.rate || "0.0"}%
                        </span>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Total Returned Items</span>
                        <span className="text-xl font-bold text-gray-900">{data.totalReturns || 0}</span>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="border border-gray-100 rounded-xl p-6 flex flex-col items-center h-[350px]">
                    <h4 className="text-sm font-semibold text-gray-900 w-full mb-2">Returns by Reason</h4>
                    {isLoading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-gold-500" />
                        </div>
                    ) : data.returnReasons && data.returnReasons.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.returnReasons}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {data.returnReasons.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1f2937', fontWeight: '500' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                            No return data found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
