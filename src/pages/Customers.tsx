import { useState, useEffect } from "react";
import api from "../api/axios";
import { UserDetailDrawer } from "../components/Users/UserDetailDrawer";
import { Search, Filter, Mail, Shield, ShieldAlert, MoreVertical, Loader2, User as UserIcon, CheckCircle2 } from "lucide-react";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN";
    isBlocked: boolean;
    isVerified: boolean;
    createdAt: string;
    wallet: { balance: number } | null;
    _count: { orders: number };
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Drawer State
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchUsers = () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");
        if (search) params.append("search", search);
        params.append("role", "USER"); // Only fetch Customers
        if (statusFilter) params.append("status", statusFilter);

        api.get(`/users?${params.toString()}`)
            .then((res) => {
                setUsers(res.data.data);
                setTotalPages(res.data.meta.totalPages);
            })
            .catch((err) => console.error("Failed to load users", err))
            .finally(() => setLoading(false));
    };

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1); // Reset to page 1 on new search/filter
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, page]);

    const handleOpenDrawer = (id: string) => {
        setSelectedUserId(id);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedUserId(null), 300); // Wait for animation
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header section with modern glassmorphism */}
            <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#d4a853]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                        Customers
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-md leading-relaxed">
                        Manage your store's registered customers. View order histories and handle account restrictions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a3c]/20 focus:border-[#c49a3c] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500 border-r border-gray-100">
                        <Filter className="h-3.5 w-3.5" /> Filters
                    </div>
                </div>

                <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setStatusFilter("")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === "" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("active")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === "active" ? "bg-green-50 text-green-700" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter("blocked")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === "blocked" ? "bg-red-50 text-red-700" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Blocked
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Orders / Wallet</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-[#d4a853] animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 font-medium">Loading users...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <UserIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-900 font-semibold mb-1">No users found</p>
                                        <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => handleOpenDrawer(user.id)}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-sm">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5 opacity-50" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {user.name || "Unnamed User"}
                                                        </p>
                                                        {user.isVerified && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="truncate max-w-[180px]">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 space-y-2">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${user.role === "ADMIN"
                                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                                    }`}>
                                                    {user.role === "ADMIN" ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                    {user.role}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${user.isBlocked
                                                    ? "bg-red-50 text-red-600 border border-red-100"
                                                    : "bg-green-50 text-green-600 border border-green-100"
                                                    }`}>
                                                    {user.isBlocked ? "Blocked" : "Active"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <p className="text-sm font-semibold text-gray-900">{user._count?.orders || 0} Orders</p>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium">₹{user.wallet?.balance?.toFixed(2) || "0.00"} Balance</p>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDrawer(user.id);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-[#d4a853] hover:bg-[#d4a853]/10 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Slide-out Drawer */}
            <UserDetailDrawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                userId={selectedUserId}
                onStatusChange={fetchUsers}
            />
        </div>
    );
}
