import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Plus, Edit2, Trash2, Loader2, GripVertical, AlertTriangle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    isActive: boolean;
    sortOrder: number;
    children?: Category[];
}

// ─── Recursive Component for Tree Items ────────────────────────
const CategoryTreeItem = ({
    category,
    depth = 0,
    onEdit,
    onDelete
}: {
    category: Category;
    depth?: number;
    onEdit: (c: Category) => void;
    onDelete: (c: Category) => void;
}) => {
    return (
        <Reorder.Item
            value={category}
            id={category.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative flex items-center justify-between p-3 mb-2 rounded-xl bg-white border border-gray-100 shadow-sm transition-shadow hover:shadow-md cursor-default`}
            style={{ marginLeft: `${depth * 2}rem` }}
        >
            <div className="flex items-center gap-4">
                <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1">
                    <GripVertical className="h-4 w-4" />
                </div>

                {category.imageUrl ? (
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
                    </div>
                ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs font-medium">{category.name.charAt(0)}</span>
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{category.name}</h4>
                        {!category.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 uppercase tracking-widest">Hidden</span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">/{category.slug}</p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 pr-2">
                <button title="Edit" onClick={() => onEdit(category)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button title="Delete" onClick={() => onDelete(category)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </Reorder.Item>
    );
};

// ─── Main Component ─────────────────────────────────────────
export default function Categories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const fetchCategories = () => {
        setLoading(true);
        api.get("/categories")
            .then((res) => {
                // Ensure initial sort by sortOrder
                const sorted = (res.data.data || []).map((c: any) => ({
                    ...c,
                    children: c.children?.sort((a: any, b: any) => a.sortOrder - b.sortOrder) || []
                })).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
                setCategories(sorted);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        setDeleteError("");
        try {
            await api.delete(`/categories/${deleteTarget.id}`);
            setDeleteTarget(null);
            fetchCategories();
        } catch (err: any) {
            setDeleteError(err?.response?.data?.message || "Failed to delete category.");
        } finally {
            setDeleteLoading(false);
        }
    };

    // Flatten for Reorder component (Framer Motion Reorder works best on a flat list)
    // We will visually indent based on parent-child relations found in the tree, but 
    // allow flat dragging. Once dragged, we save the new order sequentially.
    const flattenTree = (tree: Category[], depth = 0): { cat: Category, depth: number }[] => {
        let result: { cat: Category, depth: number }[] = [];
        tree.forEach(node => {
            result.push({ cat: node, depth });
            if (node.children && node.children.length > 0) {
                result = result.concat(flattenTree(node.children, depth + 1));
            }
        });
        return result;
    };

    const [flatList, setFlatList] = useState<{ cat: Category, depth: number }[]>([]);

    useEffect(() => {
        setFlatList(flattenTree(categories));
    }, [categories]);

    const handleReorder = async (newOrder: { cat: Category, depth: number }[]) => {
        setFlatList(newOrder); // Optimistic UI update

        // Prepare payload for backend (only IDs and new sortOrder index)
        const payload = newOrder.map((item, index) => ({
            id: item.cat.id,
            sortOrder: index
        }));

        try {
            await api.put('/categories/reorder', { categories: payload });
        } catch (err) {
            console.error("Failed to reorder", err);
            fetchCategories(); // revert on failure
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5 pb-12">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage your product hierarchy</p>
                </div>
                <button onClick={() => navigate("/categories/new")} className="btn-primary text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Category
                </button>
            </div>

            {/* Content area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-4xl min-h-[500px]">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-gold-500 mb-4" />
                        <p className="text-sm text-gray-400">Loading catalog structure...</p>
                    </div>
                ) : flatList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-16 w-16 mb-4 rounded-2xl bg-brand-gold-50 border border-brand-gold-100 flex items-center justify-center">
                            <Plus className="h-8 w-8 text-brand-gold-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">No Categories Found</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm mb-6">Create your first category to start organizing your store's inventory.</p>
                        <button onClick={() => navigate("/categories/new")} className="btn-primary text-sm px-6">Create Category</button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Structure</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</span>
                        </div>

                        <Reorder.Group axis="y" values={flatList} onReorder={handleReorder} className="space-y-0">
                            {flatList.map((item) => (
                                <CategoryTreeItem
                                    key={item.cat.id}
                                    category={item.cat}
                                    depth={item.depth}
                                    onEdit={(c) => navigate(`/categories/${c.id}`)}
                                    onDelete={(c) => { setDeleteTarget(c); setDeleteError(""); }}
                                />
                            ))}
                        </Reorder.Group>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteTarget(null)} />

                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden glass-card">

                            <div className="p-6">
                                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete "{deleteTarget.name}"?</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Are you sure you want to delete this category? This action cannot be undone. You can only delete empty categories to preserve data integrity.
                                </p>

                                {deleteError && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-red-600 font-medium">{deleteError}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50/80 p-4 border-t border-gray-100 flex gap-3 justify-end">
                                <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={deleteLoading}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/20 transition-all flex items-center gap-2">
                                    {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    {deleteLoading ? "Deleting..." : "Delete Category"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
