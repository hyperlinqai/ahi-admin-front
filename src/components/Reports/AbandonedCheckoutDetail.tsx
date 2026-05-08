import React from "react";
import { ArrowLeft, ShoppingCart, Printer, ChevronUp, ChevronDown, Copy, User, Mail, Phone, MapPin, Truck } from "lucide-react";

interface AbandonedCheckoutDetailProps {
    record: any;
    onBack: () => void;
}

export default function AbandonedCheckoutDetail({ record, onBack }: AbandonedCheckoutDetailProps) {
    const isGuest = record.type === "GUEST_CART";
    const titleId = record.orderNumber || record.id.split("-")[0].toUpperCase();
    const subtotal = record.subtotal || record.totalValue;
    const discount = record.discount || 0;
    const tax = record.tax || 0;
    const shipping = record.shipping || 0;
    
    // Derived values
    const dateStr = new Date(record.createdAt).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
    });
    const total = record.totalValue;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5 text-gray-400" />
                            <h2 className="text-xl font-bold text-gray-900">#{titleId}</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                                Not Recovered
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 pl-8">
                            India, {dateStr}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors">
                        Print
                    </button>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Checkout Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-gray-900 text-lg">Checkout details</h3>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                                <Copy className="w-4 h-4" /> Copy checkout URL
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 font-medium">From Online Store</p>

                        <div className="space-y-4 mb-6">
                            {record.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ShoppingCart className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-gray-900 font-medium">
                                                ₹{item.price.toLocaleString()} × {item.quantity} &nbsp;&nbsp;
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-md">
                                                {item.variant?.split(":")[1]?.trim() || item.variant || "Standard"}
                                            </span>
                                        </div>
                                        {item.sku && (
                                            <p className="text-xs text-gray-500 mt-2">SKU: {item.sku}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <div className="text-right">
                                    <span className="text-gray-500 mr-8">{record.itemCount} item{record.itemCount !== 1 && 's'}</span>
                                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <div className="text-right">
                                    <span className="text-gray-500 mr-8">Standard (0.0 kg)</span>
                                    <span className="font-medium text-gray-900">₹{shipping.toLocaleString()}</span>
                                </div>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <div className="text-right">
                                        <span className="font-medium text-red-600">-₹{discount.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            {tax > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Estimated tax</span>
                                    <div className="text-right flex flex-col">
                                        <span className="font-medium text-gray-900">₹{tax.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100">
                                <span className="text-gray-900">Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-4">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-700">To be paid by customer</span>
                                <span className="text-gray-900">₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Automations */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">Automations</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Automations triggered by this abandoned checkout. <a href="#" className="underline hover:text-gray-700">Learn more</a>
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-brand-gold-600">Abandoned checkout</span>
                                <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    View runs
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">You left items at checkout</span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                                    Not sent
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Customer</h3>
                        <div className="mb-6">
                            <a href="#" className="text-sm font-medium text-brand-gold-600 hover:underline">{record.customerName}</a>
                            <p className="text-sm text-gray-500 mt-1">No orders</p>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact information</h4>
                            {record.customerEmail && record.customerEmail !== "N/A" ? (
                                <p className="text-sm text-brand-gold-600 hover:underline cursor-pointer mb-1">{record.customerEmail}</p>
                            ) : (
                                <p className="text-sm text-gray-500 mb-1">No email provided</p>
                            )}
                            {record.customerPhone && record.customerPhone !== "N/A" ? (
                                <p className="text-sm text-gray-700 mb-1">{record.customerPhone}</p>
                            ) : (
                                <p className="text-sm text-gray-500 mb-1">No phone provided</p>
                            )}
                            <p className="text-sm text-gray-500">No account</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">Shipping address</h4>
                                <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>
                            {record.address ? (
                                <div className="text-sm text-gray-700 space-y-0.5">
                                    <p>{record.address.fullName || record.customerName}</p>
                                    <p>{record.address.addressLine1}</p>
                                    {record.address.addressLine2 && <p>{record.address.addressLine2}</p>}
                                    <p>{record.address.pincode} {record.address.city}</p>
                                    <p>{record.address.state}</p>
                                    <p>{record.address.country || "India"}</p>
                                    <p>{record.address.phone}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No shipping address provided</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Billing address</h4>
                            <p className="text-sm text-gray-500">Same as shipping address</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Marketing</h4>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full border border-gray-200">
                                    <div className="w-2 h-2 rounded-full border border-gray-400"></div>
                                    <span className="text-xs font-medium text-gray-600">Email</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full border border-gray-200">
                                    <div className="w-2 h-2 rounded-full border border-gray-400"></div>
                                    <span className="text-xs font-medium text-gray-600">SMS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
