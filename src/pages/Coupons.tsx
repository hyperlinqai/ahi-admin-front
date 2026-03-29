import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Clock, CheckCircle2, XCircle, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { getCoupons, deleteCoupon, Coupon } from "../api/coupons";
import { format } from "date-fns";
import toast from "react-hot-toast";
import UsageHistoryModal from "../components/Coupons/UsageHistoryModal";

export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await getCoupons({
                page,
                limit: 10,
                search: search || undefined,
                status: (statusFilter as any) || undefined,
                type: (typeFilter as any) || undefined
            });
            setCoupons(res.data);
            setTotalPages(res.meta.totalPages);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCoupons();
        }, 500);
        return () => clearTimeout(debounce);
    }, [page, search, statusFilter, typeFilter]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this coupon? If it has been used, you should toggle it inactive instead.")) return;
        try {
            await deleteCoupon(id);
            toast.success("Coupon deleted successfully");
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete coupon");
        }
    };

    const getStatusInfo = (coupon: Coupon) => {
        if (!coupon.isActive) return { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle };

        const now = new Date();
        const start = coupon.startDate ? new Date(coupon.startDate) : null;
        const end = coupon.expiresAt ? new Date(coupon.expiresAt) : null;

        if (end && now > end) {
            return { label: "Expired", color: "bg-red-50 text-red-700 border-red-200", icon: Clock };
        }
        if (start && now < start) {
            return { label: "Upcoming", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock };
        }
        return { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 };
    };

    const formatValue = (type: string, value: number) => {
        if (type === "PERCENTAGE") return `${value}%`;
        if (type === "FREE_SHIPPING") return "Free Shipping";
        return `₹${value.toLocaleString()}`; // FLAT
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                        Coupons Management
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Create discount codes, manage automated promotions, and track usage rates.
                    </p>
                </div>
                <Link
                    to="/coupons/new"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                >
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-card mb-6 p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20 focus:border-[#c49a3c]"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-white/50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active Now</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="bg-white/50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20"
                    >
                        <option value="">All Types</option>
                        <option value="FLAT">Flat Amount</option>
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FREE_SHIPPING">Free Shipping</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code & Offer</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limits & Usage</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Validity</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                            Loading coupons...
                                        </div>
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Ticket className="h-5 w-5 text-gray-400" />
                                            </div>
                                            No coupons found matching your criteria.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => {
                                    const statusInfo = getStatusInfo(coupon);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-[#c49a3c]/10 flex items-center justify-center border border-[#c49a3c]/20 shrink-0">
                                                        <Ticket className="h-5 w-5 text-[#c49a3c]" strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 tracking-wide uppercase">{coupon.code}</p>
                                                        <div className="flex gap-2 items-center mt-1">
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-600">
                                                                {coupon.type}
                                                            </span>
                                                            <span className="text-sm font-semibold text-[#c49a3c]">
                                                                {formatValue(coupon.type, coupon.discountValue)} Off
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Total Uses:</span>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCouponId(coupon.id);
                                                                setIsUsageModalOpen(true);
                                                            }}
                                                            className="font-semibold text-gray-900 hover:text-[#c49a3c] transition-colors underline decoration-dotted"
                                                        >
                                                            {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}
                                                        </button>
                                                    </div>
                                                    {coupon.perUserLimit && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-400">Per User:</span>
                                                            <span className="font-medium text-gray-600">{coupon.perUserLimit} max</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-600">
                                                    {coupon.startDate ? format(new Date(coupon.startDate), "MMM d, yyyy") : "Anytime"}
                                                    <span className="mx-1 text-gray-400">&rarr;</span>
                                                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/coupons/${coupon.id}/edit`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Coupon"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Coupon"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isUsageModalOpen && selectedCouponId && (
                <UsageHistoryModal
                    couponId={selectedCouponId}
                    onClose={() => {
                        setIsUsageModalOpen(false);
                        setSelectedCouponId(null);
                    }}
                />
            )}
        </div>
    );
}
