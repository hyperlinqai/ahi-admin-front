import api from "./axios";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewImage {
    id: string;
    url: string;
    reviewId: string;
    createdAt: string;
}

export interface Review {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    status: ReviewStatus;
    productId: string;
    createdAt: string;
    updatedAt: string;
    user: { id: string; name: string | null; email: string };
    product: { id: string; title: string; slug: string };
    images: ReviewImage[];
}

export interface ReviewMeta {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ReviewParams {
    page?: number;
    limit?: number;
    status?: ReviewStatus | "";
    search?: string;
}

export const getAdminReviews = async (params: ReviewParams) => {
    const { data } = await api.get("/admin/reviews", { params });
    // response: { success, data: { reviews, meta } }
    return data.data as { reviews: Review[]; meta: ReviewMeta };
};

export const approveReview = async (productId: string, reviewId: string) => {
    const { data } = await api.patch(`/products/${productId}/reviews/${reviewId}/approve`);
    return data;
};

export const rejectReview = async (productId: string, reviewId: string) => {
    const { data } = await api.patch(`/products/${productId}/reviews/${reviewId}/reject`);
    return data;
};

export const deleteReview = async (productId: string, reviewId: string) => {
    const { data } = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return data;
};
