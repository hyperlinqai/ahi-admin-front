import { useState, useEffect } from "react";
import { Users, Building2, CreditCard, Truck, BellRing, Loader2, ShieldAlert, SlidersHorizontal, ScrollText } from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { settingsApi } from "../api/settings";

import UsersManagement from "../components/Settings/UsersManagement";
import StoreInfoTab from "../components/Settings/StoreInfoTab";
import StoreDefaultsTab from "../components/Settings/StoreDefaultsTab";
import PaymentTab from "../components/Settings/PaymentTab";
import ShippingTab from "../components/Settings/ShippingTab";
import NotificationsTab from "../components/Settings/NotificationsTab";
import StorePoliciesTab from "../components/Settings/StorePoliciesTab";

type TabId = "store" | "defaults" | "payment" | "shipping" | "policies" | "notifications" | "users";

interface Tab {
    id: TabId;
    label: string;
    icon: any;
    description: string;
    adminOnly?: boolean;
}

const tabs: Tab[] = [
    {
        id: "store",
        label: "Store Information",
        icon: Building2,
        description: "Store name, branding, and contact details",
    },
    {
        id: "defaults",
        label: "Units & Order Format",
        icon: SlidersHorizontal,
        description: "Measurement units and order ID configuration",
    },
    {
        id: "payment",
        label: "Payment & Checkout",
        icon: CreditCard,
        description: "Razorpay keys, COD toggle, and wallet status",
    },
    {
        id: "shipping",
        label: "Shipping & Delivery",
        icon: Truck,
        description: "Default charges and free shipping thresholds",
    },
    {
        id: "policies",
        label: "Store Policies",
        icon: ScrollText,
        description: "Jewellery care, shipping info, and return policies",
    },
    {
        id: "notifications",
        label: "Notifications",
        icon: BellRing,
        description: "Email, SMS, and WhatsApp event triggers",
    },
    {
        id: "users",
        label: "Team & Admins",
        icon: Users,
        description: "Manage admin users and staff permissions",
        adminOnly: true,
    },
];

export default function Settings() {
    const { user } = useAuthStore() as { user: any };
    const [activeTab, setActiveTab] = useState<TabId>("store");
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const visibleTabs = tabs.filter(tab => !tab.adminOnly || user?.role === "ADMIN");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await settingsApi.getSettings();
            setSettings(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings data");
        } finally {
            setIsLoading(false);
        }
    };

    const { addNotification } = useNotificationStore();

    const handleSave = async (updatedData: any) => {
        const tabLabel = visibleTabs.find(t => t.id === activeTab)?.label || "Settings";
        try {
            setIsSaving(true);
            const mergedSettings = { ...settings, ...updatedData };
            const res = await settingsApi.updateSettings(mergedSettings);
            setSettings(res.data);

            addNotification({
                title: `${tabLabel} updated`,
                message: `${tabLabel} has been updated successfully.`,
                type: "success",
            });
        } catch (error) {
            console.error(error);

            addNotification({
                title: `Update failed`,
                message: `Could not save ${tabLabel}. Please try again.`,
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    System Settings
                </h1>
                <p className="text-gray-500 mt-2 text-sm max-w-xl leading-relaxed">
                    Configure your admin panel, manage team access, and customize your store's underlying operations.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Tabs Sidebar */}
                <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-2">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all duration-200 ${activeTab === tab.id
                                ? "bg-white shadow-sm border border-gray-200/60 ring-1 ring-[#c49a3c]/30"
                                : "hover:bg-white/60 border border-transparent"
                                }`}
                        >
                            <tab.icon
                                className={`h-5 w-5 mt-0.5 ${activeTab === tab.id ? "text-[#c49a3c]" : "text-gray-400"}`}
                                strokeWidth={activeTab === tab.id ? 2 : 1.5}
                            />
                            <div>
                                <h3 className={`text-sm font-semibold ${activeTab === tab.id ? "text-gray-900" : "text-gray-600"}`}>
                                    {tab.label}
                                </h3>
                                <p className={`text-xs mt-0.5 ${activeTab === tab.id ? "text-gray-600" : "text-gray-400"}`}>
                                    {tab.description}
                                </p>
                            </div>
                        </button>
                    ))}

                    {/* Admin Access Warning Badge */}
                    {user?.role !== "ADMIN" && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
                            <ShieldAlert className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500 leading-relaxed">Contact a system administrator to access advanced settings and team management.</p>
                        </div>
                    )}
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="glass-card min-h-[600px] flex flex-col">
                        {/* Tab Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100/60 flex items-center gap-4 bg-white/40 rounded-t-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-white shadow-sm flex items-center justify-center shrink-0">
                                {visibleTabs.find(t => t.id === activeTab) && (() => {
                                    const Icon = visibleTabs.find(t => t.id === activeTab)!.icon;
                                    return <Icon className="h-6 w-6 text-gray-600" strokeWidth={1.5} />;
                                })()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {visibleTabs.find(t => t.id === activeTab)?.label}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {visibleTabs.find(t => t.id === activeTab)?.description}
                                </p>
                            </div>
                        </div>

                        {/* Dynamic Content */}
                        <div className="flex-1 p-6 md:p-8">
                            {isLoading ? (
                                <div className="h-full min-h-[400px] flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-gold-500" />
                                </div>
                            ) : (
                                <>
                                    {activeTab === "store" && (
                                        <StoreInfoTab data={settings} onSave={handleSave} isSaving={isSaving} />
                                    )}
                                    {activeTab === "defaults" && (
                                        <StoreDefaultsTab data={settings} onSave={handleSave} isSaving={isSaving} />
                                    )}
                                    {activeTab === "payment" && (
                                        <PaymentTab data={settings} onSave={handleSave} isSaving={isSaving} />
                                    )}
                                    {activeTab === "shipping" && (
                                        <ShippingTab data={settings} onSave={handleSave} isSaving={isSaving} />
                                    )}
                                    {activeTab === "policies" && (
                                        <StorePoliciesTab data={settings} onSave={handleSave} isSaving={isSaving} />
                                    )}
                                    {activeTab === "notifications" && (
                                        <NotificationsTab data={settings} onSave={handleSave} isSaving={isSaving} />
                                    )}
                                    {activeTab === "users" && <UsersManagement />}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
