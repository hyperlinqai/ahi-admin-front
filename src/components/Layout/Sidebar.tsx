import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    FolderTree,
    Warehouse,
    Users,
    Ticket,
    Star,
    RotateCcw,
    Image,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    LayoutTemplate,
} from "lucide-react";
import { cn } from "../../utils";
import { useAuthStore } from "../../store/authStore";

const mainNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Products", href: "/products", icon: Package },
    { name: "Categories", href: "/categories", icon: FolderTree },
    { name: "Inventory", href: "/inventory", icon: Warehouse },
];

const managementNav = [
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Coupons", href: "/coupons", icon: Ticket },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Returns", href: "/returns", icon: RotateCcw },
];

const contentNav = [
    { name: "Banners", href: "/banners", icon: Image },
    { name: "Home Layout", href: "/home-layout", icon: LayoutTemplate },
    { name: "CMS Pages", href: "/cms", icon: FileText },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const isActive = (href: string) => {
        if (href === "/") return location.pathname === "/";
        return location.pathname.startsWith(href);
    };

    const renderNavItem = (item: { name: string; href: string; icon: any }) => {
        const active = isActive(item.href);
        return (
            <Link
                key={item.name}
                to={item.href}
                className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                    active
                        ? "bg-brand-gold-50 text-brand-gold-600 font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
            >
                {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-gold-500" />
                )}
                <item.icon
                    className={cn(
                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                        active ? "text-brand-gold-500" : "text-gray-400 group-hover:text-gray-600"
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                />
                {item.name}
            </Link>
        );
    };

    const renderSection = (label: string, items: typeof mainNav) => (
        <div className="mb-2">
            <h3 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {label}
            </h3>
            <div className="space-y-0.5">
                {items.map(renderNavItem)}
            </div>
        </div>
    );

    return (
        <div className="flex h-full w-[252px] flex-col bg-white border-r border-gray-100 z-10">
            {/* Brand Header */}
            <div className="flex h-[72px] items-center gap-3 px-6 border-b border-gray-100 flex-shrink-0">
                <img src="/ahi-logo.svg" alt="Ahi Jewellery" className="h-[68px] w-auto shrink-0" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 leading-tight">Ahi Jewellery</span>
                    <span className="text-[10px] text-gray-400 font-medium">Admin Dashboard</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {renderSection("Main", mainNav)}
                {renderSection("Management", managementNav)}
                {renderSection("Content & Settings", contentNav)}
            </nav>

            {/* User Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 p-3">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 text-[11px] font-bold text-white flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-900 truncate">{user?.name || "Admin User"}</span>
                        <span className="text-[10px] text-gray-400 truncate">{user?.email || "admin@ahijewellery.com"}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Log out"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
