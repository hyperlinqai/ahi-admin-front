import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    RotateCcw,
    BadgeIndianRupee,
    MapPin,
    Package,
    ImageIcon,
    AlertTriangle,
    CircleDot,
    Banknote,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";
import {
    getReturns,
    getReturnById,
    approveReturn,
    rejectReturn,
    initiateRefund,
    type ReturnListItem,
    type ReturnDetail,
    type ReturnStatus,
    type ReturnMeta,
} from "../api/returns";

// ─── Helpers ────────────────────────────────────────────────
const INR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function fmtDate(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

// ─── Status Config ───────────────────────────────────────────
const STATUS_CONFIG: Record<ReturnStatus, { label: string; bg: string; text: string; border: string; dot: string; icon: React.ElementType }> = {
    PENDING:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-400",  icon: Clock },
    APPROVED: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle2 },
    REJECTED: { label: "Rejected", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    dot: "bg-red-400",    icon: XCircle },
};

function StatusBadge({ status }: { status: ReturnStatus }) {
    const c = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

// ─── Status Timeline ─────────────────────────────────────────
interface TimelineStep {
    label: string;
    sublabel?: string;
    done: boolean;
    active: boolean;
    rejected?: boolean;
}

function StatusTimeline({ ret }: { ret: ReturnDetail }) {
    const isRefunded =
        ret.order.paymentStatus === "REFUNDED" || (ret.order.refunds && ret.order.refunds.length > 0);

    const steps: TimelineStep[] = [
        {
            label: "Return Requested",
            sublabel: fmtDateTime(ret.createdAt),
            done: true,
            active: false,
        },
        {
            label: "Under Review",
            sublabel: ret.status !== "PENDING" ? fmtDateTime(ret.updatedAt) : "Awaiting admin decision",
            done: ret.status !== "PENDING",
            active: ret.status === "PENDING",
        },
        {
            label: ret.status === "REJECTED" ? "Return Rejected" : "Return Approved",
            sublabel:
                ret.status === "PENDING"
                    ? "Pending decision"
                    : ret.status === "REJECTED"
                    ? ret.adminNote || "No note provided"
                    : fmtDateTime(ret.updatedAt),
            done: ret.status !== "PENDING",
            active: false,
            rejected: ret.status === "REJECTED",
        },
        {
            label: "Refund Initiated",
            sublabel: isRefunded
                ? `${INR(ret.order.refunds?.[0]?.amount ?? ret.order.total)} refunded`
                : ret.status === "APPROVED"
                ? "Click 'Initiate Refund' below"
                : "N/A",
            done: isRefunded,
            active: ret.status === "APPROVED" && !isRefunded,
        },
    ];

    return (
        <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-100" />

            <div className="space-y-5">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                        {/* Node */}
                        <div
                            className={`absolute -left-6 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                                step.rejected
                                    ? "border-red-400 bg-red-50"
                                    : step.done
                                    ? "border-emerald-400 bg-emerald-50"
                                    : step.active
                                    ? "border-brand-gold-400 bg-brand-gold-50"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            {step.done && !step.rejected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            )}
                            {step.rejected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            )}
                            {step.active && !step.done && (
                                <div className="h-1.5 w-1.5 rounded-full bg-brand-gold-400 animate-pulse" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p
                                className={`text-xs font-semibold ${
                                    step.rejected
                                        ? "text-red-600"
                                        : step.done
                                        ? "text-gray-800"
                                        : step.active
                                        ? "text-brand-gold-700"
                                        : "text-gray-300"
                                }`}
                            >
                                {step.label}
                            </p>
                            {step.sublabel && (
                                <p className={`text-[10px] mt-0.5 leading-relaxed ${
                                    step.done || step.active ? "text-gray-400" : "text-gray-200"
                                }`}>
                                    {step.sublabel}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Reject Modal ────────────────────────────────────────────
function RejectModal({
    onClose,
    onConfirm,
}: {
    onClose: () => void;
    onConfirm: (note: string) => Promise<void>;
}) {
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleConfirm = async () => {
        if (!note.trim()) { 
            addNotification({ title: "Input Required", message: "Admin note is required", type: "warning" });
            return; 
        }
        setSubmitting(true);
        try { await onConfirm(note.trim()); onClose(); }
        catch { /* handled */ }
        finally { setSubmitting(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center"
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
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Reject Return</h3>
                <p className="text-xs text-gray-400 mt-1">
                    Provide a reason for rejecting this return request. The customer will see this note.
                </p>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Item does not meet return policy conditions, outside return window..."
                    className="mt-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none resize-none"
                    autoFocus
                />
                <div className="flex gap-3 mt-4">
                    <button onClick={onClose} className="btn-outline flex-1 text-xs">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        disabled={submitting || !note.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-40 transition-colors"
                    >
                        {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        Reject
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Detail Drawer ───────────────────────────────────────────
function ReturnDetailDrawer({
    returnId,
    onClose,
    onStatusChange,
}: {
    returnId: string;
    onClose: () => void;
    onStatusChange: (id: string, status: ReturnStatus) => void;
}) {
    const [ret, setRet] = useState<ReturnDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotificationStore();
    const [acting, setActing] = useState<"approve" | "refund" | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    const isRefunded =
        ret?.order.paymentStatus === "REFUNDED" ||
        (ret?.order.refunds && ret.order.refunds.length > 0);
    const hasPayment = !!(ret?.order.payment?.razorpayPaymentId);

    useEffect(() => {
        setLoading(true);
        getReturnById(returnId)
            .then(setRet)
            .catch(() => addNotification({ title: "Load Failed", message: "Failed to load return details", type: "error" }))
            .finally(() => setLoading(false));
    }, [returnId]);

    const handleApprove = async () => {
        if (!ret) return;
        setActing("approve");
        try {
            await approveReturn(ret.id);
            setRet((r) => r ? { ...r, status: "APPROVED" } : r);
            onStatusChange(ret.id, "APPROVED");
            addNotification({ title: "Return Approved", message: `Request for ${ret.order.orderNumber} approved`, type: "success" });
        } catch {
            addNotification({ title: "Approval Failed", message: "Could not approve return", type: "error" });
        } finally {
            setActing(null);
        }
    };

    const handleReject = async (note: string) => {
        if (!ret) return;
        try {
            await rejectReturn(ret.id, note);
            setRet((r) => r ? { ...r, status: "REJECTED", adminNote: note } : r);
            onStatusChange(ret.id, "REJECTED");
            addNotification({ title: "Return Rejected", message: `Request for ${ret.order.orderNumber} rejected`, type: "success" });
        } catch {
            addNotification({ title: "Rejection Failed", message: "Could not reject return", type: "error" });
            throw new Error();
        }
    };

    const handleRefund = async () => {
        if (!ret) return;
        setActing("refund");
        try {
            await initiateRefund(ret.orderId, ret.order.total);
            addNotification({ title: "Refund Initiated", message: `Refund of ${INR(ret.order.total)} processed`, type: "success" });
            // Reload to get updated refunds
            const updated = await getReturnById(returnId);
            setRet(updated);
        } catch {
            addNotification({ title: "Refund Failed", message: "Check Razorpay payment details", type: "error" });
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
                className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                className="fixed right-0 top-0 h-full w-full max-w-[560px] bg-white shadow-2xl z-50 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Return Request</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            {loading ? "Loading…" : ret ? `#${ret.id.slice(0, 8).toUpperCase()}` : "—"}
                        </p>
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
                ) : !ret ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-300">
                        Failed to load
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* Status + Meta */}
                            <div className="flex items-center justify-between">
                                <StatusBadge status={ret.status} />
                                <span className="text-[10px] text-gray-400">{fmtDate(ret.createdAt)}</span>
                            </div>

                            {/* Status Timeline */}
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <CircleDot className="h-3.5 w-3.5 text-gray-400" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Return Progress</p>
                                </div>
                                <StatusTimeline ret={ret} />
                            </div>

                            {/* Customer */}
                            <div className="glass-card p-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 text-[11px] font-bold text-white flex-shrink-0">
                                        {(ret.user.name || ret.user.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">{ret.user.name || "—"}</p>
                                        <p className="text-[10px] text-gray-400">{ret.user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="h-3.5 w-3.5 text-gray-400" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order</p>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-xs font-mono font-semibold text-gray-800">{ret.order.orderNumber}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Payment: <span className={`font-semibold ${ret.order.paymentStatus === "REFUNDED" ? "text-emerald-600" : "text-gray-600"}`}>
                                                {ret.order.paymentStatus}
                                            </span>
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{INR(ret.order.total)}</p>
                                </div>

                                {/* Order items */}
                                {ret.order.items && ret.order.items.length > 0 && (
                                    <div className="space-y-1.5 border-t border-gray-100 pt-3">
                                        {ret.order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[11px] font-medium text-gray-700">{item.productName}</p>
                                                    <p className="text-[10px] font-mono text-gray-400">{item.sku} × {item.quantity}</p>
                                                </div>
                                                <p className="text-[11px] font-semibold text-gray-700">{INR(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Return Reason */}
                            <div className="glass-card p-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Return Reason</p>
                                <p className="text-xs font-semibold text-gray-800">{ret.reason}</p>
                                {ret.description && (
                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{ret.description}</p>
                                )}
                            </div>

                            {/* Proof Images */}
                            {ret.images && ret.images.length > 0 && (
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            Proof Photos ({ret.images.length})
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ret.images.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => setLightboxImg(img.url)}
                                                className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 hover:border-brand-gold-300 transition-colors"
                                            >
                                                <img src={img.url} alt="" className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Address */}
                            {ret.order.address && (
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Delivery Address</p>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-800">{ret.order.address.fullName}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                        {ret.order.address.addressLine1}
                                        {ret.order.address.addressLine2 ? `, ${ret.order.address.addressLine2}` : ""}
                                        {`, ${ret.order.address.city}, ${ret.order.address.state} – ${ret.order.address.pincode}`}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1">📞 {ret.order.address.phone}</p>
                                </div>
                            )}

                            {/* Admin Note (if rejected) */}
                            {ret.status === "REJECTED" && ret.adminNote && (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Admin Note</p>
                                    </div>
                                    <p className="text-xs text-red-700 leading-relaxed">{ret.adminNote}</p>
                                </div>
                            )}

                            {/* Refund record (if exists) */}
                            {ret.order.refunds && ret.order.refunds.length > 0 && (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Refund Processed</p>
                                    </div>
                                    {ret.order.refunds.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between">
                                            <p className="text-xs text-emerald-700">{fmtDate(r.createdAt)} · {r.status}</p>
                                            <p className="text-xs font-bold text-emerald-700">{INR(r.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {ret.status === "PENDING" && (
                            <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0 flex gap-3">
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={acting !== null}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors"
                                >
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                    Reject
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={acting !== null}
                                    className="btn-primary flex-1 text-xs disabled:opacity-40"
                                >
                                    {acting === "approve"
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <ThumbsUp className="h-3.5 w-3.5" />}
                                    Approve Return
                                </button>
                            </div>
                        )}

                        {ret.status === "APPROVED" && !isRefunded && (
                            <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
                                {!hasPayment && (
                                    <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
                                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                        No Razorpay payment found — refund may not be possible for COD orders.
                                    </p>
                                )}
                                <button
                                    onClick={handleRefund}
                                    disabled={acting !== null || !hasPayment}
                                    className="btn-primary w-full text-xs disabled:opacity-40"
                                >
                                    {acting === "refund"
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <BadgeIndianRupee className="h-3.5 w-3.5" />}
                                    Initiate Refund · {INR(ret.order.total)}
                                </button>
                            </div>
                        )}

                        {(ret.status === "REJECTED" || isRefunded) && (
                            <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
                                <p className={`text-center text-xs font-semibold ${ret.status === "REJECTED" ? "text-red-500" : "text-emerald-600"}`}>
                                    {ret.status === "REJECTED" ? "This return request has been rejected." : "Refund has been processed."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Reject modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <RejectModal
                        onClose={() => setShowRejectModal(false)}
                        onConfirm={handleReject}
                    />
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center"
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

// ─── Main Returns Page ───────────────────────────────────────
export default function Returns() {
    const [returns, setReturns] = useState<ReturnListItem[]>([]);
    const [meta, setMeta] = useState<ReturnMeta>({ totalCount: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState<ReturnStatus | "">("");
    const [search, setSearch] = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchReturns = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const res = await getReturns({
                    page,
                    limit: 10,
                    status: statusFilter || undefined,
                    search: search || undefined,
                });
                setReturns(res.returns);
                setMeta(res.meta);
            } catch {
                setReturns([]);
            } finally {
                setLoading(false);
            }
        },
        [statusFilter, search]
    );

    useEffect(() => { fetchReturns(1); }, [fetchReturns]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchReturns(1), 500);
    };

    const handleStatusChange = (id: string, status: ReturnStatus) => {
        setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        if (statusFilter && statusFilter !== status) {
            setReturns((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const totalPages = meta.totalPages || Math.ceil(meta.totalCount / meta.limit);
    const pendingCount = returns.filter((r) => r.status === "PENDING").length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">Returns & Refunds</h1>
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                {pendingCount} pending
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {meta.totalCount} return{meta.totalCount !== 1 ? "s" : ""}
                        {statusFilter ? ` · ${statusFilter.toLowerCase()}` : ""}
                    </p>
                </div>
                <button onClick={() => fetchReturns(meta.page)} className="btn-outline text-xs">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by order number, customer..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                        />
                    </div>

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
                            className="text-[10px] font-semibold text-red-400 hover:text-red-500"
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
                                <th className="px-5 py-3">Return ID</th>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Reason</th>
                                <th className="px-5 py-3">Amount</th>
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
                            ) : returns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <RotateCcw className="h-8 w-8 text-gray-100 mx-auto mb-2" />
                                        <p className="text-xs text-gray-300">No return requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                returns.map((ret) => (
                                    <tr
                                        key={ret.id}
                                        onClick={() => setSelectedId(ret.id)}
                                        className={`cursor-pointer transition-colors hover:bg-gray-50/50 ${ret.status === "PENDING" ? "bg-amber-50/30" : ""}`}
                                    >
                                        <td className="px-5 py-3.5">
                                            <span className="text-[11px] font-mono font-semibold text-gray-500">
                                                #{ret.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-xs font-mono font-semibold text-gray-800">{ret.order.orderNumber}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-xs font-medium text-gray-800">{ret.user.name || "—"}</p>
                                            <p className="text-[10px] text-gray-400">{ret.user.email}</p>
                                        </td>
                                        <td className="px-5 py-3.5 max-w-[180px]">
                                            <p className="text-xs text-gray-600 truncate">{ret.reason}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-xs font-semibold text-gray-800">{INR(ret.order.total)}</p>
                                            <p className={`text-[10px] ${ret.order.paymentStatus === "REFUNDED" ? "text-emerald-500" : "text-gray-400"}`}>
                                                {ret.order.paymentStatus}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={ret.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                                            {fmtDate(ret.createdAt)}
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
                                onClick={() => fetchReturns(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let p: number;
                                if (totalPages <= 5) p = i + 1;
                                else if (meta.page <= 3) p = i + 1;
                                else if (meta.page >= totalPages - 2) p = totalPages - 4 + i;
                                else p = meta.page - 2 + i;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => fetchReturns(p)}
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${
                                            meta.page === p
                                                ? "bg-brand-gold-500 text-white shadow-sm"
                                                : "border border-gray-200 bg-white text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => fetchReturns(meta.page + 1)}
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
                {selectedId && (
                    <ReturnDetailDrawer
                        key={selectedId}
                        returnId={selectedId}
                        onClose={() => setSelectedId(null)}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
