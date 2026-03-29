import React, { useState, useEffect } from "react";
import { Save, Loader2, Weight, Ruler, Hash } from "lucide-react";

interface StoreDefaultsTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

const WEIGHT_UNITS = [
    { value: "g", label: "Grams (g)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "oz", label: "Ounces (oz)" },
    { value: "lb", label: "Pounds (lb)" },
    { value: "ct", label: "Carats (ct)" },
];

const DIMENSION_UNITS = [
    { value: "mm", label: "Millimeters (mm)" },
    { value: "cm", label: "Centimeters (cm)" },
    { value: "in", label: "Inches (in)" },
];

const SEPARATORS = [
    { value: "-", label: "Hyphen ( - )" },
    { value: "/", label: "Slash ( / )" },
    { value: "#", label: "Hash ( # )" },
];

// Fields that should always be stored as numbers
const NUMBER_FIELDS = ["orderDigits"];

export default function StoreDefaultsTab({ data, onSave, isSaving }: StoreDefaultsTabProps) {
    const [formData, setFormData] = useState({
        weightUnit: "g",
        dimensionUnit: "mm",
        orderPrefix: "AHI",
        orderSeparator: "-",
        orderDigits: 5,
        orderIncludeYear: true,
    });

    useEffect(() => {
        if (data && data.defaults) {
            setFormData({
                weightUnit: data.defaults.weightUnit || "g",
                dimensionUnit: data.defaults.dimensionUnit || "mm",
                orderPrefix: data.defaults.orderPrefix || "AHI",
                orderSeparator: data.defaults.orderSeparator || "-",
                orderDigits: Number(data.defaults.orderDigits) || 5,
                orderIncludeYear: data.defaults.orderIncludeYear ?? true,
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsed: any;
        if (type === "checkbox") {
            parsed = (e.target as HTMLInputElement).checked;
        } else if (NUMBER_FIELDS.includes(name)) {
            parsed = Number(value);
        } else {
            parsed = value;
        }

        setFormData(prev => ({ ...prev, [name]: parsed }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure correct types before sending
        const payload = {
            weightUnit: formData.weightUnit,
            dimensionUnit: formData.dimensionUnit,
            orderPrefix: formData.orderPrefix,
            orderSeparator: formData.orderSeparator,
            orderDigits: Number(formData.orderDigits) || 5,
            orderIncludeYear: Boolean(formData.orderIncludeYear),
        };
        onSave({ defaults: payload });
    };

    // Live preview
    const previewNumber = "4".repeat(formData.orderDigits || 5);
    const year = new Date().getFullYear();
    const sep = formData.orderSeparator;
    const preview = formData.orderIncludeYear
        ? `${formData.orderPrefix}${sep}${year}${sep}${previewNumber}`
        : `${formData.orderPrefix}${sep}${previewNumber}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">

            {/* ── Unit Configuration ────────────────────────── */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Weight className="w-5 h-5 text-gray-400" />
                        Measurement Units
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        These units are used across the product catalog for weight and dimensions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Weight className="w-3.5 h-3.5 text-gray-400" /> Weight Unit
                        </label>
                        <select name="weightUnit" value={formData.weightUnit} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all cursor-pointer">
                            {WEIGHT_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                        <p className="text-xs text-gray-400">Used for product weight fields (e.g. gold weight).</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Ruler className="w-3.5 h-3.5 text-gray-400" /> Dimension Unit
                        </label>
                        <select name="dimensionUnit" value={formData.dimensionUnit} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all cursor-pointer">
                            {DIMENSION_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                        <p className="text-xs text-gray-400">Used for product dimension fields (L x W x H).</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── Order ID Format ──────────────────────────── */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Hash className="w-5 h-5 text-gray-400" />
                        Order ID Format
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Customize how order numbers are generated for new orders.
                    </p>
                </div>

                <div className="space-y-5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-900">Order Prefix</label>
                            <input type="text" name="orderPrefix" value={formData.orderPrefix} onChange={handleChange}
                                maxLength={10} placeholder="AHI"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all uppercase" />
                            <p className="text-xs text-gray-400">The prefix at the start of every order number.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-900">Separator</label>
                            <select name="orderSeparator" value={formData.orderSeparator} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all cursor-pointer">
                                {SEPARATORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-900">Number of Digits</label>
                            <select name="orderDigits" value={formData.orderDigits} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all cursor-pointer">
                                <option value={4}>4 digits</option>
                                <option value={5}>5 digits</option>
                                <option value={6}>6 digits</option>
                                <option value={7}>7 digits</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 justify-center">
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.orderIncludeYear ? 'bg-brand-gold-500' : 'bg-gray-200'}`}>
                                    <input type="checkbox" name="orderIncludeYear" checked={formData.orderIncludeYear}
                                        onChange={handleChange} className="sr-only" />
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formData.orderIncludeYear ? 'translate-x-4' : 'translate-x-[3px]'}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Include Year</span>
                            </label>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="mt-2 pt-4 border-t border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Live Preview</p>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3.5 shadow-sm">
                            <div className="h-8 w-8 rounded-lg bg-brand-gold-50 flex items-center justify-center shrink-0">
                                <Hash className="h-4 w-4 text-brand-gold-600" />
                            </div>
                            <span className="font-mono text-base font-bold text-gray-900 tracking-wide">{preview}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2">
                            New orders will be assigned IDs in this format. Existing orders are not affected.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
