import React, { useState, useEffect } from "react";
import { Save, Loader2, Key, Wallet, Banknote, CreditCard, IndianRupee } from "lucide-react";

interface PaymentTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

export default function PaymentTab({ data, onSave, isSaving }: PaymentTabProps) {
    const [formData, setFormData] = useState({
        razorpayKeyId: "",
        razorpayKeySecret: "",
        paypalClientId: "",
        paypalClientSecret: "",
        codEnabled: true,
        paypalEnabled: false,
        walletEnabled: true,
        codTransactionCharge: 0,
        razorpayTransactionCharge: 0,
        paypalTransactionCharge: 0,
    });

    useEffect(() => {
        if (data && data.payment) {
            setFormData({
                razorpayKeyId: data.payment.razorpayKeyId || "",
                razorpayKeySecret: data.payment.razorpayKeySecret || "",
                paypalClientId: data.payment.paypalClientId || "",
                paypalClientSecret: data.payment.paypalClientSecret || "",
                codEnabled: data.payment.codEnabled ?? true,
                paypalEnabled: data.payment.paypalEnabled ?? false,
                walletEnabled: data.payment.walletEnabled ?? true,
                codTransactionCharge: data.payment.codTransactionCharge ?? 0,
                razorpayTransactionCharge: data.payment.razorpayTransactionCharge ?? 0,
                paypalTransactionCharge: data.payment.paypalTransactionCharge ?? 0,
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === "number") {
            const numValue = value === "" ? 0 : parseFloat(value);
            if (!isNaN(numValue)) {
                setFormData(prev => ({ ...prev, [name]: numValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const paymentPayload: any = {
            razorpayKeyId: formData.razorpayKeyId,
            codEnabled: formData.codEnabled,
            paypalEnabled: formData.paypalEnabled,
            walletEnabled: formData.walletEnabled,
            paypalClientId: formData.paypalClientId,
            codTransactionCharge: formData.codTransactionCharge,
            razorpayTransactionCharge: formData.razorpayTransactionCharge,
            paypalTransactionCharge: formData.paypalTransactionCharge,
        };

        if (formData.razorpayKeySecret && !formData.razorpayKeySecret.startsWith("••••")) {
            paymentPayload.razorpayKeySecret = formData.razorpayKeySecret;
        }

        if (formData.paypalClientSecret && !formData.paypalClientSecret.startsWith("••••")) {
            paymentPayload.paypalClientSecret = formData.paypalClientSecret;
        }

        onSave({ payment: paymentPayload });
    };

    const displayKeyId = formData.razorpayKeyId
        ? `${formData.razorpayKeyId.substring(0, 8)}••••••••••••`
        : "";

    const displayPaypalClientId = formData.paypalClientId
        ? `${formData.paypalClientId.substring(0, 10)}••••••••••••`
        : "";

    const toggleClass = "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold-500";
    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all font-mono placeholder:font-sans";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            {/* ── Razorpay Configuration ── */}
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
                            className={inputClass}
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
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400">Leave blank to maintain previous secret.</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── PayPal Configuration ── */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        PayPal Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Connect your PayPal account for international payments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">Client ID</label>
                        <input
                            type="text"
                            name="paypalClientId"
                            defaultValue={displayPaypalClientId}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="AaBbCcDd..."
                        />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900">Client Secret</label>
                        <input
                            type="password"
                            name="paypalClientSecret"
                            placeholder={formData.paypalClientId ? "••••••••••••••••••••••••••••" : "Enter Secret..."}
                            onChange={handleChange}
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400">Leave blank to maintain previous secret.</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── Payment Method Toggles ── */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-gray-400" />
                        Payment Methods
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Enable or disable payment options for your customers.
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
                            <input type="checkbox" name="codEnabled" checked={formData.codEnabled} onChange={handleChange} className="sr-only peer" />
                            <div className={toggleClass}></div>
                        </label>
                    </div>

                    {/* PayPal Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                <CreditCard className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">PayPal</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Accept international payments via PayPal.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="paypalEnabled" checked={formData.paypalEnabled} onChange={handleChange} className="sr-only peer" />
                            <div className={toggleClass}></div>
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
                            <input type="checkbox" name="walletEnabled" checked={formData.walletEnabled} onChange={handleChange} className="sr-only peer" />
                            <div className={toggleClass}></div>
                        </label>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── Transaction Charges ── */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-gray-400" />
                        Transaction Charges
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Set extra charges per payment method. These are added to the order total at checkout.
                    </p>
                </div>

                <div className="space-y-5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    {/* COD Charge */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">COD Surcharge</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="codTransactionCharge"
                                value={formData.codTransactionCharge === 0 ? "" : formData.codTransactionCharge}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Extra fee applied to Cash on Delivery orders.</p>
                    </div>

                    {/* Razorpay Charge */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">Razorpay Transaction Charge</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="razorpayTransactionCharge"
                                value={formData.razorpayTransactionCharge === 0 ? "" : formData.razorpayTransactionCharge}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Extra fee applied to Razorpay online payments (UPI, cards, net banking).</p>
                    </div>

                    {/* PayPal Charge */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900">PayPal Transaction Charge</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="paypalTransactionCharge"
                                value={formData.paypalTransactionCharge === 0 ? "" : formData.paypalTransactionCharge}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Extra fee applied to PayPal payments.</p>
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
