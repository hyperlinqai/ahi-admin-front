import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useNotificationStore } from "../store/notificationStore";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Package,
    MapPin,
    CreditCard,
    Truck,
    FileText,
    Loader2,
    RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface OrderItem {
    id: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    product?: { images?: { url: string }[] };
}

interface OrderAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
}

interface OrderPayment {
    id: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    status: string;
}

interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    user: { name: string | null; email: string };
    address: OrderAddress;
    subtotal: number;
    discount: number;
    total: number;
    status: string;
    paymentStatus: string;
    appliedCouponId?: string;
    items?: OrderItem[];
    payment?: OrderPayment;
    awbNumber?: string | null;
    courierName?: string | null;
    trackingStatus?: string | null;
    createdAt: string;
}

interface Meta {
    totalCount: number;
    page: number;
    limit: number;
}

// ─── Status Config ───────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
    CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" },
    PROCESSING: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-400" },
    SHIPPED: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400" },
    DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
    CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-400" },
    RETURNED: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-400" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    PAID: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    FAILED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    REFUNDED: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

// ─── Status Badge Component ────────────────────────────
function StatusBadge({ status, type = "order" }: { status: string; type?: "order" | "payment" }) {
    const config = type === "order"
        ? STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
        : PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            {type === "order" && <span className={`h-1.5 w-1.5 rounded-full ${(config as any).dot}`} />}
            {status}
        </span>
    );
}

// ─── Format Helpers ─────────────────────────────────────
function formatCurrency(val: number) {
    return "₹" + val.toLocaleString("en-IN", { minimumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── Order Detail Drawer ────────────────────────────────
function OrderDetailDrawer({
    order,
    onClose,
    onStatusUpdate,
}: {
    order: Order | null;
    onClose: () => void;
    onStatusUpdate: (id: string, status: string) => void;
}) {
    const [fullOrder, setFullOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        if (!order) return;
        setLoading(true);
        setNewStatus(order.status);
        api.get(`/orders/${order.id}`)
            .then((res) => setFullOrder(res.data.data))
            .catch(() => setFullOrder(order))
            .finally(() => setLoading(false));
    }, [order]);

    const handleStatusChange = async () => {
        if (!fullOrder || newStatus === fullOrder.status) return;
        setUpdatingStatus(true);
        try {
            await api.patch(`/orders/${fullOrder.id}/status`, { status: newStatus });
            onStatusUpdate(fullOrder.id, newStatus);
            setFullOrder({ ...fullOrder, status: newStatus });
            addNotification({
                title: "Status Updated",
                message: `Order ${fullOrder.orderNumber} is now ${newStatus}`,
                type: "success",
            });
        } catch (err: any) {
            addNotification({
                title: "Update Failed",
                message: err.response?.data?.message || "Failed to update order status",
                type: "error",
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDownloadInvoice = () => {
        if (!fullOrder) return;
        window.open(`http://localhost:5001/api/v1/orders/${fullOrder.id}/invoice`, "_blank");
    };

    const data = fullOrder || order;
    if (!data) return null;

    return (
        <AnimatePresence>
            {order && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Order {data.orderNumber}</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(data.createdAt)}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Status + Actions */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <StatusBadge status={data.status} />
                                    <StatusBadge status={data.paymentStatus} type="payment" />
                                </div>

                                {/* Customer Info */}
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-3 text-gray-400">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Customer & Delivery</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-semibold text-gray-900">{data.address.fullName}</p>
                                        <p className="text-xs text-gray-500">{data.user?.email}</p>
                                        <p className="text-xs text-gray-500">{data.address.phone}</p>
                                        <p className="text-xs text-gray-400 leading-relaxed mt-2">
                                            {data.address.addressLine1}
                                            {data.address.addressLine2 && `, ${data.address.addressLine2}`}
                                            <br />
                                            {data.address.city}, {data.address.state} — {data.address.pincode}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-3 text-gray-400">
                                        <Package className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Items ({data.items?.length || 0})</span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {data.items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                                <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                    {item.product?.images?.[0]?.url ? (
                                                        <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{item.productName}</p>
                                                    <p className="text-[10px] text-gray-400">SKU: {item.sku} · Qty: {item.quantity}</p>
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 flex-shrink-0">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-3 text-gray-400">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Payment</span>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Subtotal</span>
                                            <span className="text-gray-700 font-medium">{formatCurrency(data.subtotal)}</span>
                                        </div>
                                        {data.discount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Discount</span>
                                                <span className="text-emerald-600 font-medium">-{formatCurrency(data.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-gray-100">
                                            <span className="text-gray-900 font-bold">Total</span>
                                            <span className="text-gray-900 font-bold">{formatCurrency(data.total)}</span>
                                        </div>
                                        {data.payment && (
                                            <>
                                                <div className="flex justify-between pt-2 border-t border-gray-50">
                                                    <span className="text-gray-400">Method</span>
                                                    <span className="text-gray-600">Razorpay</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Transaction ID</span>
                                                    <span className="text-gray-600 font-mono text-[10px]">
                                                        {data.payment.razorpayPaymentId || "—"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Payment Status</span>
                                                    <StatusBadge status={data.payment.status} type="payment" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-3 text-gray-400">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Update Status</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                                        >
                                            {ALL_STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleStatusChange}
                                            disabled={updatingStatus || newStatus === data.status}
                                            className="btn-primary disabled:opacity-40 text-xs px-4"
                                        >
                                            {updatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update"}
                                        </button>
                                    </div>
                                </div>
                                {/* Shipment & Tracking */}
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-3 text-gray-400">
                                        <Package className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Shipment & Tracking</span>
                                    </div>
                                    {data.awbNumber ? (
                                         <div className="space-y-2 text-xs">
                                             <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                                 <span className="text-gray-500 font-semibold">Tracking Number</span>
                                                 <span className="font-mono text-indigo-600 font-bold tracking-wide">{data.awbNumber}</span>
                                             </div>
                                             <div className="flex justify-between">
                                                <span className="text-gray-400">Courier</span>
                                                <span className="text-gray-700 font-medium">{data.courierName || "Xpressbees"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Live Status</span>
                                                <span className="text-gray-900 font-bold capitalize">{data.trackingStatus || "In Transit"}</span>
                                            </div>
                                         </div>
                                    ) : (
                                         <div className="text-center py-2">
                                             <button
                                                 onClick={async () => {
                                                     try {
                                                         setUpdatingStatus(true);
                                                         const res = await api.post(`/shipment/${data.id}/create`);
                                                         const updated = res.data.data;
                                                         setFullOrder(updated);
                                                         addNotification({
                                                             title: "Shipment Generated",
                                                             message: `AWB ${updated.awbNumber} created for Order ${data.orderNumber}`,
                                                             type: "success",
                                                         });
                                                     } catch (err: any) {
                                                         const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
                                                         addNotification({
                                                             title: "Shipment Failed",
                                                             message: errorMsg,
                                                             type: "error",
                                                         });
                                                     } finally {
                                                         setUpdatingStatus(false);
                                                     }
                                                 }}
                                                 disabled={updatingStatus || data.status === 'CANCELLED'}
                                                 className="btn-outline w-full text-xs font-semibold uppercase tracking-wider text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                             >
                                                 {updatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Generate Xpressbees Shipment"}
                                             </button>
                                             <p className="text-[10px] text-gray-400 mt-2">Creates a live AWB and updates the order status natively.</p>
                                         </div>
                                    )}
                                </div>

                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
                            <button
                                onClick={handleDownloadInvoice}
                                className="btn-outline w-full text-xs"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Download Invoice
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Main Orders Page ───────────────────────────────────
export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [meta, setMeta] = useState<Meta>({ totalCount: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const fetchOrders = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: any = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;

            const res = await api.get("/orders", { params });
            const data = res.data.data;
            setOrders(data.orders);
            setMeta(data.meta);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    // Client-side search filtering (backend doesn't support orderNumber search)
    const filteredOrders = search
        ? orders.filter(
            (o) =>
                o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                (o.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
                o.user?.email.toLowerCase().includes(search.toLowerCase())
        )
        : orders;

    const totalPages = Math.ceil(meta.totalCount / meta.limit);

    const handleStatusUpdate = (id: string, newStatus: string) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
        >
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {meta.totalCount} total order{meta.totalCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => fetchOrders(meta.page)}
                    className="btn-outline text-xs"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </button>
            </div>

            {/* Filters Bar */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by order number or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs text-gray-600 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            {ALL_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date From */}
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-xs text-gray-600 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                        title="From date"
                    />
                    <span className="text-[10px] text-gray-300 font-medium">to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-xs text-gray-600 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                        title="To date"
                    />

                    {/* Clear Filters */}
                    {(search || statusFilter || dateFrom || dateTo) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                                setDateFrom("");
                                setDateTo("");
                            }}
                            className="text-[10px] font-semibold text-red-400 hover:text-red-500 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3 text-center">Items</th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3">Payment</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-300 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-xs text-gray-300">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-xs font-semibold text-brand-gold-600">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-xs font-medium text-gray-800">{order.user?.name || "—"}</p>
                                            <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-center text-xs text-gray-500">
                                            {order.items?.length || "—"}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-xs font-semibold text-gray-900">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={order.paymentStatus} type="payment" />
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400">
                            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.totalCount)} of {meta.totalCount}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => fetchOrders(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (meta.page <= 3) {
                                    pageNum = i + 1;
                                } else if (meta.page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = meta.page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => fetchOrders(pageNum)}
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${meta.page === pageNum
                                                ? "bg-brand-gold-500 text-white shadow-sm"
                                                : "border border-gray-200 bg-white text-gray-500 hover:text-gray-800"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => fetchOrders(meta.page + 1)}
                                disabled={meta.page >= totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Drawer */}
            <OrderDetailDrawer
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={handleStatusUpdate}
            />
        </motion.div>
    );
}
