import React, { useState, useEffect } from "react";
import { Save, Loader2, IndianRupee } from "lucide-react";

interface ShippingTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

export default function ShippingTab({ data, onSave, isSaving }: ShippingTabProps) {
    const [formData, setFormData] = useState({
        defaultCharge: 0,
        freeThreshold: 0,
        codExtraCharge: 0,
    });

    useEffect(() => {
        if (data && data.shipping) {
            setFormData({
                defaultCharge: data.shipping.defaultCharge || 0,
                freeThreshold: data.shipping.freeThreshold || 0,
                codExtraCharge: data.shipping.codExtraCharge || 0,
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Strip non-digits where needed
        const numValue = value === "" ? 0 : parseInt(value, 10);
        
        if (!isNaN(numValue)) {
            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            shipping: {
                defaultCharge: formData.defaultCharge,
                freeThreshold: formData.freeThreshold,
                codExtraCharge: formData.codExtraCharge,
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Shipping Configuration</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Define how shipping costs act inside the storefront cart.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Default Charge */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-semibold text-gray-900">Standard Delivery Base Fee</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="defaultCharge"
                                value={formData.defaultCharge === 0 ? "" : formData.defaultCharge}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500">The amount to charge customers for shipping unconditionally.</p>
                    </div>

                    {/* Free threshold */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-semibold text-gray-900">Free Shipping Min. Order Value</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="freeThreshold"
                                value={formData.freeThreshold === 0 ? "" : formData.freeThreshold}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-balance">
                            If their cart subtotal exceeds this amount, the standard delivery fee drops to ₹0. Keep at 0 to explicitly eliminate free shipping thresholds.
                        </p>
                    </div>

                    <div className="h-px bg-gray-100 my-2"></div>

                    {/* COD Extra Charge */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-semibold text-gray-900">Extra Surcharge for COD Orders</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="codExtraCharge"
                                value={formData.codExtraCharge === 0 ? "" : formData.codExtraCharge}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Apply an explicit fee solely to COD orders (logistics penalty offset). Waiters alongside the standard or free shipping rules.
                        </p>
                    </div>

                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
