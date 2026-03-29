import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, ShieldAlert, Mail, MapPin, Calendar, CreditCard, ShoppingBag, Loader2, X, Ban, Trash2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";

interface UserDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    onStatusChange: () => void;
}

export const UserDetailDrawer = ({ isOpen, onClose, userId, onStatusChange }: UserDetailDrawerProps) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            api.get(`/users/${userId}`)
                .then((res) => {
                    setUser(res.data.data);
                })
                .catch((err) => {
                    console.error("Failed to fetch user details", err);
                })
                .finally(() => setLoading(false));
        } else {
            setUser(null);
        }
    }, [isOpen, userId]);

    const handleToggleBlock = async () => {
        if (!user) return;

        // Confirmation for unblocking is less critical than blocking
        if (!user.isBlocked && !window.confirm(`Are you sure you want to block ${user.name || user.email}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            const endpoint = user.isBlocked ? `/users/${user.id}/unblock` : `/users/${user.id}/block`;
            await api.patch(endpoint);

            // Update local state to reflect change instantly
            setUser({ ...user, isBlocked: !user.isBlocked });
            onStatusChange(); // Tell parent list to refresh or update its state
        } catch (error) {
            console.error("Action failed", error);
            alert("Failed to change user status. They might be an admin.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        if (!window.confirm(`CRITICAL WARNING: Are you entirely sure you want to DELETE ${user.email} from the database? This cannot be undone.`)) {
            return;
        }

        setActionLoading(true);
        try {
            await api.delete(`/users/${user.id}`);
            onStatusChange(); // Parent needs to remove them from the list
            onClose(); // Close drawer
        } catch (error: any) {
            console.error("Delete failed", error);
            alert(error.response?.data?.message || "Failed to delete user. Ensure they have no placed orders.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[100]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/80">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
                                <p className="text-sm text-gray-500">View and manage account details</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <Loader2 className="h-8 w-8 text-[#d4a853] animate-spin" />
                                    <p className="text-sm text-gray-500">Loading user profile...</p>
                                </div>
                            ) : user ? (
                                <>
                                    {/* Primary Info Card */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4a853]/20 to-[#a17f2e]/20 flex items-center justify-center flex-shrink-0 border border-[#d4a853]/20">
                                            <User className="h-8 w-8 text-[#c49a3c]" strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                                    {user.name || "Unnamed User"}
                                                </h3>
                                                {user.isVerified && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                                                <Mail className="h-3.5 w-3.5" />
                                                {user.email}
                                            </p>

                                            <div className="flex items-center gap-2 mt-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${user.role === "ADMIN"
                                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                                    }`}>
                                                    {user.role === "ADMIN" ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                    {user.role}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${user.isBlocked
                                                    ? "bg-red-50 text-red-600 border border-red-100"
                                                    : "bg-green-50 text-green-600 border border-green-100"
                                                    }`}>
                                                    {user.isBlocked ? "Blocked" : "Active"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                                <ShoppingBag className="h-4 w-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{user._count?.orders || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                                <CreditCard className="h-4 w-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">₹{user.wallet?.balance?.toFixed(2) || "0.00"}</p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 col-span-2">
                                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">Join Date</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(user.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Default Address */}
                                    {user.addresses && user.addresses.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Default Shipping Address</h4>
                                            <div className="border border-gray-100 rounded-xl p-4 bg-white flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-[#d4a853] shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.addresses[0].fullName}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{user.addresses[0].addressLine1}</p>
                                                    {user.addresses[0].addressLine2 && <p className="text-xs text-gray-500">{user.addresses[0].addressLine2}</p>}
                                                    <p className="text-xs text-gray-500">{user.addresses[0].city}, {user.addresses[0].state} - {user.addresses[0].pincode}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Phone: {user.addresses[0].phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Orders Overview */}
                                    {user.orders && user.orders.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Orders (Latest 5)</h4>
                                            <div className="space-y-3">
                                                {user.orders.map((order: any) => (
                                                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 bg-white flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-[#d4a853]">₹{order.total.toFixed(2)}</p>
                                                            <span className="text-[10px] font-medium text-gray-500">{order.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </>
                            ) : (
                                <div className="text-center text-red-500">Failed to load user data</div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {user && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                                <button
                                    onClick={handleToggleBlock}
                                    disabled={actionLoading}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${user.isBlocked
                                        ? "bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20"
                                        : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                                        }`}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isBlocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                    {user.isBlocked ? "Unblock User" : "Block User"}
                                </button>

                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading || user.role === 'ADMIN'}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={user.role === 'ADMIN' ? "Cannot delete admin accounts" : "Permanently Delete"}
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
