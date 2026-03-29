import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, ExternalLink } from "lucide-react";

interface StaticPage {
    id: string;
    title: string;
    slug: string;
    isActive: boolean;
    updatedAt: string;
}

export default function CMS() {
    const navigate = useNavigate();
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<StaticPage | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pages?all=true');
            setPages(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch pages", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/pages/${deleteTarget.slug}`);
            setDeleteTarget(null);
            fetchPages();
        } catch (err) {
            console.error("Failed to delete page", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5 pb-12">
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">CMS Pages</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage static pages like About, Privacy, Terms</p>
                </div>
                <button onClick={() => navigate("/cms/new")} className="btn-primary text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Page
                </button>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3">Page Title</th>
                                <th className="px-5 py-3">Slug</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Last Updated</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-brand-gold-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : pages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center text-xs text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-12 w-12 bg-gray-50 flex items-center justify-center rounded-xl mb-3">
                                                <ExternalLink className="h-5 w-5 text-gray-300" />
                                            </div>
                                            <p className="font-semibold text-gray-700">No Pages Found</p>
                                            <p className="mt-1">Create your first static page to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="font-semibold text-gray-800">{page.title}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">/{page.slug}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {page.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-500">
                                            {new Date(page.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <a href={`${import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000'}/${page.slug}`} target="_blank" rel="noreferrer" title="Preview"
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-gold-600 transition-colors">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                                <button title="Edit" onClick={() => navigate(`/cms/${page.slug}`)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button title="Delete" onClick={() => setDeleteTarget(page)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteTarget(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-50">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Page</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-700">/{deleteTarget.slug}</span>? This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading} className="btn-outline text-xs">Cancel</button>
                                <button onClick={handleDelete} disabled={deleteLoading} className="btn-primary bg-red-500 hover:bg-red-600 shadow-red-500/20 text-xs flex items-center gap-2">
                                    {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
