import React, { useState, useEffect } from "react";
import { Save, Loader2, IndianRupee, Globe } from "lucide-react";

interface ShippingTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

interface ShippingForm {
    defaultCharge: number;
    freeThreshold: number;
    codExtraCharge: number;
    intlEnabled: boolean;
    intlCharge: number;
    intlFreeThreshold: number;
    intlCodEnabled: boolean;
}

const DEFAULTS: ShippingForm = {
    defaultCharge: 0,
    freeThreshold: 0,
    codExtraCharge: 0,
    intlEnabled: true,
    intlCharge: 2500,
    intlFreeThreshold: 21000,
    intlCodEnabled: false,
};

function MoneyInput({
    label,
    name,
    value,
    onChange,
    hint,
}: {
    label: string;
    name: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hint?: string;
}) {
    return (
        <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-gray-900">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="number"
                    name={name}
                    value={value === 0 ? "" : value}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-gold-500/20 focus:border-brand-gold-500 outline-none transition-all"
                    placeholder="0"
                />
            </div>
            {hint && <p className="text-xs text-gray-500 text-balance">{hint}</p>}
        </div>
    );
}

function Toggle({
    label,
    checked,
    onChange,
    hint,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    hint?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <label className="text-sm font-semibold text-gray-900">{label}</label>
                {hint && <p className="text-xs text-gray-500 mt-1 text-balance">{hint}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                    checked ? "bg-brand-gold-500" : "bg-gray-300"
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}

export default function ShippingTab({ data, onSave, isSaving }: ShippingTabProps) {
    const [formData, setFormData] = useState<ShippingForm>(DEFAULTS);

    useEffect(() => {
        if (data && data.shipping) {
            setFormData({
                defaultCharge: data.shipping.defaultCharge ?? DEFAULTS.defaultCharge,
                freeThreshold: data.shipping.freeThreshold ?? DEFAULTS.freeThreshold,
                codExtraCharge: data.shipping.codExtraCharge ?? DEFAULTS.codExtraCharge,
                intlEnabled: data.shipping.intlEnabled ?? DEFAULTS.intlEnabled,
                intlCharge: data.shipping.intlCharge ?? DEFAULTS.intlCharge,
                intlFreeThreshold: data.shipping.intlFreeThreshold ?? DEFAULTS.intlFreeThreshold,
                intlCodEnabled: data.shipping.intlCodEnabled ?? DEFAULTS.intlCodEnabled,
            });
        }
    }, [data]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === "" ? 0 : parseInt(value, 10);
        if (!isNaN(numValue)) {
            setFormData((prev) => ({ ...prev, [name]: numValue }));
        }
    };

    const setToggle = (key: keyof ShippingForm) => (v: boolean) =>
        setFormData((prev) => ({ ...prev, [key]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ shipping: { ...formData } });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 max-w-xl">
            {/* ── Domestic (India) ── */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Domestic Shipping (India)</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        How shipping costs apply to orders delivered within India.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    <MoneyInput
                        label="Standard Delivery Base Fee"
                        name="defaultCharge"
                        value={formData.defaultCharge}
                        onChange={handleNumberChange}
                        hint="The amount charged for shipping on domestic orders."
                    />
                    <MoneyInput
                        label="Free Shipping Min. Order Value"
                        name="freeThreshold"
                        value={formData.freeThreshold}
                        onChange={handleNumberChange}
                        hint="If the cart subtotal reaches this amount, the base fee drops to ₹0. Keep at 0 to disable free shipping."
                    />
                    <MoneyInput
                        label="Cash on Delivery Surcharge"
                        name="codExtraCharge"
                        value={formData.codExtraCharge}
                        onChange={handleNumberChange}
                        hint="Extra amount added when the customer chooses Cash on Delivery."
                    />
                </div>
            </div>

            {/* ── International ── */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-brand-gold-500" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">International Shipping</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Rules for orders shipped outside India (DHL / FedEx).
                        </p>
                    </div>
                </div>

                <Toggle
                    label="Enable International Shipping"
                    checked={formData.intlEnabled}
                    onChange={setToggle("intlEnabled")}
                    hint="Allow customers with a non-India delivery address to place orders."
                />

                <div className={formData.intlEnabled ? "flex flex-col gap-6" : "flex flex-col gap-6 opacity-50 pointer-events-none"}>
                    <MoneyInput
                        label="International Shipping Charge"
                        name="intlCharge"
                        value={formData.intlCharge}
                        onChange={handleNumberChange}
                        hint="Flat charge applied to international orders below the free-shipping threshold."
                    />
                    <MoneyInput
                        label="International Free Shipping Min. Order Value"
                        name="intlFreeThreshold"
                        value={formData.intlFreeThreshold}
                        onChange={handleNumberChange}
                        hint="International orders at or above this value ship free. Keep at 0 to always charge."
                    />
                    <Toggle
                        label="Allow COD on International Orders"
                        checked={formData.intlCodEnabled}
                        onChange={setToggle("intlCodEnabled")}
                        hint="Cash on Delivery is normally unavailable for international orders. Leave off to keep it disabled."
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
