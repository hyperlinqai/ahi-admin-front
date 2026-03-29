// ========== KPI Data ==========
export const kpiData = [
    {
        title: "TOTAL REVENUE",
        value: "₹18,45,230",
        change: "+12.5%",
        isPositive: true,
        icon: "indianRupee",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
    },
    {
        title: "TOTAL ORDERS",
        value: "1,284",
        change: "+8.2%",
        isPositive: true,
        icon: "shoppingBag",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
    },
    {
        title: "TOTAL CUSTOMERS",
        value: "3,562",
        change: "+5.1%",
        isPositive: true,
        icon: "users",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
    },
    {
        title: "TOTAL PRODUCTS",
        value: "486",
        change: "-2.4%",
        isPositive: false,
        icon: "package",
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
    },
];

// ========== Revenue Overview (Monthly) ==========
export const revenueOverviewData = [
    { name: "Jan", revenue: 820000 },
    { name: "Feb", revenue: 950000 },
    { name: "Mar", revenue: 1120000 },
    { name: "Apr", revenue: 780000 },
    { name: "May", revenue: 1350000 },
    { name: "Jun", revenue: 1580000 },
    { name: "Jul", revenue: 1240000 },
    { name: "Aug", revenue: 1680000 },
    { name: "Sep", revenue: 1450000 },
    { name: "Oct", revenue: 1920000 },
    { name: "Nov", revenue: 2100000 },
    { name: "Dec", revenue: 2450000 },
];

// ========== Order Status Breakdown ==========
export const orderStatusData = [
    { name: "Delivered", value: 542, color: "#10b981" },
    { name: "Processing", value: 318, color: "#3b82f6" },
    { name: "Shipped", value: 215, color: "#8b5cf6" },
    { name: "Pending", value: 127, color: "#f59e0b" },
    { name: "Cancelled", value: 82, color: "#ef4444" },
];

// ========== Recent Orders ==========
export const recentOrdersData = [
    {
        id: "AHI-10284",
        customer: "Priya Sharma",
        product: "Gold Necklace 22K — Lakshmi Collection",
        amount: "₹1,24,500",
        status: "Delivered",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        date: "09 Mar 2026",
    },
    {
        id: "AHI-10283",
        customer: "Rahul Mehta",
        product: "Diamond Stud Earrings — Sparkle Series",
        amount: "₹89,200",
        status: "Processing",
        statusColor: "bg-blue-50 text-blue-700 border-blue-200",
        date: "09 Mar 2026",
    },
    {
        id: "AHI-10282",
        customer: "Ananya Iyer",
        product: "Silver Anklet Pair — Traditional Ghungroo",
        amount: "₹4,800",
        status: "Shipped",
        statusColor: "bg-violet-50 text-violet-700 border-violet-200",
        date: "08 Mar 2026",
    },
    {
        id: "AHI-10281",
        customer: "Vikram Singh",
        product: "Gold Ring 18K — Solitaire Diamond",
        amount: "₹2,15,000",
        status: "Pending",
        statusColor: "bg-amber-50 text-amber-700 border-amber-200",
        date: "08 Mar 2026",
    },
    {
        id: "AHI-10280",
        customer: "Deepa Nair",
        product: "Platinum Chain — Infinity Link",
        amount: "₹67,350",
        status: "Delivered",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        date: "07 Mar 2026",
    },
    {
        id: "AHI-10279",
        customer: "Arjun Patel",
        product: "Gold Bangles Set — Bridal 22K",
        amount: "₹3,45,000",
        status: "Cancelled",
        statusColor: "bg-red-50 text-red-700 border-red-200",
        date: "07 Mar 2026",
    },
];

// ========== Top Selling Products ==========
export const topProductsData = [
    {
        name: "Gold Necklace 22K — Lakshmi Collection",
        category: "Necklaces",
        sold: 128,
        revenue: "₹45,12,000",
        image: "https://placehold.co/80x80/fef3c7/d97706?text=GN",
    },
    {
        name: "Diamond Stud Earrings — Sparkle Series",
        category: "Earrings",
        sold: 96,
        revenue: "₹28,64,800",
        image: "https://placehold.co/80x80/ede9fe/7c3aed?text=DE",
    },
    {
        name: "Gold Bangles Set — Bridal 22K",
        category: "Bangles",
        sold: 84,
        revenue: "₹38,22,000",
        image: "https://placehold.co/80x80/fef3c7/d97706?text=GB",
    },
    {
        name: "Platinum Chain — Infinity Link",
        category: "Chains",
        sold: 72,
        revenue: "₹15,48,400",
        image: "https://placehold.co/80x80/f1f5f9/475569?text=PC",
    },
    {
        name: "Silver Anklet Pair — Ghungroo",
        category: "Anklets",
        sold: 65,
        revenue: "₹3,12,000",
        image: "https://placehold.co/80x80/ecfdf5/059669?text=SA",
    },
];

// ========== Low Stock Alerts ==========
export const lowStockData = [
    { name: "Gold Ring 18K — Solitaire Diamond", sku: "AHI-R-1042", stock: 3, threshold: 10 },
    { name: "Diamond Pendant — Teardrop", sku: "AHI-P-2018", stock: 5, threshold: 10 },
    { name: "Gold Earrings — Jhumka Traditional", sku: "AHI-E-3055", stock: 2, threshold: 10 },
    { name: "Platinum Band — Classic Satin", sku: "AHI-B-4021", stock: 7, threshold: 10 },
    { name: "Silver Toe Ring Set", sku: "AHI-T-5009", stock: 4, threshold: 10 },
];
