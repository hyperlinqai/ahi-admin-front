import React, { useEffect, useState } from "react";
import { 
    ShoppingBag, 
    Clock, 
    User, 
    Mail, 
    Phone, 
    ExternalLink, 
    AlertCircle,
    TrendingDown,
    IndianRupee
} from "lucide-react";
import api from "../../api/axios";

interface Item {
    name: string;
    variant: string;
    quantity: number;
    price: number;
}

interface AbandonedRecord {
    id: string;
    type: "CART" | "ORDER";
    orderNumber?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    itemCount: number;
    totalValue: number;
    items: Item[];
    lastActive: string;
    createdAt: string;
}

interface AbandonedData {
    abandonedOrders: AbandonedRecord[];
    abandonedCarts: AbandonedRecord[];
    summary: {
        totalAbandonedOrders: number;
        totalAbandonedCarts: number;
        potentialRevenue: number;
    };
}

export default function AbandonedCheckoutsTab() {
    const [data, setData] = useState<AbandonedData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/abandoned-checkouts")
            .then(res => setData(res.data.data))
            .catch(err => console.error("Failed to fetch abandoned checkouts:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="py-20 text-center text-gray-400">Loading abandoned checkouts...</div>;
    if (!data) return <div className="py-20 text-center text-gray-400">Failed to load data.</div>;

    const allRecords = [...data.abandonedOrders, ...data.abandonedCarts].sort(
        (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Abandoned</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-gray-900">{allRecords.length}</h3>
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Abandoned Orders</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-gray-900">{data.summary.totalAbandonedOrders}</h3>
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Potential Revenue</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-gray-900">₹{data.summary.potentialRevenue.toLocaleString()}</h3>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <IndianRupee className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="text-sm font-bold text-gray-900">Recent Abandoned Checkouts</h3>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50 text-[10px] font-bold text-orange-600 border border-orange-100 uppercase tracking-tight">
                            <ShoppingBag className="w-3 h-3" /> Orders: {data.summary.totalAbandonedOrders}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-tight">
                            <User className="w-3 h-3" /> Carts: {data.summary.totalAbandonedCarts}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Items Left</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Active</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                                            record.type === "ORDER" 
                                            ? "bg-orange-50 text-orange-600 border border-orange-100" 
                                            : "bg-blue-50 text-blue-600 border border-blue-100"
                                        }`}>
                                            {record.type}
                                        </div>
                                        {record.orderNumber && (
                                            <p className="text-[10px] text-gray-400 mt-1 font-mono">#{record.orderNumber}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[13px] font-bold text-gray-900">{record.customerName}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Mail className="w-3 h-3" /> {record.customerEmail}
                                                </div>
                                                {record.customerPhone !== "N/A" && (
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                                        <Phone className="w-3 h-3" /> {record.customerPhone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-medium text-gray-700">{record.itemCount} items</span>
                                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-[200px]">
                                                {record.items.map(i => i.name).join(", ")}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[13px] font-bold text-gray-900">₹{record.totalValue.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(record.lastActive).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-brand-gold-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {allRecords.length === 0 && (
                    <div className="py-20 text-center text-gray-400 bg-gray-50/20">
                        <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        No abandoned checkouts found.
                    </div>
                )}
            </div>
        </div>
    );
}
