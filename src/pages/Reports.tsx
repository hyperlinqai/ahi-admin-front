import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Package, RotateCcw, ShoppingBag } from "lucide-react";

// We will build these out in subsequent steps
import SalesTab from "../components/Reports/SalesTab";
import InventoryTab from "../components/Reports/InventoryTab";
import CustomersTab from "../components/Reports/CustomersTab";
import ReturnsTab from "../components/Reports/ReturnsTab";
import AbandonedCheckoutsTab from "../components/Reports/AbandonedCheckoutsTab";

type TabType = "sales" | "inventory" | "customers" | "returns" | "abandoned";

export default function Reports() {
    const [activeTab, setActiveTab] = useState<TabType>("sales");

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: "sales", label: "Sales & Revenue", icon: <TrendingUp className="h-4 w-4" /> },
        { id: "inventory", label: "Inventory Analysis", icon: <Package className="h-4 w-4" /> },
        { id: "customers", label: "Customer Insights", icon: <Users className="h-4 w-4" /> },
        { id: "returns", label: "Returns Processing", icon: <RotateCcw className="h-4 w-4" /> },
        { id: "abandoned", label: "Abandoned Checkouts", icon: <ShoppingBag className="h-4 w-4" /> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-brand-gold-500" />
                        Reports & Analytics
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Comprehensive insights into your business metrics.
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-medium transition-colors relative ${
                            activeTab === tab.id
                                ? "text-brand-gold-600"
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabReports"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold-500"
                                initial={false}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 min-h-[500px]">
                {activeTab === "sales" && <SalesTab />}
                {activeTab === "inventory" && <InventoryTab />}
                {activeTab === "customers" && <CustomersTab />}
                {activeTab === "returns" && <ReturnsTab />}
                {activeTab === "abandoned" && <AbandonedCheckoutsTab />}
            </div>
        </motion.div>
    );
}
