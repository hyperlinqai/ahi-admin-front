import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { X, Upload, ChevronLeft, Loader2, Check, AlertTriangle, Trash2 } from "lucide-react";
import imageCompression from "browser-image-compression";

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
}

// ─── Component ─────────────────────────────────────────
export default function CategoryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id && id !== "new");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(isEdit);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        isActive: true,
    });

    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);

    // Fetch all categories for the parent dropdown
    useEffect(() => {
        api.get("/categories")
            .then((res) => setAllCategories(flattenCategories(res.data.data || [])))
            .catch((err) => console.error("Failed to load categories", err));
    }, []);

    // Fetch Category info if Editing
    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            api.get(`/categories/${id}`)
                .then((res) => {
                    const cat = res.data.data;
                    setForm({
                        name: cat.name || "",
                        slug: cat.slug || "",
                        description: cat.description || "",
                        parentId: cat.parentId || "",
                        isActive: cat.isActive !== undefined ? cat.isActive : true,
                    });
                    if (cat.imageUrl) {
                        setExistingImage(cat.imageUrl);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setError("Failed to load category details.");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    // Utility to flatten tree for select dropdown
    const flattenCategories = (cats: any[], prefix = ""): Category[] => {
        let result: Category[] = [];
        cats.forEach(c => {
            // Don't allow a category to be its own parent!
            if (c.id !== id) {
                result.push({ ...c, name: `${prefix}${c.name}` });
                if (c.children && c.children.length > 0) {
                    result = result.concat(flattenCategories(c.children, `${prefix}— `));
                }
            }
        });
        return result;
    };

    // Handlers
    const handleNameChange = (val: string) => {
        setForm(prev => {
            const updates = { ...prev, name: val };
            // Auto gen slug if not manually touched
            if (!slugManuallyEdited) {
                updates.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return updates;
        });
    };

    const handleSlugChange = (val: string) => {
        setSlugManuallyEdited(true);
        setForm(prev => ({ ...prev, slug: val.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
    };

    const handleFieldChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) setNewFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) setNewFile(file);
    };

    const removeImage = () => {
        setNewFile(null);
        setExistingImage(null); // Just visually clear, we'll overwrite on save if they upload a new one
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("slug", form.slug);
            formData.append("description", form.description);
            formData.append("isActive", String(form.isActive));
            if (form.parentId) formData.append("parentId", form.parentId);
            
            if (newFile) {
                try {
                    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                    const compressedFile = await imageCompression(newFile, options);
                    formData.append("image", compressedFile, newFile.name);
                } catch (e) {
                    console.error("Compression failed:", e);
                    formData.append("image", newFile);
                }
            }

            if (isEdit) {
                await api.put(`/categories/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await api.post("/categories", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate("/categories");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to save category");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-gold-500" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate("/categories")} className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Category" : "Add New Category"}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{isEdit ? "Update category details and hierarchy" : "Create a new category for products"}</p>
                </div>
            </div>

            {/* Form Content */}
            <div className="glass-card p-6 md:p-8 space-y-8">

                {/* Basic Info */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">Category Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Necklaces"
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
                            <input type="text" value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="e.g. necklaces"
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all font-mono" />
                            <p className="text-xs text-gray-400 mt-1">Unique URL identifier for this category</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea rows={3} value={form.description} onChange={(e) => handleFieldChange("description", e.target.value)} placeholder="Brief description of the category..."
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none resize-y transition-all" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                            <select value={form.parentId} onChange={(e) => handleFieldChange("parentId", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none bg-white transition-all cursor-pointer">
                                <option value="">None (Top Level Category)</option>
                                {allCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Nest this category under another</p>
                        </div>

                        <div className="md:col-span-2 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${form.isActive ? 'bg-brand-gold-500' : 'bg-gray-200'}`}
                                    onClick={() => handleFieldChange("isActive", !form.isActive)}>
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.isActive ? 'translate-x-2' : '-translate-x-2'}`} />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Category is Active</span>
                            </label>
                            <p className="text-xs text-gray-400 mt-1 ml-12">Inactive categories are hidden from the store frontend</p>
                        </div>
                    </div>
                </section>

                {/* Image */}
                <section className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">Category Image</h3>

                    {(newFile || existingImage) ? (
                        <div className="flex gap-4 items-start">
                            <div className="relative h-40 w-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <img src={newFile ? URL.createObjectURL(newFile) : existingImage!} alt="Category" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={removeImage}
                                        className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Cover Image</p>
                                <p className="text-xs text-gray-500 mb-3">{newFile ? newFile.name : 'Currently uploaded image'}</p>
                                <button onClick={removeImage} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <X className="h-3.5 w-3.5" /> Remove Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 max-w-sm ${dragActive ? "border-brand-gold-400 bg-brand-gold-50/50 scale-[0.99]" : "border-gray-300 hover:border-brand-gold-300 hover:bg-gray-50 bg-gray-50/50"}`}
                        >
                            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                <Upload className="h-5 w-5 text-brand-gold-500" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Upload category thumbnail</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-mono">JPG, PNG up to 2MB</p>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </section>

                {/* Global Error */}
                {error && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-[260px] right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-40 transform transition-transform">
                <div className="max-w-3xl mx-auto flex items-center justify-end gap-3">
                    <button onClick={() => navigate("/categories")} className="btn-outline px-6 text-sm">Cancel</button>
                    <button onClick={handleSave} disabled={saving || !form.name}
                        className="btn-primary px-8 text-sm disabled:opacity-50 flex items-center gap-2">
                        {saving ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Check className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Category"}</>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
