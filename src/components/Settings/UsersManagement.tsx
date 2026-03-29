import { useState, useEffect } from "react";
import { Loader2, ShieldAlert, Plus, Ban, CheckCircle2, Trash2, Mail } from "lucide-react";
import api from "../../api/axios";
import { CreateUserModal } from "./CreateUserModal";

interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "MANAGER" | "SUPPORT" | "CATALOG_MANAGER";
    isBlocked: boolean;
    createdAt: string;
}

export default function UsersManagement() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchAdmins = () => {
        setLoading(true);
        api.get('/users?role=ADMIN&limit=50')
            .then(res => setAdmins(res.data.data))
            .catch(err => console.error("Failed to load admins", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleToggleBlock = async (user: AdminUser) => {
        if (!user.isBlocked && !window.confirm(`Are you sure you want to block admin access for ${user.email}?`)) return;

        setActionLoadingId(user.id);
        try {
            const endpoint = user.isBlocked ? `/users/${user.id}/unblock` : `/users/${user.id}/block`;
            await api.patch(endpoint);
            fetchAdmins();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to change status. You cannot block yourself.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (user: AdminUser) => {
        if (!window.confirm(`CRITICAL: Revoke all access and delete admin ${user.email}?`)) return;

        setActionLoadingId(user.id);
        try {
            await api.delete(`/users/${user.id}`);
            fetchAdmins();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete user. You cannot delete yourself.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Action Bar */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                    <h3 className="text-md font-bold text-gray-900">Administrator Accounts</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Manage users with full dashboard access.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                    <Plus className="h-4 w-4" /> Add Admin
                </button>
            </div>

            {/* Admin Table */}
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Name</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <Loader2 className="h-6 w-6 text-[#d4a853] animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">Loading administrators...</p>
                                </td>
                            </tr>
                        ) : admins.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-gray-500 text-sm">
                                    No admin users found.
                                </td>
                            </tr>
                        ) : (
                            admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {admin.name ? admin.name.charAt(0).toUpperCase() : <ShieldAlert className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{admin.name || "System Admin"}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">Added {new Date(admin.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{admin.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${admin.isBlocked
                                                ? "bg-red-50 text-red-600 border border-red-100"
                                                : "bg-green-50 text-green-600 border border-green-100"
                                            }`}>
                                            {admin.isBlocked ? <Ban className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                            {admin.isBlocked ? "Revoked" : "Active"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleBlock(admin)}
                                                disabled={actionLoadingId === admin.id}
                                                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${admin.isBlocked
                                                        ? "text-green-600 hover:bg-green-50"
                                                        : "text-orange-600 hover:bg-orange-50"
                                                    }`}
                                            >
                                                {actionLoadingId === admin.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (admin.isBlocked ? "Restore Access" : "Revoke Access")}
                                            </button>
                                            <div className="w-px h-4 bg-gray-200" />
                                            <button
                                                onClick={() => handleDelete(admin)}
                                                disabled={actionLoadingId === admin.id}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchAdmins();
                }}
            />
        </div>
    );
}
