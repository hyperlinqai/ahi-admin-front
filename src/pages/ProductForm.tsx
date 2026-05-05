import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, Reorder } from "framer-motion";
import api from "../api/axios";
import { X, Upload, ChevronLeft, Loader2, Star, Check, Globe, Weight, Trash2, AlertTriangle, Plus, FileText, Diamond, Truck, RefreshCw, Info } from "lucide-react";
import { settingsApi } from "../api/settings";
import imageCompression from "browser-image-compression";
import TipTapEditor from "../components/TipTapEditor";
import { useNotificationStore } from "../store/notificationStore";

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
    children?: Category[];
}

// Flatten category tree for dropdown display
const flattenCategories = (cats: Category[], prefix = ""): Category[] => {
    let result: Category[] = [];
    cats.forEach(c => {
        result.push({ ...c, name: `${prefix}${c.name}` });
        if (c.children && c.children.length > 0) {
            result = result.concat(flattenCategories(c.children, `${prefix}— `));
        }
    });
    return result;
};

// ─── Section Tab Component ──────────────────────────────────
interface SectionTab {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const sectionTabs: SectionTab[] = [
    { id: "basic", label: "Basic Info", icon: <Info className="h-4 w-4" /> },
    { id: "description", label: "Description", icon: <FileText className="h-4 w-4" /> },
    { id: "details", label: "Product Details", icon: <Weight className="h-4 w-4" /> },
    { id: "care", label: "Jewellery Care", icon: <Diamond className="h-4 w-4" /> },
    { id: "shipping", label: "Shipping Info", icon: <Truck className="h-4 w-4" /> },
    { id: "return", label: "Return & Exchange", icon: <RefreshCw className="h-4 w-4" /> },
    { id: "images", label: "Images", icon: <Upload className="h-4 w-4" /> },
    { id: "seo", label: "SEO", icon: <Globe className="h-4 w-4" /> },
];

// ─── Main Component ─────────────────────────────────────────
export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id && id !== "new");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addNotification } = useNotificationStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [activeSection, setActiveSection] = useState("basic");

    const [weightUnit, setWeightUnit] = useState("g");
    const [dimensionUnit, setDimensionUnit] = useState("mm");

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: 0 as number | string,
        categoryId: "",
        brand: "",
        isFeatured: false,
        weight: "" as number | string,
        length: "" as number | string,
        width: "" as number | string,
        height: "" as number | string,
        material: "",
        features: "",
        careInstructions: "",
        shippingInfo: "",
        returnPolicy: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        sku: "",
        stock: 0 as number | string,
    });

    const [hasVariants, setHasVariants] = useState(false);

    const [variants, setVariants] = useState<ProductVariant[]>([
        { name: "", value: "", sku: "", stock: 0 }
    ]);

    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);

    // Fetch Categories & Store Units
    useEffect(() => {
        api.get("/categories")
            .then((res) => setCategories(flattenCategories(res.data.data || [])))
            .catch((err) => console.error("Failed to load categories", err));

        settingsApi.getSettings()
            .then((res) => {
                if (res.data?.defaults) {
                    setWeightUnit(res.data.defaults.weightUnit || "g");
                    setDimensionUnit(res.data.defaults.dimensionUnit || "mm");
                }
            })
            .catch(() => {});
    }, []);

    // Fetch Product if Editing
    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            api.get(`/products/${id}`)
                .then((res) => {
                    const product = res.data.data;
                    setForm({
                        title: product.title || "",
                        description: product.description || "",
                        price: product.price || 0,
                        categoryId: product.categoryId || "",
                        brand: product.brand || "",
                        isFeatured: product.isFeatured || false,
                        weight: product.weight ?? "",
                        length: product.length ?? "",
                        width: product.width ?? "",
                        height: product.height ?? "",
                        material: product.material || "",
                        features: product.features || "",
                        careInstructions: product.careInstructions || "",
                        shippingInfo: product.shippingInfo || "",
                        returnPolicy: product.returnPolicy || "",
                        metaTitle: product.metaTitle || "",
                        metaDescription: product.metaDescription || "",
                        metaKeywords: product.metaKeywords || "",
                        sku: "",
                        stock: 0,
                    });
                    if (product.variants && product.variants.length > 0) {
                        setVariants(product.variants);
                        if (product.variants.length === 1 && product.variants[0].name === "Default") {
                            setHasVariants(false);
                            setForm((prev) => ({ ...prev, sku: product.variants[0].sku, stock: product.variants[0].stock }));
                        } else {
                            setHasVariants(true);
                        }
                    } else {
                        setHasVariants(false);
                    }
                    if (product.images) {
                        setExistingImages(product.images);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setError("Failed to load product details.");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    // Handlers
    const handleFieldChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
    };

    const addVariant = () => setVariants((prev) => [...prev, { name: "", value: "", sku: "", stock: 0 }]);
    const removeVariant = (i: number) => setVariants((prev) => prev.filter((_, idx) => idx !== i));

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        setNewFiles((prev) => [...prev, ...files].slice(0, 5));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files).filter((f) => f.type.startsWith("image/")) : [];
        setNewFiles((prev) => [...prev, ...files].slice(0, 5));
    };

    const removeNewFile = (i: number) => setNewFiles((prev) => prev.filter((_, idx) => idx !== i));

    const removeExistingImage = async (imgId: string) => {
        if (!isEdit || !id) return;
        try {
            await api.delete(`/products/${id}/images/${imgId}`);
            setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
        } catch {
            setError("Failed to delete image.");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            let validVariants: ProductVariant[] = [];

            if (hasVariants) {
                validVariants = variants.filter((v) => v.name && v.value && v.sku);
            } else if (form.sku) {
                const existingDefault = variants.length === 1 ? variants[0].id : undefined;
                validVariants = [{
                    id: existingDefault,
                    name: "Default",
                    value: "Standard",
                    sku: form.sku,
                    stock: Number(form.stock) || 0
                }];
            }

            const body: any = {
                title: form.title,
                description: form.description,
                price: Number(form.price),
                categoryId: form.categoryId,
                brand: form.brand || undefined,
                isFeatured: form.isFeatured,
                weight: form.weight !== "" ? Number(form.weight) : undefined,
                length: form.length !== "" ? Number(form.length) : undefined,
                width: form.width !== "" ? Number(form.width) : undefined,
                height: form.height !== "" ? Number(form.height) : undefined,
                material: form.material || undefined,
                features: form.features || undefined,
                careInstructions: form.careInstructions || undefined,
                shippingInfo: form.shippingInfo || undefined,
                returnPolicy: form.returnPolicy || undefined,
                metaTitle: form.metaTitle || undefined,
                metaDescription: form.metaDescription || undefined,
                metaKeywords: form.metaKeywords || undefined,
            };

            let productId: string;

            if (validVariants.length > 0) {
                body.variants = validVariants.map(({ id, name, value, sku, stock }) => ({
                    id, name, value, sku, stock: Number(stock),
                }));
            }

            if (isEdit) {
                await api.put(`/products/${id}`, body);
                productId = id as string;

                if (existingImages.length > 0) {
                    await api.put(`/products/${id}/images/reorder`, {
                        imageOrder: existingImages.map(img => img.id)
                    }).catch(console.error);
                }
                
                addNotification({
                    title: "Product Updated",
                    message: `${form.title} has been successfully updated`,
                    type: "success",
                });
            } else {
                const res = await api.post("/products", body);
                productId = res.data.data.id;
                
                addNotification({
                    title: "Product Created",
                    message: `${form.title} has been successfully published`,
                    type: "success",
                });
            }

            // Upload new images
            if (newFiles.length > 0) {
                setUploadingImages(true);
                const formData = new FormData();

                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                for (const f of newFiles) {
                    try {
                        const compressedFile = await imageCompression(f, options);
                        formData.append("images", compressedFile, f.name);
                    } catch (error) {
                        console.error("Compression failed:", error);
                        formData.append("images", f);
                    }
                }

                await api.post(`/products/${productId}/images`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                
                addNotification({
                    title: "Images Uploaded",
                    message: `${newFiles.length} images added to ${form.title}`,
                    type: "success",
                });
                
                setUploadingImages(false);
            }

            navigate("/products");
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Failed to save product";
            setError(errorMsg);
            addNotification({
                title: "Save Failed",
                message: errorMsg,
                type: "error",
            });
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-16">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate("/products")} className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{isEdit ? "Update product details and media" : "Fill in the details to create a product"}</p>
                </div>
            </div>

            {/* Layout: Sidebar Tabs + Content */}
            <div className="flex flex-col md:flex-row gap-6">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div className="sticky top-6 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                        {sectionTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                    activeSection === tab.id
                                        ? "bg-white shadow-sm border border-gray-200/60 ring-1 ring-brand-gold-400/30 text-gray-900"
                                        : "text-gray-500 hover:bg-white/60 hover:text-gray-700"
                                }`}
                            >
                                <span className={activeSection === tab.id ? "text-brand-gold-500" : "text-gray-400"}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="glass-card p-6 md:p-8 space-y-6">

                        {/* ═══════ BASIC INFO ═══════ */}
                        {activeSection === "basic" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Info className="h-3.5 w-3.5" /> Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                        <input type="text" value={form.title} onChange={(e) => handleFieldChange("title", e.target.value)} placeholder="e.g. Diamond Solitaire Ring"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                        <input type="number" value={form.price} onChange={(e) => handleFieldChange("price", e.target.value)} min="0" step="1"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                        <input type="text" value={form.brand} onChange={(e) => handleFieldChange("brand", e.target.value)} placeholder="e.g. Ahi"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                        <select value={form.categoryId} onChange={(e) => handleFieldChange("categoryId", e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none bg-white transition-all cursor-pointer">
                                            <option value="">Select category</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.isFeatured} onChange={(e) => handleFieldChange("isFeatured", e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-gold-500 focus:ring-brand-gold-400/30" />
                                            <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Mark as Featured
                                            </span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2 pt-2 pb-2">
                                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-brand-gold-50/50 rounded-xl border border-brand-gold-100">
                                            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hasVariants ? 'bg-brand-gold-500' : 'bg-gray-300'}`}>
                                                <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="sr-only" />
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${hasVariants ? 'translate-x-4.5' : 'translate-x-[2px]'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">This product has multiple options</span>
                                                <span className="text-xs text-gray-500">Like different sizes, colors, or materials.</span>
                                            </div>
                                        </label>
                                    </div>

                                    {!hasVariants && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit) *</label>
                                                <input type="text" value={form.sku} onChange={(e) => handleFieldChange("sku", e.target.value)} placeholder="e.g. AHI-RNG-001"
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all font-mono" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock Quantity *</label>
                                                <input type="number" value={form.stock} onChange={(e) => handleFieldChange("stock", e.target.value)} min="0" placeholder="0"
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Variants Section (inline when enabled) */}
                                {hasVariants && (
                                    <div className="pt-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Product Variants</h4>
                                            <button onClick={addVariant} type="button" className="text-xs font-semibold text-brand-gold-600 hover:text-brand-gold-700 transition-colors flex items-center gap-1 bg-brand-gold-50 px-3 py-1.5 rounded-lg">
                                                <Plus className="h-3.5 w-3.5" /> Add Variant
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {variants.map((v, i) => (
                                                <div key={i} className="flex flex-col md:flex-row gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 relative group">
                                                    {variants.length > 1 && (
                                                        <button onClick={() => removeVariant(i)} className="absolute -right-2 -top-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 h-6 w-6 rounded-full flex items-center justify-center shadow-sm transition-colors opacity-0 group-hover:opacity-100">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Option Name</label>
                                                        <input placeholder="e.g. Size" value={v.name} onChange={(e) => handleVariantChange(i, "name", e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Option Value</label>
                                                        <input placeholder="e.g. 18K" value={v.value} onChange={(e) => handleVariantChange(i, "value", e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">SKU</label>
                                                        <input placeholder="e.g. RING-18K-001" value={v.sku} onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all font-mono" />
                                                    </div>
                                                    <div className="w-full md:w-24">
                                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Stock Qty</label>
                                                        <input type="number" placeholder="0" value={v.stock} onChange={(e) => handleVariantChange(i, "stock", e.target.value)} min="0"
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ═══════ DESCRIPTION (Rich Text) ═══════ */}
                        {activeSection === "description" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5" /> Product Description
                                </h3>
                                <p className="text-xs text-gray-400">Use the editor toolbar to format text with bold, italic, lists, headings and more. This content appears in the "Description" section on the storefront.</p>
                                <TipTapEditor
                                    value={form.description}
                                    onChange={(val) => handleFieldChange("description", val)}
                                />
                            </section>
                        )}

                        {/* ═══════ PRODUCT DETAILS ═══════ */}
                        {activeSection === "details" && (
                            <section className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Weight className="h-3.5 w-3.5" /> Product Details
                                </h3>
                                <p className="text-xs text-gray-400">These details appear in the "Product Details" section on the storefront product page.</p>

                                {/* Material & Features */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                        <input type="text" value={form.material} onChange={(e) => handleFieldChange("material", e.target.value)} placeholder="e.g. Brass Alloy, Zirconia, Pearls (No Plastic), 18kt Gold Plating"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                        <p className="text-[11px] text-gray-400 mt-1">Full material composition of the product</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                                        <input type="text" value={form.features} onChange={(e) => handleFieldChange("features", e.target.value)} placeholder="e.g. Hypoallergenic, Anti-tarnish"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                        <p className="text-[11px] text-gray-400 mt-1">Comma-separated product features</p>
                                    </div>
                                </div>

                                {/* Weight & Dimensions */}
                                <div className="pt-2">
                                    <h4 className="text-xs font-semibold text-gray-500 mb-3">Weight & Dimensions</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight ({weightUnit})</label>
                                            <input type="number" value={form.weight} onChange={(e) => handleFieldChange("weight", e.target.value)} min="0" step="any" placeholder="0"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Length ({dimensionUnit})</label>
                                            <input type="number" value={form.length} onChange={(e) => handleFieldChange("length", e.target.value)} min="0" step="any" placeholder="0"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Width ({dimensionUnit})</label>
                                            <input type="number" value={form.width} onChange={(e) => handleFieldChange("width", e.target.value)} min="0" step="any" placeholder="0"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Height ({dimensionUnit})</label>
                                            <input type="number" value={form.height} onChange={(e) => handleFieldChange("height", e.target.value)} min="0" step="any" placeholder="0"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 ml-1 mt-2">Units are configured in Settings &rarr; Units & Order Format.</p>
                                </div>
                            </section>
                        )}

                        {/* ═══════ JEWELLERY CARE ═══════ */}
                        {activeSection === "care" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Diamond className="h-3.5 w-3.5" /> Jewellery Care
                                </h3>
                                <p className="text-xs text-gray-400">Care instructions specific to this product. Appears in the "Jewellery Care" section on the storefront. If left empty, global store policy from Settings will be used.</p>
                                <TipTapEditor
                                    value={form.careInstructions}
                                    onChange={(val) => handleFieldChange("careInstructions", val)}
                                />
                            </section>
                        )}

                        {/* ═══════ SHIPPING INFO ═══════ */}
                        {activeSection === "shipping" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Truck className="h-3.5 w-3.5" /> Shipping Information
                                </h3>
                                <p className="text-xs text-gray-400">Shipping details specific to this product. Appears in the "Shipping Info" section on the storefront. If left empty, global store policy from Settings will be used.</p>
                                <TipTapEditor
                                    value={form.shippingInfo}
                                    onChange={(val) => handleFieldChange("shippingInfo", val)}
                                />
                            </section>
                        )}

                        {/* ═══════ RETURN & EXCHANGE ═══════ */}
                        {activeSection === "return" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <RefreshCw className="h-3.5 w-3.5" /> Return & Exchange Policy
                                </h3>
                                <p className="text-xs text-gray-400">Return and exchange policy specific to this product. Appears in the "Return and Exchange" section on the storefront. If left empty, global store policy from Settings will be used.</p>
                                <TipTapEditor
                                    value={form.returnPolicy}
                                    onChange={(val) => handleFieldChange("returnPolicy", val)}
                                />
                            </section>
                        )}

                        {/* ═══════ IMAGES ═══════ */}
                        {activeSection === "images" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Upload className="h-3.5 w-3.5" /> Product Images</span>
                                    <span className="text-[10px] font-normal normal-case text-gray-400">Max 5 images</span>
                                </h3>

                                {existingImages.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400">Drag images to reorder them on the storefront.</p>
                                        <Reorder.Group axis="x" values={existingImages} onReorder={setExistingImages} className="flex gap-3 flex-wrap">
                                            {existingImages.map((img) => (
                                                <Reorder.Item key={img.id} value={img} className="relative h-24 w-24 rounded-xl overflow-hidden border border-gray-200 group shadow-sm cursor-grab active:cursor-grabbing">
                                                    <img src={img.url} alt="" className="h-full w-full object-cover pointer-events-none select-none" draggable={false} />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button onClick={(e) => { e.stopPropagation(); removeExistingImage(img.id); }}
                                                            className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors transform scale-90 group-hover:scale-100 cursor-pointer">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                )}

                                {newFiles.length > 0 && (
                                    <div className="flex gap-3 flex-wrap pt-2">
                                        {newFiles.map((file, i) => (
                                            <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-brand-gold-200 bg-brand-gold-50/30 group">
                                                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover opacity-90" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => removeNewFile(i)}
                                                        className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors transform scale-90 group-hover:scale-100">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                                    New
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${dragActive ? "border-brand-gold-400 bg-brand-gold-50/50 scale-[0.99]" : "border-gray-300 hover:border-brand-gold-300 hover:bg-gray-50 bg-gray-50/50"}`}
                                >
                                    <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                        <Upload className="h-5 w-5 text-brand-gold-500" />
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">Drag & drop product images here</p>
                                    <p className="text-xs text-gray-400 mt-1">or <span className="text-brand-gold-500 hover:underline">click to browse from your computer</span></p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">JPG, PNG up to 5MB</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                            </section>
                        )}

                        {/* ═══════ SEO ═══════ */}
                        {activeSection === "seo" && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" /> SEO Metadata <span className="text-[10px] font-normal normal-case text-gray-400">(Optional)</span>
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                        <input type="text" value={form.metaTitle} onChange={(e) => handleFieldChange("metaTitle", e.target.value)} placeholder="e.g. Diamond Solitaire Ring - Ahi Jewellery"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                        <textarea rows={2} value={form.metaDescription} onChange={(e) => handleFieldChange("metaDescription", e.target.value)} placeholder="Brief description for search engines (up to 160 characters)"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none resize-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                                        <input type="text" value={form.metaKeywords} onChange={(e) => handleFieldChange("metaKeywords", e.target.value)} placeholder="e.g. diamond ring, 18k gold (comma separated)"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-gold-400 focus:ring-1 focus:ring-brand-gold-400/20 focus:outline-none transition-all" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Global Error */}
                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-[260px] right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-40 transform transition-transform">
                <div className="max-w-5xl mx-auto flex items-center justify-end gap-3">
                    <button onClick={() => navigate("/products")} className="btn-outline px-6 text-sm">Cancel</button>
                    <button onClick={handleSave} disabled={saving || !form.title || !form.price || !form.categoryId || (!hasVariants && !form.sku)}
                        className="btn-primary px-8 text-sm disabled:opacity-50 flex items-center gap-2">
                        {saving ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> {uploadingImages ? "Uploading Media..." : "Saving Product..."}</>
                        ) : (
                            <><Check className="h-4 w-4" /> {isEdit ? "Save Changes" : "Publish Product"}</>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
