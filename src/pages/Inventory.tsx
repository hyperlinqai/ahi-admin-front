import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    RefreshCw,
    Warehouse,
    AlertTriangle,
    X,
    Check,
    Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    getInventory,
    getLowStock,
    updateStock,
    type InventoryRow,
    type InventoryMeta,
} from "../api/inventory";

// ─── Helpers ───────────────────────────────────────────────
function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Stock Badge ───────────────────────────────────────────
function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
    if (stock === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-red-50 text-red-700 border-red-200">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Out of Stock
            </span>
        );
    }
    if (stock <= threshold) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Low Stock
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            In Stock
        </span>
    );
}

// ─── Adjustment Modal ──────────────────────────────────────
function AdjustmentModal({
    item,
    onClose,
    onSave,
}: {
    item: InventoryRow;
    onClose: () => void;
    onSave: (variantId: string, newStock: number) => Promise<void>;
}) {
    const [newStock, setNewStock] = useState(String(item.stock));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const parsed = parseInt(newStock, 10);
        if (isNaN(parsed) || parsed < 0) {
            toast.error("Enter a valid stock number");
            return;
        }
        if (parsed === item.stock) {
            onClose();
            return;
        }
        setSaving(true);
        try {
            await onSave(item.variantId, parsed);
            onClose();
        } catch {
            // error handled in parent
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Adjust Stock</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SKU</p>
                                    <p className="text-xs font-mono text-gray-600 mt-0.5">{item.sku}</p>
                                    {item.variantLabel && (
                                        <p className="text-[10px] text-gray-400 mt-1">{item.variantLabel}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Stock</p>
                                    <p className="text-lg font-bold text-gray-900 mt-0.5">{item.stock}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                New Stock Quantity
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                                autoFocus
                            />
                        </div>

                        {parseInt(newStock, 10) !== item.stock && !isNaN(parseInt(newStock, 10)) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                                <span>
                                    Stock will change from <strong>{item.stock}</strong> to{" "}
                                    <strong>{parseInt(newStock, 10)}</strong>{" "}
                                    ({parseInt(newStock, 10) > item.stock ? "+" : ""}
                                    {parseInt(newStock, 10) - item.stock})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button onClick={onClose} className="btn-outline flex-1 text-xs">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 text-xs disabled:opacity-40"
                        >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Inventory Page ───────────────────────────────────
export default function Inventory() {
    const [items, setItems] = useState<InventoryRow[]>([]);
    const [meta, setMeta] = useState<InventoryMeta>({ totalCount: 0, page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "low-stock">("all");

    // Search
    const [search, setSearch] = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    // Inline edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [savingInline, setSavingInline] = useState(false);

    // Modal
    const [adjustItem, setAdjustItem] = useState<InventoryRow | null>(null);

    const fetchData = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const params: any = { page, limit: 10 };
                if (search) params.search = search;

                const res = activeTab === "low-stock"
                    ? await getLowStock(params)
                    : await getInventory(params);

                setItems(res.rows);
                setMeta(res.meta);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        },
        [activeTab, search]
    );

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchData(1);
        }, 500);
    };

    // Tab switch
    const handleTabChange = (tab: "all" | "low-stock") => {
        setActiveTab(tab);
        setSearch("");
        setEditingId(null);
    };

    // Inline edit handlers
    const startInlineEdit = (item: InventoryRow) => {
        setEditingId(item.variantId);
        setEditValue(String(item.stock));
    };

    const cancelInlineEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveInlineEdit = async (item: InventoryRow) => {
        const parsed = parseInt(editValue, 10);
        if (isNaN(parsed) || parsed < 0) {
            toast.error("Enter a valid stock number");
            return;
        }
        if (parsed === item.stock) {
            cancelInlineEdit();
            return;
        }
        setSavingInline(true);
        try {
            await updateStock(item.variantId, { stock: parsed });
            setItems((prev) =>
                prev.map((i) =>
                    i.variantId === item.variantId
                        ? { ...i, stock: parsed, updatedAt: new Date().toISOString() }
                        : i
                )
            );
            toast.success("Stock updated");
            cancelInlineEdit();
        } catch {
            toast.error("Failed to update stock");
        } finally {
            setSavingInline(false);
        }
    };

    // Modal save
    const handleModalSave = async (variantId: string, newStock: number) => {
        try {
            await updateStock(variantId, { stock: newStock });
            setItems((prev) =>
                prev.map((i) =>
                    i.variantId === variantId
                        ? { ...i, stock: newStock, updatedAt: new Date().toISOString() }
                        : i
                )
            );
            toast.success("Stock adjusted successfully");
        } catch {
            toast.error("Failed to adjust stock");
            throw new Error("Failed");
        }
    };

    // CSV Export
    const exportCSV = () => {
        if (items.length === 0) {
            toast.error("No data to export");
            return;
        }
        const headers = ["Product Name", "Variant", "SKU", "Stock", "Low Stock Alert", "Last Updated"];
        const rows = items.map((i) => [
            `"${i.productName.replace(/"/g, '""')}"`,
            `"${i.variantLabel.replace(/"/g, '""')}"`,
            i.sku,
            i.stock,
            i.lowStockAlert,
            formatDateTime(i.updatedAt),
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `inventory-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported");
    };

    const totalPages = meta.totalPages || Math.ceil(meta.totalCount / meta.limit);

    // Row highlight for low stock
    const getRowClass = (item: InventoryRow) => {
        if (item.stock === 0) return "bg-red-50/60 hover:bg-red-50";
        if (item.stock <= item.lowStockAlert) return "bg-amber-50/60 hover:bg-amber-50";
        return "hover:bg-gray-50/50";
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
                    <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {meta.totalCount} {activeTab === "low-stock" ? "low stock" : ""} item{meta.totalCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="btn-outline text-xs">
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => fetchData(meta.page)}
                        className="btn-outline text-xs"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tab Toggle */}
            <div className="glass-card p-1.5 inline-flex self-start rounded-xl">
                <button
                    onClick={() => handleTabChange("all")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "all"
                            ? "bg-brand-gold-500 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <Warehouse className="h-3.5 w-3.5" />
                        All Products
                    </span>
                </button>
                <button
                    onClick={() => handleTabChange("low-stock")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "low-stock"
                            ? "bg-brand-gold-500 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Low Stock
                    </span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">SKU</th>
                                <th className="px-5 py-3 text-center">Stock</th>
                                <th className="px-5 py-3 text-center">Low Stock Alert</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Last Updated</th>
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
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-xs text-gray-300">
                                        {activeTab === "low-stock" ? "No low stock items" : "No inventory items found"}
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.variantId} className={`transition-colors ${getRowClass(item)}`}>
                                        <td className="px-5 py-3.5">
                                            <p className="text-xs font-semibold text-gray-800">{item.productName}</p>
                                            {item.variantLabel && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">{item.variantLabel}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs font-mono text-gray-500">
                                            {item.sku}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {editingId === item.variantId ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") saveInlineEdit(item);
                                                            if (e.key === "Escape") cancelInlineEdit();
                                                        }}
                                                        className="w-20 rounded border border-brand-gold-300 bg-white px-2 py-1 text-xs text-center text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => saveInlineEdit(item)}
                                                        disabled={savingInline}
                                                        className="flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        {savingInline ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={cancelInlineEdit}
                                                        className="flex h-6 w-6 items-center justify-center rounded bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startInlineEdit(item)}
                                                    className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-brand-gold-600 transition-colors cursor-pointer"
                                                    title="Click to edit"
                                                >
                                                    {item.stock}
                                                    <Pencil className="h-2.5 w-2.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-center text-xs text-gray-500">
                                            {item.lowStockAlert}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StockBadge stock={item.stock} threshold={item.lowStockAlert} />
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-400">
                                            {formatDate(item.updatedAt)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button
                                                onClick={() => setAdjustItem(item)}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-gold-600 hover:text-brand-gold-700 transition-colors"
                                            >
                                                Adjust
                                            </button>
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
                                onClick={() => fetchData(meta.page - 1)}
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
                                        onClick={() => fetchData(pageNum)}
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
                                onClick={() => fetchData(meta.page + 1)}
                                disabled={meta.page >= totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Adjustment Modal */}
            {adjustItem && (
                <AdjustmentModal
                    item={adjustItem}
                    onClose={() => setAdjustItem(null)}
                    onSave={handleModalSave}
                />
            )}
        </motion.div>
    );
}
