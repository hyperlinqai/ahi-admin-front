import api from "./axios";

// Raw API types matching backend response
export interface ProductVariant {
    id: string;
    name: string;
    value: string;
    sku: string;
    stock: number;
    lowStockAlert: number;
}

export interface InventoryProduct {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    category: { name: string };
    variants: ProductVariant[];
}

// Low-stock raw SQL result shape
export interface LowStockVariant {
    id: string;
    sku: string;
    stock: number;
    lowStockAlert: number;
    title: string;
}

// Flattened row for the UI table (one row per variant)
export interface InventoryRow {
    variantId: string;
    productId: string;
    productName: string;
    category: string;
    variantLabel: string;
    sku: string;
    stock: number;
    lowStockAlert: number;
    updatedAt: string;
}

export interface InventoryMeta {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface InventoryParams {
    page?: number;
    limit?: number;
    search?: string;
}

/** Flatten products → one row per variant for the table */
function flattenProducts(products: InventoryProduct[]): InventoryRow[] {
    const rows: InventoryRow[] = [];
    for (const p of products) {
        for (const v of p.variants) {
            rows.push({
                variantId: v.id,
                productId: p.id,
                productName: p.title,
                category: p.category?.name || "",
                variantLabel: v.name && v.value ? `${v.name}: ${v.value}` : "",
                sku: v.sku,
                stock: v.stock,
                lowStockAlert: v.lowStockAlert,
                updatedAt: p.updatedAt,
            });
        }
    }
    return rows;
}

/** Flatten low-stock raw rows */
function flattenLowStock(rows: LowStockVariant[]): InventoryRow[] {
    return rows.map((r) => ({
        variantId: r.id,
        productId: "",
        productName: r.title,
        category: "",
        variantLabel: "",
        sku: r.sku,
        stock: r.stock,
        lowStockAlert: r.lowStockAlert,
        updatedAt: "",
    }));
}

export const getInventory = async (params: InventoryParams) => {
    const { data } = await api.get("/admin/inventory", { params });
    return {
        rows: flattenProducts(data.data),
        meta: data.meta as InventoryMeta,
    };
};

export const getLowStock = async (params: InventoryParams) => {
    const { data } = await api.get("/admin/inventory/low-stock", { params });
    return {
        rows: flattenLowStock(data.data),
        meta: data.meta as InventoryMeta,
    };
};

export const updateStock = async (
    variantId: string,
    payload: { stock: number }
) => {
    const { data } = await api.patch(`/admin/inventory/${variantId}`, payload);
    return data;
};
