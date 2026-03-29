import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, Bell, CheckCheck, Trash2, X } from "lucide-react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore, Notification } from "../../store/notificationStore";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/orders": "Orders",
    "/products": "Products",
    "/categories": "Categories",
    "/inventory": "Inventory",
    "/users": "Customers",
    "/coupons": "Coupons",
    "/reviews": "Reviews",
    "/returns": "Returns",
    "/banners": "Banners",
    "/cms": "CMS Pages",
    "/reports": "Reports",
    "/settings": "Settings",
};

const typeStyles: Record<Notification["type"], { dot: string; bg: string }> = {
    success: { dot: "bg-green-500", bg: "bg-green-50" },
    error: { dot: "bg-red-500", bg: "bg-red-50" },
    warning: { dot: "bg-amber-500", bg: "bg-amber-50" },
    info: { dot: "bg-blue-500", bg: "bg-blue-50" },
};

const Header = () => {
    const location = useLocation();
    const [showPicker, setShowPicker] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll, unreadCount, hasNewAlert } =
        useNotificationStore();

    const pickerRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (ranges: RangeKeyDict) => {
        setDateRange([ranges.selection as any]);
    };

    const formattedStart = format(dateRange[0].startDate || new Date(), "dd MMM yyyy");
    const formattedEnd = format(dateRange[0].endDate || new Date(), "dd MMM yyyy");

    let currentTitle = pageTitles[location.pathname] || "Dashboard";
    if (location.pathname.startsWith("/products/")) {
        currentTitle = "Products";
    } else if (location.pathname.startsWith("/orders/")) {
        currentTitle = "Orders";
    } else if (location.pathname.startsWith("/categories/")) {
        currentTitle = "Categories";
    } else if (location.pathname.startsWith("/settings")) {
        currentTitle = "Settings";
    } else if (location.pathname.startsWith("/cms/")) {
        currentTitle = "CMS Pages";
    }

    const count = unreadCount();

    return (
        <header className="flex h-16 items-center justify-between px-8 bg-white/80 backdrop-blur-sm z-10 w-full border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{currentTitle}</h2>

            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border bg-white transition-all ${
                            hasNewAlert
                                ? "border-brand-gold-300 text-brand-gold-600 shadow-md shadow-brand-gold-100"
                                : "border-gray-100 text-gray-400 hover:text-gray-700 hover:border-gray-200"
                        }`}
                    >
                        <motion.div
                            animate={hasNewAlert ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <Bell className="h-4 w-4" />
                        </motion.div>
                        {count > 0 && (
                            <motion.span
                                key={count}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ${
                                    hasNewAlert ? "bg-brand-gold-500" : "bg-red-500"
                                }`}
                            >
                                {count > 9 ? "9+" : count}
                            </motion.span>
                        )}
                        {/* Ripple ring when new alert arrives */}
                        {hasNewAlert && (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0.6 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                transition={{ duration: 1, repeat: 2 }}
                                className="absolute inset-0 rounded-xl bg-brand-gold-400/30 pointer-events-none"
                            />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 z-50 w-96 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                    <div className="flex items-center gap-1">
                                        {count > 0 && (
                                            <button
                                                onClick={() => markAllAsRead()}
                                                className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-brand-gold-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <CheckCheck className="h-3 w-3" />
                                                Mark all read
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={() => { clearAll(); setShowNotifications(false); }}
                                                className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="max-h-80 overflow-y-auto scrollbar-hide">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                                <Bell className="h-4 w-4 text-gray-300" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-500">No notifications yet</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Actions and updates will appear here.</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => {
                                            const styles = typeStyles[n.type];
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`group flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${
                                                        n.read ? "bg-white" : "bg-brand-gold-50/30"
                                                    } hover:bg-gray-50`}
                                                    onClick={() => markAsRead(n.id)}
                                                >
                                                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.read ? "bg-gray-200" : styles.dot}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-semibold ${n.read ? "text-gray-600" : "text-gray-900"} truncate`}>
                                                            {n.title}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all shrink-0 mt-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Date Range Picker */}
                <div className="relative" ref={pickerRef}>
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-200 hover:text-gray-800 transition-all"
                    >
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formattedStart} – {formattedEnd}
                    </button>

                    <AnimatePresence>
                        {showPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden glass-card shadow-lg border border-gray-100"
                            >
                                <DateRange
                                    ranges={dateRange}
                                    onChange={handleSelect}
                                    moveRangeOnFirstSelection={false}
                                    rangeColors={["#c49a3c"]}
                                    direction="horizontal"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
