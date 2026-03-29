import api from "./axios";

export type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReturnImage {
    id: string;
    url: string;
    returnId: string;
    createdAt: string;
}

export interface ReturnListItem {
    id: string;
    orderId: string;
    userId: string;
    reason: string;
    description: string | null;
    status: ReturnStatus;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
    user: { id: string; name: string | null; email: string };
    order: {
        id: string;
        orderNumber: string;
        total: number;
        paymentStatus: string;
        status: string;
    };
    images: ReturnImage[];
}

export interface OrderItem {
    id: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
}

export interface OrderAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
}

export interface ReturnDetail extends ReturnListItem {
    order: ReturnListItem["order"] & {
        subtotal?: number;
        discount?: number;
        items: OrderItem[];
        address: OrderAddress;
        payment: {
            id: string;
            razorpayPaymentId: string | null;
            amount: number;
            status: string;
        } | null;
        refunds: {
            id: string;
            amount: number;
            status: string;
            reason: string | null;
            createdAt: string;
        }[];
    };
}

export interface ReturnMeta {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ReturnParams {
    page?: number;
    limit?: number;
    status?: ReturnStatus | "";
    search?: string;
}

export const getReturns = async (params: ReturnParams) => {
    const { data } = await api.get("/returns", { params });
    // { success, data: { returns, meta } }
    return data.data as { returns: ReturnListItem[]; meta: ReturnMeta };
};

export const getReturnById = async (id: string) => {
    const { data } = await api.get(`/returns/${id}`);
    return data.data as ReturnDetail;
};

export const approveReturn = async (id: string) => {
    const { data } = await api.patch(`/returns/${id}/approve`);
    return data;
};

export const rejectReturn = async (id: string, adminNote: string) => {
    const { data } = await api.patch(`/returns/${id}/reject`, { adminNote });
    return data;
};

export const initiateRefund = async (orderId: string, amount?: number) => {
    const { data } = await api.post(`/payments/refund/${orderId}`, {
        amount,
        reason: "Customer return approved",
    });
    return data;
};
