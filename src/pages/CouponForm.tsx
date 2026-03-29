import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getCouponById, createCoupon, updateCoupon, Coupon } from "../api/coupons";
import toast from "react-hot-toast";

export default function CouponForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        type: "FLAT" as "FLAT" | "PERCENTAGE" | "FREE_SHIPPING",
        discountValue: 0,
        maxDiscount: "",
        minOrderValue: "",
        usageLimit: "",
        perUserLimit: "",
        startDate: "",
        expiresAt: "",
        isActive: true,
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCoupon = async () => {
                try {
                    const res = await getCouponById(id);
                    const c = res.data as Coupon;

                    // Format dates for datetime-local input
                    const formatDate = (dateString?: string | null) => {
                        if (!dateString) return "";
                        const d = new Date(dateString);
                        // Ensure local timezone formatting for the input type="datetime-local"
                        return d.toISOString().slice(0, 16);
                    };

                    setFormData({
                        code: c.code,
                        type: c.type,
                        discountValue: c.discountValue,
                        maxDiscount: c.maxDiscount?.toString() || "",
                        minOrderValue: c.minOrderValue?.toString() || "",
                        usageLimit: c.usageLimit?.toString() || "",
                        perUserLimit: c.perUserLimit?.toString() || "",
                        startDate: formatDate(c.startDate),
                        expiresAt: formatDate(c.expiresAt),
                        isActive: c.isActive,
                    });
                } catch (error: any) {
                    toast.error("Failed to fetch coupon details");
                    navigate("/coupons");
                } finally {
                    setLoading(false);
                }
            };
            fetchCoupon();
        }
    }, [id, isEditMode, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare payload
        const payload: any = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            discountValue: Number(formData.discountValue),
            isActive: formData.isActive,
        };

        if (formData.maxDiscount) payload.maxDiscount = Number(formData.maxDiscount);
        if (formData.minOrderValue) payload.minOrderValue = Number(formData.minOrderValue);
        if (formData.usageLimit) payload.usageLimit = Number(formData.usageLimit);
        if (formData.perUserLimit) payload.perUserLimit = Number(formData.perUserLimit);

        if (formData.startDate) payload.startDate = new Date(formData.startDate).toISOString();
        if (formData.expiresAt) payload.expiresAt = new Date(formData.expiresAt).toISOString();

        try {
            setSaving(true);
            if (isEditMode && id) {
                await updateCoupon(id, payload);
                toast.success("Coupon updated successfully");
            } else {
                await createCoupon(payload);
                toast.success("Coupon created successfully");
            }
            navigate("/coupons");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save coupon");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c49a3c]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/coupons")}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? "Edit Coupon" : "Create New Coupon"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure discount rules and usage limits.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card p-6 md:p-8 space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-transform uppercase"
                                    placeholder="e.g. SUMMER2024"
                                />
                                <p className="text-xs text-gray-500">Must be unique. Customers enter this at checkout.</p>
                            </div>

                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        Coupon is Active
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Discount Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FLAT">Flat Amount (₹)</option>
                                    <option value="FREE_SHIPPING">Free Shipping</option>
                                </select>
                            </div>

                            {formData.type !== "FREE_SHIPPING" && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Discount Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {formData.type === "PERCENTAGE" ? "%" : "₹"}
                                        </span>
                                        <input
                                            type="number"
                                            name="discountValue"
                                            required
                                            min="0"
                                            max={formData.type === "PERCENTAGE" ? "100" : undefined}
                                            value={formData.discountValue}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.type === "PERCENTAGE" && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Max Discount (₹)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        min="0"
                                        value={formData.maxDiscount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                        placeholder="Optional limit"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Requirements & Limits */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Requirements & Limits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Minimum Order Value (₹)</label>
                                <input
                                    type="number"
                                    name="minOrderValue"
                                    min="0"
                                    value={formData.minOrderValue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Total Usage Limit</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    placeholder="E.g., first 100 users"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Per User Limit</label>
                                <input
                                    type="number"
                                    name="perUserLimit"
                                    min="1"
                                    value={formData.perUserLimit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    placeholder="Usually 1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Scheduling</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Starts At</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                />
                                <p className="text-xs text-gray-500">Leave blank to start immediately.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Expires At</label>
                                <input
                                    type="datetime-local"
                                    name="expiresAt"
                                    value={formData.expiresAt}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                />
                                <p className="text-xs text-gray-500">Leave blank to never expire.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/coupons")}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditMode ? "Update Coupon" : "Create Coupon"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
