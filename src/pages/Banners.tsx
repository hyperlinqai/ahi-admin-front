import { useState, useEffect, useRef } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon, Loader2, Calendar, UploadCloud, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

interface Banner {
    id: string;
    title: string | null;
    subtitle: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    imageUrl: string;
    position: string;
    sortOrder: number;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
}

const POSITIONS = ["HERO", "SIDEBAR", "FOOTER", "PROMO"];

export default function Banners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState("");
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [form, setForm] = useState({
        title: "", subtitle: "", ctaText: "", ctaLink: "",
        position: "HERO", isActive: true, startDate: "", endDate: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await api.get("/banners?all=true");
            setBanners(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const openModal = (banner?: Banner) => {
        if (banner) {
            setIsEdit(true);
            setEditingId(banner.id);
            setForm({
                title: banner.title || "", subtitle: banner.subtitle || "",
                ctaText: banner.ctaText || "", ctaLink: banner.ctaLink || "",
                position: banner.position, isActive: banner.isActive,
                startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
                endDate: banner.endDate ? banner.endDate.slice(0, 10) : ""
            });
            setPreviewUrl(banner.imageUrl);
            setFile(null);
        } else {
            setIsEdit(false);
            setEditingId("");
            setForm({
                title: "", subtitle: "", ctaText: "", ctaLink: "",
                position: "HERO", isActive: true, startDate: "", endDate: ""
            });
            setPreviewUrl(null);
            setFile(null);
        }
        setModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith("image/")) {
                setFile(droppedFile);
                setPreviewUrl(URL.createObjectURL(droppedFile));
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, typeof value === "string" ? value : value.toString());
            });
            
            // To ensure isActive is sent properly
            formData.set("isActive", form.isActive.toString());

            if (file) {
                try {
                    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                    const compressedFile = await imageCompression(file, options);
                    formData.append("image", compressedFile, file.name);
                } catch (e) {
                    console.error("Compression failed:", e);
                    formData.append("image", file);
                }
            } else if (!isEdit) {
                toast.error("An image is required!");
                setSaving(false);
                return;
            }

            if (isEdit) {
                await api.put(`/banners/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success("Banner updated");
            } else {
                await api.post("/banners", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success("Banner created");
            }
            setModalOpen(false);
            fetchBanners();
        } catch (error: any) {
             toast.error(error?.response?.data?.message || "Failed to save banner");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/banners/${deleteTarget.id}`);
            setDeleteTarget(null);
            toast.success("Banner removed");
            fetchBanners();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete banner");
        } finally {
            setDeleting(false);
        }
    };

    const handleReorder = async (groupPosition: string, newOrder: Banner[]) => {
        // Optimistic UI update
        const otherBanners = banners.filter(b => b.position !== groupPosition);
        setBanners([...otherBanners, ...newOrder]);

        // Backend update - hit the reorder endpoint sequentially
        try {
            for (let i = 0; i < newOrder.length; i++) {
                if (newOrder[i].sortOrder !== i) {
                    await api.patch(`/banners/${newOrder[i].id}/reorder`, { sortOrder: i });
                }
            }
            fetchBanners(); // Ensure consistency
        } catch (err) {
            toast.error("Failed to reorder banners");
            fetchBanners();
        }
    };

    // Group banners by position
    const groupedBanners = POSITIONS.reduce((acc, pos) => {
        acc[pos] = banners.filter(b => b.position === pos).sort((a, b) => a.sortOrder - b.sortOrder);
        return acc;
    }, {} as Record<string, Banner[]>);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 pb-12 pr-4 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Banners</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage visuals and promotional sliders</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Banner
                </button>
            </div>

            {loading ? (
                <div className="glass-card flex flex-col items-center justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-gold-500 mb-4" />
                    <p className="text-sm text-gray-400">Loading sliders...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {POSITIONS.map(position => (
                        <div key={position} className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-800 tracking-widest">{position} Placements</h2>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
                                    {groupedBanners[position]?.length || 0}
                                </span>
                            </div>

                            {groupedBanners[position]?.length === 0 ? (
                                <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                                    <ImageIcon className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">No Banners</p>
                                </div>
                            ) : (
                                <Reorder.Group axis="y" values={groupedBanners[position]} onReorder={(val) => handleReorder(position, val)} className="space-y-3">
                                    {groupedBanners[position].map((banner) => (
                                        <Reorder.Item key={banner.id} value={banner} className="relative flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                            
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1">
                                                    <GripVertical className="h-4 w-4" />
                                                </div>

                                                <div className="h-14 w-24 rounded overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                                    <img src={banner.imageUrl} alt={banner.title || "Banner"} className="h-full w-full object-cover" />
                                                </div>

                                                <div className="flex flex-col min-w-0 pr-4">
                                                    <h4 className="text-xs font-bold text-gray-900 truncate">{banner.title || "Untitled Graphic"}</h4>
                                                    {banner.subtitle && <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{banner.subtitle}</p>}
                                                    
                                                    {/* Status & Timing */}
                                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${banner.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                            {banner.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {(banner.startDate || banner.endDate) && (
                                                            <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                <Calendar className="h-3 w-3" />
                                                                {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Now'} - {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pr-2 shrink-0">
                                                <button onClick={() => openModal(banner)} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-brand-gold-600 transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(banner)} className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setModalOpen(false)} />
                        
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} 
                                    className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden glass-card flex flex-col max-h-[90vh]">
                            
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <h3 className="text-base font-bold text-gray-900">{isEdit ? "Update Visual Banner" : "Create Visual Banner"}</h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="overflow-y-auto p-6 flex flex-col gap-6 scrollbar-hide">
                                
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Graphic Asset <span className="text-red-500">*</span></label>
                                    <div 
                                        onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()}
                                        className={`w-full aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer group transition-all
                                            ${previewUrl ? 'border-brand-gold-300' : 'border-gray-200 hover:bg-gray-50 hover:border-brand-gold-300'}`}
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-full">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-gray-800 shadow-sm flex items-center gap-2">
                                                        <UploadCloud className="h-4 w-4" /> Change Image
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-center p-6 text-gray-400 transition-colors group-hover:text-brand-gold-500">
                                                <UploadCloud className="h-8 w-8 mb-3 opacity-50" />
                                                <p className="text-sm font-semibold">Drag & Drop or click to upload</p>
                                                <p className="text-[10px] uppercase font-mono tracking-widest mt-2 bg-gray-100 px-2 py-0.5 rounded opacity-75">PNG, JPG, WebP</p>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5 object-cover">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Display Title</label>
                                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field py-3" placeholder="Winter Collection" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Display Subtitle</label>
                                        <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="input-field py-3" placeholder="Up to 50% off!" />
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Action Button Label</label>
                                        <input type="text" value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} className="input-field py-3" placeholder="Shop Now" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Action URL</label>
                                        <input type="text" value={form.ctaLink} onChange={e => setForm({ ...form, ctaLink: e.target.value })} className="input-field py-3" placeholder="/collections/winter" />
                                    </div>

                                    <div className="col-span-2 sm:col-span-1 glass-card p-4">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Position Zone</label>
                                        <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="input-field py-3 bg-white cursor-pointer font-bold text-gray-800">
                                            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div className="col-span-2 sm:col-span-1 glass-card p-4">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Engagement Active</label>
                                        <label className="flex items-center gap-3 cursor-pointer py-1.5 focus-within:ring-2 focus-within:ring-brand-gold-500">
                                            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? 'bg-brand-gold-500' : 'bg-gray-200'}`}>
                                                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="sr-only" />
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-4.5' : 'translate-x-[2px]'}`} />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{form.isActive ? 'Visible publicly' : 'Hidden dynamically'}</span>
                                        </label>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Start Date (Optional)</label>
                                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field py-3" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">End Date (Optional)</label>
                                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field py-3" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-2 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                                    <button type="submit" disabled={saving} className="btn-primary min-w-[120px]">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (isEdit ? "Save Updates" : "Upload Banner")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                                <h3 className="text-lg font-bold text-gray-900">Remove Slider?</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this {deleteTarget.position} banner? This drops the image explicitly.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-outline">Abandon</button>
                                <button onClick={handleDelete} disabled={deleting} className="btn-primary bg-red-500 hover:bg-red-600 border-transparent text-white">
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Remove"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
