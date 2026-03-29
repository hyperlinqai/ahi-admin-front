export interface User {
    id: string;
    email: string;
    name: string | null;
    role: "USER" | "ADMIN";
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}
