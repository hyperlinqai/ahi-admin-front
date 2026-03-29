import api from "./axios";
import { PaginationParams } from "../types";

export interface Coupon {
    id: string;
    code: string;
    type: "FLAT" | "PERCENTAGE" | "FREE_SHIPPING";
    discountValue: number;
    maxDiscount?: number | null;
    minOrderValue?: number | null;
    usageLimit?: number | null;
    usageCount: number;
    perUserLimit?: number | null;
    isActive: boolean;
    startDate?: string | null;
    expiresAt?: string | null;
}

export interface CouponUsage {
    id: string;
    orderId: string;
    orderNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    discountObtained: number;
    orderTotal: number;
    usedAt: string;
}

export interface CouponFilters extends PaginationParams {
    search?: string;
    status?: "active" | "upcoming" | "expired" | "";
    type?: "FLAT" | "PERCENTAGE" | "FREE_SHIPPING" | "";
}

export const getCoupons = async (params: CouponFilters) => {
    const { data } = await api.get("/coupons", { params });
    return data;
};

export const getCouponById = async (id: string) => {
    const { data } = await api.get(`/coupons/${id}`);
    return data;
};

export const createCoupon = async (couponData: Partial<Coupon>) => {
    const { data } = await api.post("/coupons", couponData);
    return data;
};

export const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    const { data } = await api.patch(`/coupons/${id}`, couponData);
    return data;
};

export const deleteCoupon = async (id: string) => {
    const { data } = await api.delete(`/coupons/${id}`);
    return data;
};

export const getCouponUsages = async (id: string, params: PaginationParams) => {
    const { data } = await api.get(`/coupons/${id}/usage`, { params });
    return data;
};
