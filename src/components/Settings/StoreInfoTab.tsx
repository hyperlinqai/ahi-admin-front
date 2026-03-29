import React, { useState, useEffect } from "react";
import { Save, Loader2, Image as ImageIcon, Upload } from "lucide-react";

interface StoreInfoTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

export default function StoreInfoTab({ data, onSave, isSaving }: StoreInfoTabProps) {
    const [formData, setFormData] = useState({
        storeName: "",
        contactEmail: "",
        contactPhone: "",
        gstNumber: "",
        address: "",
        logoUrl: "",
    });

    useEffect(() => {
        if (data && data.store) {
            setFormData({
                storeName: data.store.name || "",
                contactEmail: data.store.contactEmail || "",
                contactPhone: data.store.contactPhone || "",
                gstNumber: data.store.gstNumber || "",
                address: data.store.address || "",
                logoUrl: data.store.logoUrl || "",
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, simulate a logo URL until an actual upload endpoint is wired correctly if it doesn't already exist.
            // Using a generic URL placeholder strategy for demonstration.
            const fakePath = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, logoUrl: fakePath }));
            
            // Note: In reality, you'd upload this file to S3/Cloudinary via an upload endpoint and insert the returned URL here.
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            store: {
                name: formData.storeName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                gstNumber: formData.gstNumber,
                address: formData.address,
                logoUrl: formData.logoUrl,
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Store Information</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        These details are displayed publicly to your customers and used on invoices.
                    </p>
                </div>

                {/* Logo Upload */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-900">Store Logo</label>
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                            {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                                <Upload className="w-4 h-4" />
                                Upload new image
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                            </label>
                            <p className="text-xs text-gray-400 mt-2">
                                Recommended: 512x512px SVG, PNG, or JPG. Max 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">Store Name</label>
                        <input
                            type="text"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                            placeholder="e.g. Ahi Jewellery"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Contact Email</label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                            placeholder="support@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Contact Phone</label>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">GST Number</label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                            placeholder="GSTIN..."
                        />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">Store Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all resize-none"
                            placeholder="Full registered address..."
                        />
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
