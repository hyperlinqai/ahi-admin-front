import React, { useState, useEffect } from "react";
import { Save, Loader2, Key, Wallet, Banknote } from "lucide-react";

interface PaymentTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

export default function PaymentTab({ data, onSave, isSaving }: PaymentTabProps) {
    const [formData, setFormData] = useState({
        razorpayKeyId: "",
        razorpayKeySecret: "",
        codEnabled: true,
        walletEnabled: true,
    });

    useEffect(() => {
        if (data && data.payment) {
            setFormData({
                razorpayKeyId: data.payment.razorpayKeyId || "",
                razorpayKeySecret: data.payment.razorpayKeySecret || "", // Keep hidden unless explicitly changing
                codEnabled: data.payment.codEnabled ?? true,
                walletEnabled: data.payment.walletEnabled ?? true,
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Only send secret if it was actively edited
        const paymentPayload: any = {
            razorpayKeyId: formData.razorpayKeyId,
            codEnabled: formData.codEnabled,
            walletEnabled: formData.walletEnabled,
        };

        if (formData.razorpayKeySecret && !formData.razorpayKeySecret.startsWith("••••")) {
            paymentPayload.razorpayKeySecret = formData.razorpayKeySecret;
        }

        onSave({ payment: paymentPayload });
    };

    // Mask the key ID for display unless empty
    const displayKeyId = formData.razorpayKeyId 
        ? `${formData.razorpayKeyId.substring(0, 8)}••••••••••••` 
        : "";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            {/* Razorpay Setup */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-gray-400" />
                        Razorpay Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Connect your Razorpay account to process online credit/debit/UPI payments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">Key ID</label>
                        <input
                            type="text"
                            name="razorpayKeyId"
                            defaultValue={displayKeyId}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all font-mono placeholder:font-sans"
                            placeholder="rzp_test_..."
                        />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">Key Secret</label>
                        <input
                            type="password"
                            name="razorpayKeySecret"
                            placeholder={formData.razorpayKeyId ? "••••••••••••••••••••••••••••" : "Enter Secret..."}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all font-mono placeholder:font-sans"
                        />
                        <p className="text-xs text-gray-400">Leave blank to maintain previous secret.</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Offline & Wallet Options */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-gray-400" />
                        Alternative Methods
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Enable or disable additional checkout options for your customers.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* COD Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Banknote className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Cash on Delivery (COD)</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Allow customers to pay upon receiving the order.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="codEnabled"
                                checked={formData.codEnabled}
                                onChange={handleChange} 
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold-500"></div>
                        </label>
                    </div>

                    {/* Wallet Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Store Wallet</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Customers can deposit and pay from an internal wallet balance.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="walletEnabled"
                                checked={formData.walletEnabled}
                                onChange={handleChange} 
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold-500"></div>
                        </label>
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
