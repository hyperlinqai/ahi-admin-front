import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface LowStockVariant {
    id: string;
    sku: string;
    stock: number;
    lowStockAlert: number;  // field from raw SQL query
    title: string;          // product title from JOIN
}

export const LowStockAlerts = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<LowStockVariant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/inventory/low-stock?limit=6")
            .then(res => setItems(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="glass-card p-5 flex flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Low Stock Alerts</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Variants running low</p>
                </div>
                <button
                    onClick={() => navigate("/inventory")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                    title="View inventory"
                >
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                </div>
            ) : items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10 flex-col gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">All stock levels are healthy</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 flex-1">
                    {items.map((item, index) => {
                        const threshold = item.lowStockAlert || 5;
                        const percentage = Math.min((item.stock / threshold) * 100, 100);
                        const isUrgent = item.stock === 0 || item.stock <= 2;

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-2 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate("/inventory")}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-gray-800 truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400">{item.sku}</p>
                                    </div>
                                    <span
                                        className={`text-xs font-bold flex-shrink-0 ml-2 px-2 py-0.5 rounded-md ${
                                            isUrgent
                                                ? item.stock === 0
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-orange-50 text-orange-600"
                                                : "bg-amber-50 text-amber-600"
                                        }`}
                                    >
                                        {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.6 + index * 0.05,
                                        }}
                                        className={`h-full rounded-full ${
                                            item.stock === 0
                                                ? "bg-red-400"
                                                : isUrgent
                                                ? "bg-orange-400"
                                                : "bg-amber-400"
                                        }`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
