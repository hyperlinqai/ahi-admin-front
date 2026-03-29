import { useState, useEffect } from "react";
import { reportsApi } from "../../api/reports";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "../../utils";

export default function InventoryTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    const fetchInventoryData = async () => {
        try {
            setIsLoading(true);
            const res = await reportsApi.getInventoryReport();
            setData(res.data?.inventory || []);
        } catch (error) {
            console.error("Failed to fetch inventory data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const handleExport = () => {
        reportsApi.downloadCSV("inventory");
    };

    const LOW_STOCK_THRESHOLD = 10;

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900">Current Stock Levels</h3>
                    <p className="text-sm text-gray-500">Monitor product inventory and identify low stock items.</p>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden border border-gray-100 rounded-xl bg-white shadow-sm">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Product ID / SKU</th>
                            <th className="px-6 py-4 w-full">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Price</th>
                            <th className="px-6 py-4 text-right">Stock</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    <div className="flex justify-center mb-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-brand-gold-500" />
                                    </div>
                                    Loading inventory...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    No products found in inventory.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => {
                                const isLowStock = item.stock <= LOW_STOCK_THRESHOLD;
                                const isOutOfStock = item.stock === 0;

                                return (
                                    <tr 
                                        key={item.id} 
                                        className={cn(
                                            "hover:bg-gray-50/50 transition-colors",
                                            isOutOfStock && "bg-red-50/20"
                                        )}
                                    >
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {item.sku || item.id.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate">
                                            {item.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {item.category?.name || "Uncategorized"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 text-right">
                                            ₹{(item.price || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            <span className={cn(
                                                isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-gray-900"
                                            )}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-center">
                                            {isOutOfStock ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Out of Stock
                                                </div>
                                            ) : isLowStock ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    Low Stock
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    In Stock
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
