import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

interface StorePoliciesTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

export default function StorePoliciesTab({ data, onSave, isSaving }: StorePoliciesTabProps) {
    const [formData, setFormData] = useState({
        jewelleryCare: "",
        shippingInfo: "",
        returnExchange: "",
        disclaimer: "",
    });

    useEffect(() => {
        if (data && data.policies) {
            setFormData({
                jewelleryCare: data.policies.jewelleryCare || "",
                shippingInfo: data.policies.shippingInfo || "",
                returnExchange: data.policies.returnExchange || "",
                disclaimer: data.policies.disclaimer || "",
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            policies: {
                jewelleryCare: formData.jewelleryCare,
                shippingInfo: formData.shippingInfo,
                returnExchange: formData.returnExchange,
                disclaimer: formData.disclaimer,
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Store Policies</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        These policies are displayed on every product detail page in the storefront accordion sections.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Jewellery Care */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Jewellery Care Instructions</label>
                        <textarea
                            name="jewelleryCare"
                            value={formData.jewelleryCare}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all resize-y"
                            placeholder="Enter jewellery care instructions. Each line will be displayed as a separate point."
                        />
                        <p className="text-xs text-gray-500">Write each care instruction on a new line. These will be shown as a numbered list on the product page.</p>
                    </div>

                    <div className="h-px bg-gray-100 my-1"></div>

                    {/* Shipping Info */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Shipping Information</label>
                        <textarea
                            name="shippingInfo"
                            value={formData.shippingInfo}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all resize-y"
                            placeholder="Enter shipping policy information..."
                        />
                        <p className="text-xs text-gray-500">Dispatch times, delivery expectations, and shipping-related policies.</p>
                    </div>

                    <div className="h-px bg-gray-100 my-1"></div>

                    {/* Return & Exchange */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Return & Exchange Policy</label>
                        <textarea
                            name="returnExchange"
                            value={formData.returnExchange}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all resize-y"
                            placeholder="Enter return and exchange policy..."
                        />
                        <p className="text-xs text-gray-500">Return eligibility, exchange conditions, and quality disclaimers.</p>
                    </div>

                    <div className="h-px bg-gray-100 my-1"></div>

                    {/* Disclaimer */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Product Disclaimer</label>
                        <textarea
                            name="disclaimer"
                            value={formData.disclaimer}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all resize-y"
                            placeholder="Enter product disclaimer text..."
                        />
                        <p className="text-xs text-gray-500">Handcrafted product variations, color accuracy, and other disclaimers.</p>
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
