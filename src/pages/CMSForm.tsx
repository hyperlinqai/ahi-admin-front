import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { ChevronLeft, Loader2, Save, FileText, Globe, ExternalLink, Search } from "lucide-react";
import toast from "react-hot-toast";
import TipTapEditor from "../components/TipTapEditor";

export default function CMSForm() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(slug);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const [form, setForm] = useState({
        title: "",
        content: "",
        isActive: true,
        metaTitle: "",
        metaDescription: ""
    });

    useEffect(() => {
        if (isEdit && slug) {
            api.get(`/pages/${slug}?all=true`)
                .then(res => {
                    if (res.data.data) {
                        setForm({
                            title: res.data.data.title,
                            content: res.data.data.content,
                            isActive: res.data.data.isActive,
                            metaTitle: res.data.data.metaTitle || "",
                            metaDescription: res.data.data.metaDescription || "",
                        });
                    }
                })
                .catch(() => {
                    toast.error("Failed to load page data");
                    navigate("/cms");
                })
                .finally(() => setFetching(false));
        }
    }, [isEdit, slug, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && slug) {
                const res = await api.put(`/pages/${slug}`, form);
                toast.success("Page updated successfully");
                // Navigate to new slug if title updated and slug changed
                if (res.data.data.slug !== slug) {
                     navigate(`/cms/${res.data.data.slug}`, { replace: true });
                }
            } else {
                await api.post('/pages', form);
                toast.success("Page created successfully");
                navigate('/cms');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong saving the page");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-gold-500 mb-4" />
                <p className="text-sm text-gray-400">Loading page...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="pb-12 max-w-5xl mx-auto flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/cms")} className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {isEdit ? "Edit Page" : "Add New Page"}
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {isEdit ? "Update static page content and SEO settings" : "Create a new static page for your store"}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {isEdit && (
                        <a href={`${import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000'}/${slug}`} target="_blank" rel="noreferrer"
                           className="flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                            <ExternalLink className="h-4 w-4" /> Preview
                        </a>
                    )}
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary h-10 px-6 text-sm flex items-center gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEdit ? "Save Changes" : "Publish Page"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-brand-gold-50 rounded-lg text-brand-gold-500">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Page Content</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Internal Title</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                       placeholder="e.g. About Us" className="input-field" required />
                                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">The title is used to generate the page URL. Changing the title of an existing page will update its link.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Page Body</label>
                                <TipTapEditor value={form.content} onChange={val => setForm({ ...form, content: val })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar SEO & Status */}
                <div className="flex flex-col gap-6">
                    
                    {/* Status */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                <Globe className="h-5 w-5" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Visibility</h2>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-brand-gold-500' : 'bg-gray-200'}`}>
                                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="sr-only peer" />
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900 leading-tight">Published</span>
                                <span className="text-xs text-gray-500 leading-tight">Page is visible to users</span>
                            </div>
                        </label>
                        {isEdit && slug && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-widest">Current Slug</p>
                                <p className="text-xs font-mono text-gray-800 bg-white p-2 border border-gray-200 rounded break-all">/{slug}</p>
                            </div>
                        )}
                    </div>

                    {/* SEO */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                <Search className="h-5 w-5" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Search Engine Demo</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Meta Title</label>
                                <input type="text" value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                                       placeholder="Leave blank to use main title" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Meta Description</label>
                                <textarea value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                                          placeholder="A summary for search results..." className="input-field min-h-[100px] py-3" />
                            </div>

                            {/* Live View */}
                            {(form.metaTitle || form.title || form.metaDescription) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Google Preview</p>
                                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                        <p className="text-xs text-gray-500 font-mono mb-1 truncate">
                                            ahijewellery.com <span className="text-gray-400"> › {(slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))}</span>
                                        </p>
                                        <p className="text-sm text-blue-800 font-medium truncate mb-1">
                                            {form.metaTitle || form.title || 'Page Title'}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {form.metaDescription || "No meta description defined. Search engines will attempt to generate one from the page content."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
