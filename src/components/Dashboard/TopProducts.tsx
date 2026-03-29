import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, Image as ImageIcon } from "lucide-react";
import api from "../../api/axios";

interface TopProduct {
    id: string;
    title: string;
    price: number;
    category: string;
    image: string | null;
    totalSold: number;
    totalRevenue: number;
}

function formatRevenue(val: number): string {
    if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)}Cr`;
    if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)}L`;
    if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
}

export const TopProducts = () => {
    const [products, setProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/dashboard/top-products")
            .then(res => setProducts(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-5 flex flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Top Selling</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Best performing products</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                </div>
            ) : products.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10">
                    <p className="text-xs text-gray-300">No sales data yet</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 flex-1">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                            {/* Rank */}
                            <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0">
                                {index + 1}
                            </span>

                            {/* Image */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <ImageIcon className="h-4 w-4 text-gray-300" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                    {product.title}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    {product.category} · {product.totalSold} sold
                                </p>
                            </div>

                            {/* Revenue */}
                            <span className="text-xs font-bold text-gray-900 flex-shrink-0">
                                {formatRevenue(product.totalRevenue)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
