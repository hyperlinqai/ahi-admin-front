import { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { Plus, GripVertical, Trash2, LayoutTemplate, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

interface LayoutSection {
    id: string;
    type: string;
    title?: string;
    position?: string;
    categoryId?: string;
}

const SECTION_OPTIONS = [
    { type: "HERO_BANNER", label: "Hero Banner Slider", defaultTitle: "" },
    { type: "FEATURED_CATEGORIES", label: "Featured Categories Grid", defaultTitle: "Shop by Category" },
    { type: "FEATURED_PRODUCTS", label: "Featured Products Selection", defaultTitle: "Featured Products" },
    { type: "NEW_ARRIVALS", label: "New Arrivals Grid", defaultTitle: "New Arrivals" },
    { type: "PROMO_BANNER", label: "Promotional Banner Strip", defaultTitle: "", defaultPosition: "PROMO" },
    { type: "CATEGORY_PRODUCTS", label: "Specific Category Items", defaultTitle: "Best of Category" },
];

export default function HomeLayout() {
    const [sections, setSections] = useState<LayoutSection[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSectionType, setNewSectionType] = useState(SECTION_OPTIONS[0].type);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch layout from settings
            const settingsRes = await api.get("/admin/settings");
            const storefrontSettings = settingsRes.data.data?.storefront || {};
            if (storefrontSettings.home_page_layout) {
                setSections(storefrontSettings.home_page_layout);
            } else {
                setSections([
                    { id: "default-1", type: "HERO_BANNER" },
                    { id: "default-2", type: "FEATURED_CATEGORIES", title: "Shop by Category" },
                    { id: "default-3", type: "FEATURED_PRODUCTS", title: "Featured Products" },
                    { id: "default-4", type: "PROMO_BANNER", position: "PROMO" },
                    { id: "default-5", type: "NEW_ARRIVALS", title: "New Arrivals" }
                ]);
            }

            // Fetch categories for the CATEGORY_PRODUCTS dropdown
            const catRes = await api.get("/categories?all=true");
            setCategories(catRes.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load layout or categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/admin/settings", {
                storefront: {
                    home_page_layout: sections,
                }
            });
            toast.success("Home page layout updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save layout");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = () => {
        const template = SECTION_OPTIONS.find(s => s.type === newSectionType);
        if (!template) return;

        const newSection: LayoutSection = {
            id: `section-${Date.now()}`,
            type: template.type,
            title: template.defaultTitle,
        };

        if (template.type === "PROMO_BANNER") {
            newSection.position = template.defaultPosition;
        }
        if (template.type === "CATEGORY_PRODUCTS" && categories.length > 0) {
            newSection.categoryId = categories[0].id;
        }

        setSections([...sections, newSection]);
        setShowAddModal(false);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, field: keyof LayoutSection, value: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 pb-12 pr-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Home Page Builder</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Control the exact sequence and configuration of modules displayed on the storefront landing page.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowAddModal(true)} className="btn-outline text-xs">
                        <Plus className="h-4 w-4 mr-1.5" /> Add Module
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary min-w-[120px] text-xs">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                            <><Save className="h-4 w-4 mr-1.5" /> Save Layout</>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="glass-card flex flex-col items-center justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-gold-500 mb-4" />
                    <p className="text-sm text-gray-400">Loading modules...</p>
                </div>
            ) : (
                <div className="flex gap-8 items-start">
                    
                    {/* Visual Editor (Left) */}
                    <div className="w-full max-w-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <LayoutTemplate className="h-5 w-5 text-brand-gold-500" />
                            <h2 className="text-sm font-bold text-gray-800 tracking-widest uppercase">Layout Flow</h2>
                        </div>

                        <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-4">
                            {sections.map((section, index) => {
                                const template = SECTION_OPTIONS.find(opt => opt.type === section.type);
                                return (
                                    <Reorder.Item 
                                        key={section.id} 
                                        value={section} 
                                        className="relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4"
                                    >
                                        <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                                            <GripVertical className="h-5 w-5" />
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-gold-50 text-brand-gold-700 font-bold text-[10px] tracking-tighter">
                                                        {index + 1}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-gray-900">{template?.label || section.type}</h3>
                                                </div>
                                                <button onClick={() => removeSection(section.id)} className="p-1.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Contextual Configuration Inputs */}
                                            {section.type !== "HERO_BANNER" && (
                                                <div className="grid grid-cols-2 gap-4 mt-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                                    
                                                    {section.title !== undefined && (
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Section Title</label>
                                                            <input 
                                                                type="text" 
                                                                value={section.title} 
                                                                onChange={(e) => updateSection(section.id, "title", e.target.value)} 
                                                                className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold-400 bg-white" 
                                                                placeholder="e.g. Featured Collection"
                                                            />
                                                        </div>
                                                    )}

                                                    {section.type === "PROMO_BANNER" && (
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Banner Position Identifier</label>
                                                            <input 
                                                                type="text" 
                                                                value={section.position} 
                                                                onChange={(e) => updateSection(section.id, "position", e.target.value)} 
                                                                className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold-400 bg-white font-mono" 
                                                                placeholder="e.g. PROMO, PROMO_2"
                                                            />
                                                            <p className="text-[9px] text-gray-400 mt-1">Must match 'Position Zone' in Banners.</p>
                                                        </div>
                                                    )}

                                                    {section.type === "CATEGORY_PRODUCTS" && (
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Source Category</label>
                                                            <select 
                                                                value={section.categoryId} 
                                                                onChange={(e) => updateSection(section.id, "categoryId", e.target.value)}
                                                                className="w-full text-xs py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold-400 bg-white"
                                                            >
                                                                <option value="" disabled>Select a category</option>
                                                                {categories.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                </div>
                                            )}

                                            {section.type === "HERO_BANNER" && (
                                                <p className="text-[11px] text-gray-400">Pulls all active banners assigned to position <strong>HERO</strong>.</p>
                                            )}
                                        </div>

                                    </Reorder.Item>
                                );
                            })}
                        </Reorder.Group>

                        {sections.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                                <p className="text-sm text-gray-500">No sections added yet.</p>
                                <button onClick={() => setShowAddModal(true)} className="mt-4 btn-primary text-xs mx-auto">
                                    <Plus className="h-4 w-4 mr-1.5" /> Start Building
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Live Storefront Mockup / Info (Right) */}
                    <div className="hidden lg:block w-[320px] shrink-0 sticky top-6">
                        <div className="rounded-[40px] border-[8px] border-gray-900 bg-gray-50 h-[640px] overflow-hidden shadow-2xl relative">
                            {/* Browser/Phone Mockup Header */}
                            <div className="h-6 w-full bg-gray-900 absolute top-0 left-0 flex items-center justify-center">
                                <div className="w-1/3 h-4 bg-black rounded-b-xl" />
                            </div>
                            
                            {/* Wireframe Outline */}
                            <div className="mt-6 p-4 flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide">
                                {sections.map((sec, i) => (
                                    <div key={sec.id} className="w-full min-h-[60px] bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest p-4 text-center">
                                        {sec.type.replace("_", " ")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                </div>
            )}

            {/* Add Module Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                        
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
                                    className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden glass-card flex flex-col">
                            
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <h3 className="text-base font-bold text-gray-900">Add New Module</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Select Module Type</label>
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-hide">
                                    {SECTION_OPTIONS.map(opt => (
                                        <button 
                                            key={opt.type}
                                            onClick={() => setNewSectionType(opt.type)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${newSectionType === opt.type ? 'border-brand-gold-500 bg-brand-gold-50' : 'border-gray-100 bg-white hover:border-brand-gold-200'}`}
                                        >
                                            <span className={`text-xs font-bold ${newSectionType === opt.type ? 'text-brand-gold-700' : 'text-gray-700'}`}>{opt.label}</span>
                                            {newSectionType === opt.type && (
                                                <div className="w-2 h-2 rounded-full bg-brand-gold-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                                <button onClick={() => setShowAddModal(false)} className="btn-outline text-xs">Cancel</button>
                                <button onClick={handleAddSection} className="btn-primary text-xs">Add to Page</button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
