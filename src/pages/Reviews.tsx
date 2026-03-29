import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Star,
    X,
    Check,
    Trash2,
    Loader2,
    Image as ImageIcon,
    ExternalLink,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    getAdminReviews,
    approveReview,
    rejectReview,
    deleteReview,
    type Review,
    type ReviewStatus,
    type ReviewMeta,
} from "../api/reviews";

// ─── Star Rating ────────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
    const starSize = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${starSize} flex-shrink-0 ${
                        i <= rating
                            ? "fill-brand-gold-400 text-brand-gold-400"
                            : "fill-gray-100 text-gray-200"
                    }`}
                />
            ))}
        </span>
    );
}

// ─── Status Badge ────────────────────────────────────────────
const STATUS_CONFIG: Record<ReviewStatus, { bg: string; text: string; border: string; dot: string }> = {
    PENDING:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-400"  },
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
    REJECTED: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    dot: "bg-red-400"    },
};

function StatusBadge({ status }: { status: ReviewStatus }) {
    const c = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {status}
        </span>
    );
}

// ─── Format Helpers ──────────────────────────────────────────
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function truncate(text: string | null | undefined, max: number) {
    if (!text) return "—";
    return text.length > max ? text.slice(0, max) + "…" : text;
}

// ─── Delete Confirm Modal ────────────────────────────────────
function DeleteConfirmModal({
    review,
    onClose,
    onConfirm,
}: {
    review: Review;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = async () => {
        setDeleting(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            // handled by parent
        } finally {
            setDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 mb-4">
                    <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Delete Review?</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    This will permanently delete the review by{" "}
                    <strong className="text-gray-600">{review.user.name || review.user.email}</strong>{" "}
                    for <strong className="text-gray-600">{review.product.title}</strong>. This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-5">
                    <button onClick={onClose} className="btn-outline flex-1 text-xs">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-40 transition-colors"
                    >
                        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Review Detail Modal ─────────────────────────────────────
function ReviewDetailModal({
    review,
    onClose,
    onApprove,
    onReject,
    onDelete,
}: {
    review: Review;
    onClose: () => void;
    onApprove: (r: Review) => Promise<void>;
    onReject: (r: Review) => Promise<void>;
    onDelete: (r: Review) => void;
}) {
    const [acting, setActing] = useState<"approve" | "reject" | null>(null);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    const handleAction = async (type: "approve" | "reject") => {
        setActing(type);
        try {
            if (type === "approve") await onApprove(review);
            else await onReject(review);
            onClose();
        } catch {
            // handled by parent
        } finally {
            setActing(null);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />
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
                        <h2 className="text-base font-bold text-gray-900">Review Detail</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(review.createdAt)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Status */}
                    <StatusBadge status={review.status} />

                    {/* Product */}
                    <div className="glass-card p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Product</p>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">{review.product.title}</p>
                            <a
                                href={`/products/${review.product.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] font-semibold text-brand-gold-600 hover:text-brand-gold-700 transition-colors"
                            >
                                View <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>

                    {/* Reviewer */}
                    <div className="glass-card p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Reviewer</p>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 text-[11px] font-bold text-white flex-shrink-0">
                                {(review.user.name || review.user.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-800">{review.user.name || "—"}</p>
                                <p className="text-[10px] text-gray-400">{review.user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rating & Title */}
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <StarRating rating={review.rating} size="lg" />
                            <span className="text-sm font-bold text-gray-700">{review.rating}/5</span>
                        </div>
                        {review.title && (
                            <p className="text-sm font-semibold text-gray-800 mb-2">{review.title}</p>
                        )}
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {review.body || <span className="italic text-gray-300">No review text provided.</span>}
                        </p>
                    </div>

                    {/* Images */}
                    {review.images.length > 0 && (
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Photos ({review.images.length})
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {review.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setLightboxImg(img.url)}
                                        className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 hover:border-brand-gold-300 transition-colors"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0 space-y-2">
                    {review.status !== "APPROVED" && (
                        <button
                            onClick={() => handleAction("approve")}
                            disabled={acting !== null}
                            className="btn-primary w-full text-xs disabled:opacity-40"
                        >
                            {acting === "approve" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <ThumbsUp className="h-3.5 w-3.5" />
                            )}
                            Approve Review
                        </button>
                    )}
                    {review.status !== "REJECTED" && (
                        <button
                            onClick={() => handleAction("reject")}
                            disabled={acting !== null}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                        >
                            {acting === "reject" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <ThumbsDown className="h-3.5 w-3.5" />
                            )}
                            Reject Review
                        </button>
                    )}
                    <button
                        onClick={() => { onClose(); onDelete(review); }}
                        className="btn-outline w-full text-xs text-red-500 border-red-200 hover:bg-red-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Review
                    </button>
                </div>
            </motion.div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center"
                        onClick={() => setLightboxImg(null)}
                    >
                        <button
                            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            onClick={() => setLightboxImg(null)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <img
                            src={lightboxImg}
                            alt=""
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Main Reviews Page ───────────────────────────────────────
export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [meta, setMeta] = useState<ReviewMeta>({ totalCount: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | "">("");
    const [search, setSearch] = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    // Modals
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

    const fetchReviews = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const res = await getAdminReviews({
                    page,
                    limit: 10,
                    status: statusFilter || undefined,
                    search: search || undefined,
                });
                setReviews(res.reviews);
                setMeta(res.meta);
            } catch {
                setReviews([]);
            } finally {
                setLoading(false);
            }
        },
        [statusFilter, search]
    );

    useEffect(() => {
        fetchReviews(1);
    }, [fetchReviews]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchReviews(1), 500);
    };

    // Optimistic state updater
    const updateReviewStatus = (id: string, status: ReviewStatus) => {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        // if filtering by a specific status, remove the row after update
        if (statusFilter && statusFilter !== status) {
            setReviews((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const handleApprove = async (review: Review) => {
        try {
            await approveReview(review.productId, review.id);
            updateReviewStatus(review.id, "APPROVED");
            toast.success("Review approved");
        } catch {
            toast.error("Failed to approve review");
            throw new Error();
        }
    };

    const handleReject = async (review: Review) => {
        try {
            await rejectReview(review.productId, review.id);
            updateReviewStatus(review.id, "REJECTED");
            toast.success("Review rejected");
        } catch {
            toast.error("Failed to reject review");
            throw new Error();
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteReview(deleteTarget.productId, deleteTarget.id);
            setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            setMeta((m) => ({ ...m, totalCount: Math.max(0, m.totalCount - 1) }));
            toast.success("Review deleted");
        } catch {
            toast.error("Failed to delete review");
            throw new Error();
        }
    };

    const totalPages = meta.totalPages || Math.ceil(meta.totalCount / meta.limit);

    const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

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
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                {pendingCount} pending
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {meta.totalCount} review{meta.totalCount !== 1 ? "s" : ""}
                        {statusFilter ? ` · ${statusFilter.toLowerCase()}` : ""}
                    </p>
                </div>
                <button
                    onClick={() => fetchReviews(meta.page)}
                    className="btn-outline text-xs"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by product or reviewer name..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {(["", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 text-[11px] font-semibold transition-colors border-r border-gray-100 last:border-0 ${
                                    statusFilter === s
                                        ? s === ""
                                            ? "bg-gray-800 text-white"
                                            : s === "PENDING"
                                            ? "bg-amber-500 text-white"
                                            : s === "APPROVED"
                                            ? "bg-emerald-500 text-white"
                                            : "bg-red-500 text-white"
                                        : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {(search || statusFilter) && (
                        <button
                            onClick={() => { setSearch(""); setStatusFilter(""); }}
                            className="text-[10px] font-semibold text-red-400 hover:text-red-500 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Reviewer</th>
                                <th className="px-5 py-3">Rating</th>
                                <th className="px-5 py-3">Review</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-300 mx-auto" />
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-xs text-gray-300">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <ReviewRow
                                        key={review.id}
                                        review={review}
                                        onOpen={() => setSelectedReview(review)}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onDelete={() => setDeleteTarget(review)}
                                    />
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
                                onClick={() => fetchReviews(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (meta.page <= 3) pageNum = i + 1;
                                else if (meta.page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = meta.page - 2 + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => fetchReviews(pageNum)}
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${
                                            meta.page === pageNum
                                                ? "bg-brand-gold-500 text-white shadow-sm"
                                                : "border border-gray-200 bg-white text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => fetchReviews(meta.page + 1)}
                                disabled={meta.page >= totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {selectedReview && (
                    <ReviewDetailModal
                        review={selectedReview}
                        onClose={() => setSelectedReview(null)}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={(r) => { setSelectedReview(null); setDeleteTarget(r); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteTarget && (
                    <DeleteConfirmModal
                        review={deleteTarget}
                        onClose={() => setDeleteTarget(null)}
                        onConfirm={handleDelete}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Review Row (extracted to keep parent clean) ─────────────
function ReviewRow({
    review,
    onOpen,
    onApprove,
    onReject,
    onDelete,
}: {
    review: Review;
    onOpen: () => void;
    onApprove: (r: Review) => Promise<void>;
    onReject: (r: Review) => Promise<void>;
    onDelete: () => void;
}) {
    const [acting, setActing] = useState<"approve" | "reject" | null>(null);

    const handleAction = async (type: "approve" | "reject", e: React.MouseEvent) => {
        e.stopPropagation();
        setActing(type);
        try {
            if (type === "approve") await onApprove(review);
            else await onReject(review);
        } finally {
            setActing(null);
        }
    };

    return (
        <tr
            onClick={onOpen}
            className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
        >
            <td className="px-5 py-3.5 text-xs font-semibold text-gray-800 max-w-[180px]">
                <span className="truncate block">{review.product.title}</span>
            </td>
            <td className="px-5 py-3.5">
                <p className="text-xs font-medium text-gray-800">{review.user.name || "—"}</p>
                <p className="text-[10px] text-gray-400">{review.user.email}</p>
            </td>
            <td className="px-5 py-3.5">
                <StarRating rating={review.rating} />
            </td>
            <td className="px-5 py-3.5 max-w-[220px]">
                {review.title && (
                    <p className="text-xs font-semibold text-gray-700 truncate">{review.title}</p>
                )}
                <p className="text-[11px] text-gray-400 truncate">{truncate(review.body, 60)}</p>
                {review.images.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <ImageIcon className="h-2.5 w-2.5" />
                        {review.images.length} photo{review.images.length > 1 ? "s" : ""}
                    </span>
                )}
            </td>
            <td className="px-5 py-3.5">
                <StatusBadge status={review.status} />
            </td>
            <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                {formatDate(review.createdAt)}
            </td>
            <td className="px-5 py-3.5">
                <div
                    className="flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {review.status !== "APPROVED" && (
                        <button
                            onClick={(e) => handleAction("approve", e)}
                            disabled={acting !== null}
                            title="Approve"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                        >
                            {acting === "approve" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Check className="h-3.5 w-3.5" />
                            )}
                        </button>
                    )}
                    {review.status !== "REJECTED" && (
                        <button
                            onClick={(e) => handleAction("reject", e)}
                            disabled={acting !== null}
                            title="Reject"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                        >
                            {acting === "reject" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <X className="h-3.5 w-3.5" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        title="Delete"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
