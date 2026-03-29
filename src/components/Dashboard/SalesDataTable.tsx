import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface OrderItem {
    productName: string;
    quantity: number;
}

interface RecentOrder {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
    DELIVERED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
    SHIPPED:    "bg-violet-50 text-violet-700 border-violet-200",
    PENDING:    "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED:  "bg-red-50 text-red-700 border-red-200",
    RETURNED:   "bg-gray-50 text-gray-600 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
    DELIVERED: "Delivered",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
};

function formatCurrency(val: number): string {
    if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export const SalesDataTable = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/dashboard/recent-orders")
            .then(res => setOrders(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card flex flex-col overflow-hidden"
        >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Latest customer orders</p>
                </div>
                <button
                    onClick={() => navigate("/orders")}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-gold-500 hover:text-brand-gold-600 transition-colors"
                >
                    View All <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <tr>
                            <th scope="col" className="px-5 py-3">Order ID</th>
                            <th scope="col" className="px-5 py-3">Customer</th>
                            <th scope="col" className="px-5 py-3">Product</th>
                            <th scope="col" className="px-5 py-3">Amount</th>
                            <th scope="col" className="px-5 py-3">Date</th>
                            <th scope="col" className="px-5 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-300 mx-auto" />
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-xs text-gray-300">
                                    No orders yet
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => {
                                const statusStyle =
                                    STATUS_STYLES[order.status] ||
                                    "bg-gray-50 text-gray-600 border-gray-200";
                                const statusLabel =
                                    STATUS_LABELS[order.status] || order.status;
                                const firstItem = order.items?.[0]?.productName || "—";
                                const moreItems =
                                    order.items?.length > 1
                                        ? ` +${order.items.length - 1} more`
                                        : "";
                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        <td className="px-5 py-3.5 text-xs font-semibold text-brand-gold-600">
                                            {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs font-medium text-gray-800">
                                            {order.user?.name || "—"}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px]">
                                            <span className="truncate block">{firstItem}</span>
                                            {moreItems && (
                                                <span className="text-[10px] text-gray-400">{moreItems}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs font-semibold text-gray-900">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusStyle}`}
                                            >
                                                {statusLabel}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
