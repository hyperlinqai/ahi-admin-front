import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { getCouponUsages, CouponUsage } from "../../api/coupons";
import toast from "react-hot-toast";

interface UsageHistoryModalProps {
    couponId: string;
    onClose: () => void;
}

export default function UsageHistoryModal({ couponId, onClose }: UsageHistoryModalProps) {
    const [usages, setUsages] = useState<CouponUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchUsages = async () => {
            try {
                setLoading(true);
                const res = await getCouponUsages(couponId, { page, limit: 10 });
                setUsages(res.data);
                setTotalPages(res.meta.totalPages);
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Failed to load usage history");
            } finally {
                setLoading(false);
            }
        };

        if (couponId) {
            fetchUsages();
        }
    }, [couponId, page]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Coupon Usage History</h2>
                        <p className="text-sm text-gray-500 mt-1">Review all orders where this discount was applied.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : usages.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No usage history found for this coupon.
                        </div>
                    ) : (
                        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Order Ref</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Discount Obtained</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Used On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {usages.map((usage) => (
                                        <tr key={usage.id} className="hover:bg-gray-50/50">
                                            <td className="py-3 px-4">
                                                <p className="text-sm font-medium text-gray-900">{usage.userName}</p>
                                                <p className="text-xs text-gray-500">{usage.userEmail}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    {usage.orderNumber || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-semibold text-emerald-600">
                                                    ₹{usage.discountObtained.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {format(new Date(usage.usedAt), "MMM d, yyyy h:mm a")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
