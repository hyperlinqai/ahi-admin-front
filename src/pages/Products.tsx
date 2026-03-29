import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import {
    Search, Plus, Edit2, Trash2, Package, ChevronLeft, ChevronRight,
    Filter, Loader2, Image as ImageIcon, Star, AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface ProductImage {
    id: string;
    url: string;
}

interface ProductVariant {
    id?: string;
    name: string;
    value: string;
    sku: string;
    stock: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    brand?: string;
    isFeatured: boolean;
    categoryId: string;
    category: { name: string; slug: string };
    images: ProductImage[];
    variants: ProductVariant[];
    avgRating: number;
    reviewCount: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    createdAt: string;
}

interface Meta {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── Helpers ───────────────────────────────────────────────
function formatCurrency(val: number) {
    return "₹" + val.toLocaleString("en-IN", { minimumFractionDigits: 0 });
}

function getTotalStock(variants: ProductVariant[]) {
    return variants.reduce((sum, v) => sum + v.stock, 0);
}

function getStockBadge(variants: ProductVariant[]) {
    const total = getTotalStock(variants);
    const hasLow = variants.some((v) => v.stock > 0 && v.stock <= 5);
    if (total === 0) return { label: "Out of Stock", bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-400" };
    if (hasLow) return { label: `Low (${total})`, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-400" };
    return { label: `In Stock (${total})`, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-400" };
}

// ─── Delete Confirmation Modal ───────────────────────────
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Delete Product</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        Are you sure you want to delete <span className="font-semibold text-gray-700">{name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button onClick={onCancel} className="btn-outline text-xs">Cancel</button>
                        <button onClick={onConfirm} className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors">
                            <Trash2 className="h-3 w-3" /> Delete
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Products Page ─────────────────────────────────
export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [meta, setMeta] = useState<Meta>({ totalCount: 0, page: 1, limit: 10, totalPages: 0 });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Modals
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [stockFilter, setStockFilter] = useState(""); // "inStock" | "outOfStock" | "low"

    // Fetch categories once
    useEffect(() => {
        api.get("/categories").then((res) => setCategories(res.data.data || [])).catch(() => { });
    }, []);

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        setFetchError(null);
        try {
            const params: any = { page, limit: 10 };
            if (categoryFilter) params.category = categoryFilter;
            if (stockFilter === "inStock") params.inStock = "true";

            const res = await api.get("/products", { params });
            setProducts(res.data.data || []);
            setMeta(res.data.meta || { totalCount: 0, page: 1, limit: 10, totalPages: 0 });
        } catch (err: any) {
            setProducts([]);
            setFetchError(err?.response?.data?.message || "Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, stockFilter]);

    useEffect(() => { fetchProducts(1); }, [fetchProducts]);

    // Client-side search
    const filtered = search
        ? products.filter((p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    // Client-side stock filter for low/out
    const displayProducts = stockFilter === "outOfStock"
        ? filtered.filter((p) => getTotalStock(p.variants) === 0)
        : stockFilter === "low"
            ? filtered.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= 5))
            : filtered;

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            fetchProducts(meta.page);
        } catch { /* silent */ }
        setDeleteTarget(null);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{meta.totalCount} total product{meta.totalCount !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => navigate("/products/new")} className="btn-primary text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-300 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs text-gray-600 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none cursor-pointer">
                            <option value="">All Categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 bg-white py-2 px-3 text-xs text-gray-600 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none cursor-pointer">
                        <option value="">All Stock</option>
                        <option value="inStock">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                    </select>
                    {(search || categoryFilter || stockFilter) && (
                        <button onClick={() => { setSearch(""); setCategoryFilter(""); setStockFilter(""); }}
                            className="text-[10px] font-semibold text-red-400 hover:text-red-500 transition-colors">Clear All</button>
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
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3 text-right">Price</th>
                                <th className="px-5 py-3">Stock</th>
                                <th className="px-5 py-3 text-center">Rating</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-300 mx-auto" />
                                    </td>
                                </tr>
                            ) : fetchError ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                            </div>
                                            <p className="text-xs text-red-400 font-medium">{fetchError}</p>
                                            <button onClick={() => fetchProducts(1)}
                                                className="text-[11px] text-brand-gold-600 font-semibold hover:underline">
                                                Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                                <Package className="h-5 w-5 text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {search || categoryFilter || stockFilter
                                                    ? "No products match your filters"
                                                    : "No products yet — add your first product"}
                                            </p>
                                            {!search && !categoryFilter && !stockFilter && (
                                                <button onClick={() => navigate("/products/new")}
                                                    className="btn-primary text-xs">
                                                    <Plus className="h-3 w-3" /> Add Product
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayProducts.map((p) => {
                                    const stockBadge = getStockBadge(p.variants);
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                        {p.images?.[0]?.url ? (
                                                            <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-4 w-4 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">{p.title}</p>
                                                        {p.isFeatured && (
                                                            <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-500 font-medium">
                                                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-500">{p.category?.name || "—"}</td>
                                            <td className="px-5 py-3 text-right text-xs font-semibold text-gray-900">{formatCurrency(p.price)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stockBadge.bg} ${stockBadge.text} ${stockBadge.border}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${stockBadge.dot}`} />
                                                    {stockBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                    {p.avgRating > 0 ? p.avgRating : "—"}
                                                    <span className="text-[10px] text-gray-300">({p.reviewCount})</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button title="Edit" onClick={() => navigate(`/products/${p.id}`)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
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
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400">
                            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.totalCount)} of {meta.totalCount}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => fetchProducts(meta.page - 1)} disabled={meta.page <= 1}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                                let pageNum: number;
                                if (meta.totalPages <= 5) { pageNum = i + 1; }
                                else if (meta.page <= 3) { pageNum = i + 1; }
                                else if (meta.page >= meta.totalPages - 2) { pageNum = meta.totalPages - 4 + i; }
                                else { pageNum = meta.page - 2 + i; }
                                return (
                                    <button key={pageNum} onClick={() => fetchProducts(pageNum)}
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${meta.page === pageNum ? "bg-brand-gold-500 text-white shadow-sm" : "border border-gray-200 bg-white text-gray-500 hover:text-gray-800"}`}>
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button onClick={() => fetchProducts(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.title}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </motion.div>
    );
}
