import React, { useState, useEffect } from "react";
import { Save, Loader2, Mail, MessageSquare, Smartphone } from "lucide-react";

interface NotificationsTabProps {
    data: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}

type EventType = "orderPlaced" | "orderShipped" | "orderDelivered" | "orderCancelled";
type ChannelType = "email" | "sms" | "whatsapp";

export default function NotificationsTab({ data, onSave, isSaving }: NotificationsTabProps) {
    const [formData, setFormData] = useState<Record<EventType, Record<ChannelType, boolean>>>({
        orderPlaced: { email: true, sms: false, whatsapp: false },
        orderShipped: { email: true, sms: false, whatsapp: false },
        orderDelivered: { email: true, sms: false, whatsapp: false },
        orderCancelled: { email: true, sms: false, whatsapp: false },
    });

    useEffect(() => {
        if (data && data.notifications) {
            setFormData({
                orderPlaced: data.notifications.orderPlaced || { email: true, sms: false, whatsapp: false },
                orderShipped: data.notifications.orderShipped || { email: true, sms: false, whatsapp: false },
                orderDelivered: data.notifications.orderDelivered || { email: true, sms: false, whatsapp: false },
                orderCancelled: data.notifications.orderCancelled || { email: true, sms: false, whatsapp: false },
            });
        }
    }, [data]);

    const handleToggle = (event: EventType, channel: ChannelType) => {
        setFormData(prev => ({
            ...prev,
            [event]: {
                ...prev[event],
                [channel]: !prev[event][channel]
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ notifications: formData });
    };

    const events: { id: EventType; label: string; desc: string }[] = [
        { id: "orderPlaced", label: "Order Placed", desc: "When a customer successfully completes a checkout." },
        { id: "orderShipped", label: "Order Shipped", desc: "When an order status is updated to shipped." },
        { id: "orderDelivered", label: "Order Delivered", desc: "When an origin courier confirms delivery." },
        { id: "orderCancelled", label: "Order Cancelled", desc: "When an order goes into cancellation/RMA." },
    ];

    const channels: { id: ChannelType; label: string; icon: any; color: string }[] = [
        { id: "email", label: "Email", icon: Mail, color: "text-blue-500" },
        { id: "sms", label: "SMS", icon: Smartphone, color: "text-indigo-500" },
        { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-emerald-500" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Communication Preferences</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Select which channels to notify customers through on specific events.
                    </p>
                </div>

                <div className="overflow-hidden border border-gray-100 rounded-2xl">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 w-1/2">Event Trigger</th>
                                {channels.map(channel => (
                                    <th key={channel.id} className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5 justify-center">
                                            <channel.icon className={`w-4 h-4 ${channel.color}`} />
                                            <span className="text-xs font-semibold text-gray-700">{channel.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{event.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 max-w-xs text-balance whitespace-normal">
                                            {event.desc}
                                        </div>
                                    </td>
                                    {channels.map((channel) => {
                                        const isChecked = formData[event.id][channel.id];
                                        return (
                                            <td key={`${event.id}-${channel.id}`} className="px-6 py-4 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={isChecked}
                                                        onChange={() => handleToggle(event.id, channel.id)}
                                                    />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold-500 border border-gray-100"></div>
                                                </label>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800/80">
                    <p><strong>Note:</strong> SMS and WhatsApp notifications require valid API keys configured in the backend environment definitions.</p>
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
